import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scanAllSources } from '@/lib/vigilante/scanner'
import { analyzeResults } from '@/lib/vigilante/analyzer'
import { sendVigilanteEmail, sendTelegram } from '@/lib/vigilante/notifier'

export const maxDuration = 300

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Vercel Cron: GET con cabecera Authorization: Bearer CRON_SECRET
// También acepta POST con { secret } para ejecución manual desde admin
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runVigilante()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return runVigilante()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

async function runVigilante() {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  try {
    // 1. Escanear fuentes
    const scanResults = await scanAllSources()
    const totalResultados = scanResults.reduce((acc, s) => acc + s.resultados.length, 0)

    if (totalResultados === 0) {
      return NextResponse.json({ ok: true, mensaje: 'Sin resultados de búsqueda', cambios: 0 })
    }

    // 2. Analizar con Claude
    const cambiosAnalizados = await analyzeResults(scanResults)

    if (!cambiosAnalizados.length) {
      return NextResponse.json({ ok: true, mensaje: 'Sin cambios relevantes hoy', cambios: 0 })
    }

    // 3. Guardar en Supabase (solo los que no existen ya — deduplicar por título + fecha)
    const hoy = new Date().toISOString().split('T')[0]
    const { data: existentes } = await supabase
      .from('cambios_detectados')
      .select('titulo')
      .gte('fecha_deteccion', hoy)

    const titulosExistentes = new Set((existentes ?? []).map((e: { titulo: string }) => e.titulo))

    const nuevos = cambiosAnalizados.filter((c) => !titulosExistentes.has(c.titulo))

    if (nuevos.length > 0) {
      const rows = nuevos.map((c) => ({
        fuente: c.fuente,
        titulo: c.titulo,
        url: c.url ?? null,
        resumen: c.resumen,
        impacto_estimado: c.impacto_estimado,
        area_afectada: c.area_afectada,
        propuesta: c.propuesta,
        tipo_cambio: c.tipo_cambio,
        diff_propuesto: c.diff_propuesto ?? null,
        estado: 'analysed',
      }))

      await supabase.from('cambios_detectados').insert(rows)
    }

    // 4. Notificar
    if (nuevos.length > 0) {
      await Promise.allSettled([
        sendVigilanteEmail(nuevos, fecha),
        sendTelegram(nuevos),
      ])
    }

    return NextResponse.json({
      ok: true,
      mensaje: `Vigilante completado en ${Date.now() - startTime}ms`,
      cambios: nuevos.length,
      fuentes_escaneadas: scanResults.length,
      resultados_brutos: totalResultados,
    })
  } catch (err) {
    console.error('[vigilante] Error en cron:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
