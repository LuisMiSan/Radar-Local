# Project Journal — Radar Local

> Generado y mantenido por Sinapsis
> Proyecto: Radar Local | Inicio: 2026-03-08
> Ultima actualizacion: 2026-03-25

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

## Resumen ejecutivo

**Radar Local** es una plataforma SaaS de posicionamiento local (GEO/AEO/SEO) construida en 3 semanas. El sistema incluye:

- **Panel admin** con dashboard, pipeline CRM (9 estados), gestion de clientes, 11 agentes IA con supervisor, sistema HITL, control de gastos API y reportes mensuales
- **Journey publico** automatizado: landing → formulario auditoria → resultados con competidores → presupuesto con ROI → email profesional con PDFs adjuntos y CTA WhatsApp
- **Pipeline CRM automatico**: los leads del formulario publico se crean automaticamente en el pipeline y avanzan de estado al enviar presupuesto
- **Infraestructura**: Supabase (PostgreSQL), Vercel (produccion), GitHub (CI/CD), Resend (emails), Claude API (agentes)

**Estado actual**: Desplegado en produccion (https://radar-local.vercel.app). Pendiente integrar Google Places API para datos reales en auditorias. Demo de inversor programada para 26 marzo 2026.
