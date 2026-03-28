# Project Journal — Radar Local

> Generado y mantenido por Sinapsis
> Proyecto: Radar Local | Inicio: 2026-03-08
> Ultima actualizacion: 2026-03-28

## Stack

| Tecnologia | Version | Detectada por |
|-----------|---------|---------------|
| Next.js | 14.2 | package.json |
| TypeScript | 5.x | tsconfig.json |
| Supabase | PostgreSQL | @supabase/supabase-js |
| Tailwind CSS | 3.x | tailwind.config.ts |
| Claude API (Sonnet) | - | RADAR_ANTHROPIC_KEY |
| Resend | - | RESEND_API_KEY |
| jsPDF | - | package.json |
| Vercel | - | vercel.json / .vercel |

## Cronologia

### Semana 1 (2026-03-08 → 2026-03-09)

#### 2026-03-08
- **[STEP]** Inicializado proyecto con `create-next-app@latest` (Next.js 14, App Router, TypeScript, Tailwind)
- **[STEP]** Fase 1 completa: schema SQL (9 tablas), panel admin con 8 secciones, design system dark/light
- **[DECISION]** Usar App Router con route groups `(public)` y `(admin)` para separar flujos
  - *Razon*: Layouts independientes, middleware selectivo, mejor organizacion
  - *Alternativas descartadas*: Pages Router (legacy), monolito sin grupos

#### 2026-03-09
- **[STEP]** Fase 2: Implementados 11 agentes IA + supervisor con Claude API
- **[STEP]** Journey publico creado: landing → formulario auditoria → resultados → presupuesto
- **[DECISION]** Usar Claude Sonnet (no Opus) para los agentes
  - *Razon*: Coste 10x menor, velocidad, suficiente calidad para tareas de SEO/GBP
  - *Alternativas descartadas*: Claude Opus (demasiado caro para 11 agentes por cliente)
- **[DECISION]** Variable API nombrada RADAR_ANTHROPIC_KEY (no ANTHROPIC_API_KEY)
  - *Razon*: Evitar conflictos con Claude Code que usa la misma variable
- **[STEP]** Configurado netlify.toml con SSR plugin

### Semana 2 (2026-03-16 → 2026-03-22)

#### 2026-03-21
- **[STEP]** Fase 3: Sistema HITL (Human-In-The-Loop) completo
- **[STEP]** Tabla `tareas_ejecucion` para tareas ejecutables generadas por agentes
- **[STEP]** Panel de tareas con aprobacion/rechazo manual y ejecucion real via API
- **[DECISION]** Usar sistema HITL con aprobacion manual antes de ejecutar cambios en GBP
  - *Razon*: Los cambios en Google Business Profile son irreversibles, necesitan supervision humana
  - *Alternativas descartadas*: Ejecucion automatica (riesgo de dano al perfil del cliente)

### Semana 3 (2026-03-23 → 2026-03-25)

#### 2026-03-23
- **[STEP]** Fase 4: Migracion de audit.ts de in-memory a Supabase con fallback
- **[ERROR→FIX]** In-memory Map se reseteaba en cada HMR reload → patron `globalThis._radarAuditStore`
- **[ERROR→FIX]** RLS policy bloqueaba INSERT (codigo 42501) → crear politicas permisivas en `fix-auditorias-rls.sql`
- **[ERROR→FIX]** Error PGRST116 en `.single()` cuando no hay rows → usar `.maybeSingle()` con fallback
- **[STEP]** Email real con Resend: plantilla HTML profesional con auditoria + presupuesto
- **[STEP]** PDFs adjuntos generados con jsPDF (auditoria + presupuesto) enviados como attachments
- **[STEP]** Boton WhatsApp como CTA principal en el email
- **[DECISION]** Usar Resend (no SendGrid/Mailgun) para emails transaccionales
  - *Razon*: API simple, plantillas HTML nativas, precio competitivo, buena documentacion
  - *Alternativas descartadas*: SendGrid (complejo), Mailgun (pricing confuso)
- **[DECISION]** Generar PDFs en servidor con jsPDF (no html2pdf ni Puppeteer)
  - *Razon*: Sin dependencias de navegador, genera Buffer directo para adjuntar al email
  - *Alternativas descartadas*: Puppeteer (pesado, no funciona en serverless), html2pdf (requiere DOM)

#### 2026-03-24
- **[STEP]** GitHub conectado: repo privado `LuisMiSan/Radar-Local`
- **[STEP]** Deploy a produccion en Vercel: https://radar-local.vercel.app
- **[STEP]** 8 variables de entorno configuradas en Vercel
- **[STEP]** Test E2E completo en produccion: landing → auditoria → presupuesto → email con PDFs + WhatsApp
- **[ERROR→FIX]** Variable `auditUrl` no usada tras eliminar link → quitarla de destructuring para que compile
- **[STEP]** Copy de competidores actualizado: ahora son opcionales
- **[STEP]** Eliminado link "Ver auditoria online" del email (redundante con PDF adjunto)
- **[STEP]** Documentacion Fase 5 añadida a Notion
- **[STEP]** Pendientes actualizados en Notion (deploy marcado como completado)

#### 2026-03-25
- **[STEP]** Instalado Sinapsis (sistema de aprendizaje continuo) global + proyecto
- **[STEP]** Verificado que pipeline CRM se actualiza correctamente con leads del formulario publico
- **[STEP]** Confirmado: `createLeadFromAudit` crea lead en tabla `clientes` con estado 'lead' al completar auditoria
- **[STEP]** Confirmado: al enviar presupuesto, lead avanza a 'propuesta_enviada' en pipeline
- **[DECISION]** Integrar Google Places API para datos reales en auditoria (pendiente — requiere API Key)
  - *Razon*: Actualmente la auditoria usa datos simulados, necesita datos reales para produccion
  - *Alternativas descartadas*: Scraping (violacion TOS), datos estaticos (no escalable)

### Semana 4 (2026-03-26 → 2026-03-29)

#### 2026-03-26
- **[STEP]** Fase 6: Sistema de autonomia inteligente para agentes (3 niveles)
- **[STEP]** Nuevo tipo `NivelAutonomia`: auto_ejecutar | notificar | aprobar
- **[STEP]** Mapeo de campos GBP a niveles de autonomia (AUTONOMIA_POR_CAMPO)
- **[STEP]** Helper `getNivelAutonomia()` determina nivel segun tipo + campo + prioridad
- **[STEP]** `guardarTareasGeneradas()` ahora auto-aprueba tareas segun nivel de autonomia
- **[STEP]** Nuevo motor de ejecucion: `lib/task-executor.ts` con ejecutores por campo GBP
- **[STEP]** API routes: `/api/tasks/execute` (cola) y `/api/tasks/approve` (HITL)
- **[STEP]** Tabla `notificaciones` para avisar al admin de ejecuciones automaticas (nivel notificar)
- **[STEP]** Prompts de 7 agentes actualizados con campo_gbp correcto para autonomia
- **[STEP]** Google Places API integrada en auditorias (datos reales de negocios)
- **[DECISION]** Sistema de 3 niveles de autonomia en vez de HITL total
  - *Razon*: Con 200 clientes, aprobar TODO manualmente no escala. Auto-ejecutar lo seguro, aprobar solo lo critico.
  - *Alternativas descartadas*: HITL total (no escalable), full auto (riesgo alto en cambios criticos)
- **[DECISION]** Mapear autonomia por campo_gbp (no por agente)
  - *Razon*: Un mismo agente puede generar tareas de distinto riesgo. El campo afectado determina el riesgo, no el agente.
  - *Alternativas descartadas*: Por agente (impreciso), por prioridad sola (no captura el riesgo del campo)
- **[DECISION]** Motor de ejecucion con ejecutores placeholder (preparado para GBP API)
  - *Razon*: La GBP API esta bloqueada por cuota de Google. Los ejecutores simulan la ejecucion pero la arquitectura esta lista para conectar la API real.
  - *Alternativas descartadas*: Esperar a tener la API (retrasa desarrollo), mock sin arquitectura (hay que rehacer)

#### 2026-03-27
- **[STEP]** Revision de seguridad: RLS policies actualizadas en Supabase (6 de 7 tablas protegidas)
- **[STEP]** Migracion SQL de notificaciones ejecutada
- **[STEP]** Audit writes cambiados de `supabase` (anon) a `supabaseAdmin` (service_role) para fix RLS
- **[STEP]** Google Places API cost tracking: cada llamada se registra en `uso_api` ($0.032/request)
- **[STEP]** Notion: reescrita pagina principal como presentacion profesional (para inversores/equipo)
- **[STEP]** Notion: creada pagina cliente "Para Clientes — Como Trabajamos" (sin jerga tecnica)
- **[STEP]** Notion: limpieza de datos sensibles en 8+ subpaginas (env vars, ports, IDs, file paths)
- **[STEP]** Deploy produccion via `npx vercel --prod` (GitHub deploys iban como preview, no production)
- **[ERROR→FIX]** RLS bloqueaba INSERT en auditorias → cambiar a supabaseAdmin (service_role)
- **[ERROR→FIX]** Vercel deploys de GitHub eran "preview" (target: null) no "production" → deploy manual
- **[ERROR→FIX]** Nombre competidores mostraba URLs de Google Maps → fix en buildCompetitor (parcial)
- **[GOTCHA]** Supabase "leaked password protection" solo disponible en plan Pro

#### 2026-03-28
- **[STEP]** Fix definitivo nombres competidores: funcion `cleanCompetitorName()` en audit.ts
- **[STEP]** Nuevo campo `google_maps_url` en CompetidorAuditoria para URLs reales de Maps
- **[STEP]** Frontend usa `googleMapsUri` real de la API (no construye URLs artificiales)
- **[STEP]** Logging debug en `normalizePlaceData` y `runAudit` para diagnosticar API response
- **[STEP]** Rediseno completo email auditoria+presupuesto: HTML con tables, circulos de puntuacion, badges de impacto
- **[STEP]** Safety net `cleanName()` en email.ts para limpiar nombres URL de auditorias antiguas
- **[STEP]** Deploy a produccion via GitHub push → Vercel auto-deploy
- **[STEP]** Analisis agente NAP: confirmado que es simulacion pura (mock data o Claude estimando)
- **[ERROR→FIX]** Nombres competidores en email seguian siendo URLs → cleanName() + rediseno template
- **[ERROR→FIX]** Links Google Maps en email no correspondian a negocios reales → usar googleMapsUri de API
- **[DECISION]** Rediseno email con tables HTML (no flexbox/div)
  - *Razon*: Gmail y Outlook no soportan flexbox en emails. Tables son el estandar para email HTML.
  - *Alternativas descartadas*: CSS moderno con flexbox (incompatible), frameworks email como MJML (dependencia extra)

## Decisiones de arquitectura

| Fecha | Decision | Razon | Alternativas |
|-------|----------|-------|-------------|
| 2026-03-08 | App Router + route groups (public)/(admin) | Layouts independientes, middleware selectivo | Pages Router |
| 2026-03-09 | Claude Sonnet para agentes (no Opus) | Coste 10x menor, velocidad suficiente | Claude Opus |
| 2026-03-09 | RADAR_ANTHROPIC_KEY como variable | Evitar conflicto con Claude Code | ANTHROPIC_API_KEY |
| 2026-03-21 | HITL con aprobacion manual | Cambios GBP irreversibles | Ejecucion automatica |
| 2026-03-23 | Supabase con fallback in-memory | Persistencia real + funciona sin BD | Solo Supabase, solo in-memory |
| 2026-03-23 | Resend para emails | API simple, plantillas HTML nativas | SendGrid, Mailgun |
| 2026-03-23 | jsPDF servidor (no Puppeteer) | Sin DOM, Buffer directo, serverless OK | Puppeteer, html2pdf |
| 2026-03-24 | Vercel para deploy | Integracion nativa Next.js, deploys automaticos | Netlify, Railway |
| 2026-03-25 | Google Places API para datos reales | Necesidad de datos verificables | Scraping, datos estaticos |
| 2026-03-26 | 3 niveles autonomia (no HITL total) | Escalabilidad 200+ clientes | HITL total, full auto |
| 2026-03-26 | Autonomia por campo_gbp (no por agente) | Mismo agente puede tener riesgo variable | Por agente, por prioridad |
| 2026-03-26 | Ejecutores placeholder para GBP API | API bloqueada, arquitectura lista | Esperar API, mock sin arquitectura |
| 2026-03-28 | Tables HTML para emails (no flexbox) | Gmail/Outlook no soportan flexbox | CSS moderno, MJML |

## Gotchas encontrados

| Fecha | Gotcha | Solucion |
|-------|--------|----------|
| 2026-03-23 | In-memory Map se resetea en HMR | Patron `globalThis._radarAuditStore` |
| 2026-03-23 | RLS 42501 bloquea INSERT | Crear politicas permisivas con `USING (true)` |
| 2026-03-23 | PGRST116 en `.single()` sin rows | Usar `.maybeSingle()` + fallback |
| 2026-03-23 | `.next` cache corrupto → "missing error components" | `rm -rf .next` y rebuild |
| 2026-03-23 | CSS no carga tras cambios | Hard refresh `Ctrl+Shift+R` (cache navegador) |
| 2026-03-23 | preview_start no funciona en Windows | Usar `npx next dev` manual en terminal |
| 2026-03-23 | python3 no disponible en Windows | Usar `node -e` para parsing JSON |
| 2026-03-24 | Variable no usada rompe build Vercel | Eliminar de destructuring |
| 2026-03-24 | `.vercel` duplicado en .gitignore | Limpiar duplicado |
| 2026-03-27 | RLS bloquea INSERT con cliente anon | Usar supabaseAdmin (service_role) |
| 2026-03-27 | GitHub deploys van como preview | Deploy manual con `vercel --prod` |
| 2026-03-27 | Leaked password protection solo Pro | Documentar, no se puede activar |
| 2026-03-28 | Nombres competidores son URLs de Maps | cleanCompetitorName() + cleanName() |
| 2026-03-28 | Gmail/Outlook no soportan flexbox | Usar tables HTML en emails |

## Resumen ejecutivo

**Radar Local** es una plataforma SaaS de posicionamiento local (GEO/AEO/Map Pack) construida en 3 semanas. El sistema incluye:

- **Panel admin** con dashboard, pipeline CRM (9 estados), gestion de clientes, 11 agentes IA con supervisor, sistema de autonomia inteligente (3 niveles), control de gastos API y reportes mensuales
- **Journey publico** automatizado: landing → formulario auditoria → resultados con competidores reales (Google Places API) → presupuesto con ROI → email profesional con PDFs adjuntos y CTA WhatsApp
- **Pipeline CRM automatico**: los leads del formulario publico se crean automaticamente en el pipeline y avanzan de estado al enviar presupuesto
- **Sistema de autonomia**: Las tareas de bajo riesgo (posts, schemas, FAQs) se auto-ejecutan. Las de riesgo medio se ejecutan y notifican. Las criticas (nombre, direccion, resenas negativas) esperan aprobacion humana.
- **Infraestructura**: Supabase (PostgreSQL), Vercel (produccion), GitHub (CI/CD), Resend (emails), Claude API (agentes), Google Places API (datos reales)

**Estado actual**: Desplegado en produccion (https://radar-local.vercel.app). Google Places API integrada con datos reales y tracking de costes. Auditorias muestran competidores reales con nombres y enlaces correctos de Google Maps. Email profesional rediseñado con compatibilidad Gmail/Outlook. Sistema de autonomia implementado. Los 11 agentes funcionan como framework (orquestacion, tareas, autonomia) pero su logica de negocio es simulada — necesitan integracion con APIs externas reales. Pendiente: conectar GBP API cuando Google apruebe cuota, hacer agentes funcionales con datos reales, resolver 9 vulnerabilidades Dependabot.
