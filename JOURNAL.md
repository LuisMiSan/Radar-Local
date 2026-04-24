# Project Journal — Radar Local

> Generado y mantenido por Sinapsis
> Proyecto: Radar Local | Inicio: 2026-03-08
> Ultima actualizacion: 2026-04-01

## Stack

| Tecnologia | Version | Detectada por |
|-----------|---------|---------------|
| Next.js | 15.5 | package.json |
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
| 2026-03-30 | NotebookLM sync manual (no cron) | No tiene API pública, solo MCP en sesión | Cron automático, webhooks |
| 2026-04-01 | Next.js 15.5.14 (no 16) | Resuelve 4 CVEs high sin breaking change mayor | Next.js 16, quedarse en 14 |

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
| 2026-03-29 | NotebookLM auth expiraba repetidamente | Usar notebooklm-mcp-auth.exe con ruta completa |
| 2026-03-29 | Policy RLS ya existente al re-ejecutar SQL | DROP POLICY IF EXISTS antes de CREATE |
| 2026-03-31 | Regex flag `s` no disponible sin ES2018 target | Usar `[\s\S]` en vez de `.` con flag `s` |
| 2026-04-01 | Next.js 15: params es Promise | Añadir `await params` en routes y pages |
| 2026-04-01 | Next.js 15: cookies() es Promise | Añadir `await cookies()` en server code |

### Semana 4 (2026-03-29)

#### 2026-03-29
- **[STEP]** Sistema de memoria de agentes: tabla `agent_memory`, funciones loadAgentMemory/saveAgentMemory/evaluarImpacto
- **[STEP]** Página Memoria IA (`/admin/historial`) con timeline expandible y reportes completos
- **[STEP]** Librería de Contenido: tabla `contenido_generado`, página `/admin/contenido` con stats y filtros
- **[STEP]** Pipeline de Voz: ejecución secuencial de 5 agentes (FAQ → Chunks → TL;DR → Schema → Monitor)
- **[STEP]** Edición inline de contenido antes de publicar (editar, descartar, copiar, marcar publicado)
- **[STEP]** Base de conocimiento `gemini-voice-search.md` creada y enriquecida con 8 notebooks de NotebookLM
- **[STEP]** Conexión NotebookLM establecida (94 notebooks accesibles)
- **[STEP]** Prompts de voz reescritos para los 5 agentes de voz con foco en lenguaje conversacional
- **[STEP]** Perfil de Bing Places creado para IA Division Lab (visibilidad en ChatGPT/Perplexity)
- **[DECISION]** Memoria estructurada en Supabase (no RAG/vectores) — más simple, eficiente en tokens
  - *Razon*: Pocos datos por agente, formateo como texto plano en prompt, sin overhead de embeddings
- **[DECISION]** Knowledge files en .md cargados en memoria y cacheados, asignados por agente
  - *Razon*: Económico en tokens (se carga solo el archivo relevante), fácil de actualizar
- **[COST]** Pipeline de Voz x2 ejecuciones: ~$0.44 total (5 agentes x 2)

### Semana 5 (2026-03-30 → 2026-04-01)

#### 2026-03-30
- **[STEP]** NotebookLM sync bidireccional: módulo `lib/notebooklm-sync.ts` con push/pull tracking
- **[STEP]** Tabla `notebooklm_sync` en Supabase para registro de sincronizaciones
- **[STEP]** API `/api/notebooklm` con endpoints GET (status/preview) y POST (record sync)
- **[STEP]** Push de 36 contenidos de IA Division Lab a NotebookLM (registrado en Supabase)
- **[STEP]** Botón NotebookLM en página Contenido con badge de pendientes y preview panel
- **[DECISION]** NotebookLM sync manual desde Claude Code (no automatizable)
  - *Razon*: NotebookLM no tiene API pública — solo funciona via MCP en sesión activa de Claude Code
  - *Alternativas descartadas*: Cron automático (imposible sin API), webhooks (no existen)

#### 2026-03-31
- **[STEP]** Export HTML para web: `lib/export-web.ts` genera HTML completo con schemas JSON-LD + FAQs + TL;DR
- **[STEP]** API `/api/contenido/export-web` con soporte format=raw para descarga directa
- **[STEP]** Botón Export HTML en página Contenido con preview, copiar y descargar
- **[STEP]** FAQs como `<details><summary>` accordion nativo, schemas como `<script type="application/ld+json">`
- **[STEP]** Dashboard admin reescrito completo: Client Component con Recharts
- **[STEP]** Dashboard: 5 KPIs, 4 métricas de voz, AreaChart evolución, PieChart distribución, BarChart costes API
- **[STEP]** Dashboard: barras cobertura por plataforma IA, actividad reciente, acciones rápidas
- **[STEP]** Dashboard: footer con estado sync NotebookLM
- **[STEP]** API `/api/admin/dashboard` con 6 queries paralelas a Supabase
- **[ERROR→FIX]** Regex flag `s` no disponible sin ES2018 → usar `[\s\S]` en export-web.ts
- **[ERROR→FIX]** Tooltip Recharts: tipo formatter incompatible → usar `(v)` con `Number(v).toFixed(4)`

#### 2026-04-01
- **[STEP]** Portal del cliente mejorado: sección "Contenido optimizado para IA"
- **[STEP]** Portal: 4 KPIs de contenido (FAQs, chunks, schemas, TL;DR) con componente ContentKpi
- **[STEP]** Portal: card explicativa sobre optimización para asistentes de voz
- **[STEP]** Portal: barras de cobertura por plataforma IA (Gemini, ChatGPT, Google, Siri)
- **[STEP]** Portal: lista colapsable de contenidos generados (ContentList) con badges de tipo
- **[STEP]** API portal actualizada para incluir contenidoStats y contenidos en respuesta
- **[STEP]** **Upgrade Next.js 14.2.35 → 15.5.14**: 0 vulnerabilidades (antes: 4 high)
- **[STEP]** Migración Next.js 15: `params` ahora es Promise (7 archivos actualizados)
- **[STEP]** Migración Next.js 15: `cookies()` ahora es Promise (2 archivos)
- **[STEP]** Migración Next.js 15: `createSupabaseServer()` ahora async (3 callers)
- **[DECISION]** Upgrade a Next.js 15 (no 16) para resolver vulnerabilidades
  - *Razon*: Las 4 CVEs afectan hasta next@15.5.13, por lo que 15.5.14 las resuelve sin saltar a v16
  - *Alternativas descartadas*: Next.js 16 (breaking change mayor innecesario), quedarse en 14 (4 CVEs high)

### Semana 6 (2026-04-05)

#### 2026-04-05
- **[STEP]** Landing page reescrita: hero con video background, trust bar, como funciona, auditoria con dictado por voz, stats, pricing 2 planes, testimonios, FAQs accordion, CTA, footer
- **[STEP]** Admin panel Landing Page (`/admin/landing`): 4 tabs (Hero, Planes, Testimonios, FAQs) con CRUD completo
- **[STEP]** API `/api/landing-config`: GET/POST con upsert en tabla `configuracion` de Supabase
- **[STEP]** Sidebar admin: entrada "Landing Page" con icono Palette
- **[STEP]** SQL migration `supabase/migration-configuracion.sql` para tabla `configuracion` (clave/valor JSON)
- **[STEP]** Onboarding automatizado: `lib/onboarding.ts` ejecuta 4 pasos al pasar cliente a "activo"
  - Paso 1: Crear perfil GBP (nueva funcion `createProfile()` en profiles.ts)
  - Paso 2: Primera ejecucion del supervisor (11 agentes)
  - Paso 3: Generar portal con token HMAC
  - Paso 4: Enviar email de bienvenida con link al portal
- **[STEP]** Hook en `updateClientStatus()`: trigger asincrono de onboarding cuando estado → activo
- **[STEP]** Pagina `/pricing` con comparativa visual detallada de los 2 packs
  - Cards de plan con features, "no incluido", resultados estimados, CTAs
  - Tabla comparativa por categorias (Diagnostico, Engagement, GEO/AEO, Crecimiento)
  - Seccion "Como empezamos" (3 pasos), garantias, FAQs, CTA final
- **[DECISION]** Onboarding asincrono (no bloquea respuesta API)
  - *Razon*: El supervisor tarda minutos en ejecutar 11 agentes, no se puede hacer sync
  - *Alternativas descartadas*: Sync (timeout API), queue system (overengineering para MVP)
- **[DECISION]** Landing config dinamica via tabla `configuracion` (JSON)
  - *Razon*: Permite editar contenido desde admin sin tocar codigo
  - *Alternativas descartadas*: Hardcoded (no editable), CMS externo (dependencia)

### Semana 7 (2026-04-23 → 2026-04-24)

#### 2026-04-24
- **[STEP]** Rotación completa de API keys tras breach Vercel del 19/04:
  - Supabase: migración a nuevas keys `sb_publishable_*` + `sb_secret_*` (formato nuevo). Legacy `anon`/`service_role` deshabilitadas.
  - Anthropic (`RADAR_ANTHROPIC_KEY`): key antigua revocada, nueva `radar-local-prod` creada.
  - Resend (`RESEND_API_KEY`): rotada.
  - Google OAuth (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`): rotados.
  - Google Places (`GOOGLE_PLACES_API_KEY`): rotada.
  - `PORTAL_SECRET`: regenerado localmente con 32 bytes hex.
  - Sincronización: `.env.local` + Vercel env (production) para todas.
- **[STEP]** Fix tipo `AgentCard` — añadidos `asyncExecution` y `pollingEndpoint` opcionales en `capabilities` (lib/a2a/types.ts) para que compile `/.well-known/agent.json`.
- **[STEP]** Migration `migration-configuracion.sql` hecha idempotente (DROP POLICY/TRIGGER IF EXISTS antes de CREATE).
- **[STEP]** Redeploy Vercel producción con nuevas keys — status READY.
- **[DECISION]** Opción segura futura: editar `.env.local` directamente + `vercel env add` interactivo en terminal local. Nunca pegar keys en chat con Claude.
- **[REQUIRES]** Re-rotación final recomendada (las keys actuales pasaron por chat durante el proceso).

#### 2026-04-23
- **[STEP]** Protocolo Agent2Agent (A2A) implementado en 4 fases completas:
  - **Fase 1** — AgentCard pública (`/.well-known/agent.json`) + endpoints A2A: POST `/api/a2a/tasks` (supervisor) y `/api/a2a/agents/[agentId]/tasks` (agente individual)
  - **Fase 2** — Monitor externo con datos reales: `lib/a2a/external-monitor.ts` verifica presencia en Perplexity, Brave Search y Bing en paralelo, con fallback a inferencia. Cliente A2A (`lib/a2a/client.ts`) con registry de agentes externos y override por env vars.
  - **Fase 3** — Supervisor reescrito con ejecución paralela: 4 grupos paralelos (antes 12 llamadas serie). Concurrencia máxima de 3 llamadas simultáneas para respetar rate limits.
    - Grupo 1 (paralelo): auditor_gbp, optimizador_nap, prospector_web, gestor_resenas, tldr_entidad, monitor_ias
    - Grupo 2 (paralelo): keywords_locales, generador_schema
    - Grupo 3 (paralelo): redactor_posts_gbp, creador_faq_geo, generador_chunks
    - Grupo 4 (serie): generador_reporte
  - **Fase 4** — White label API con autenticación: API keys formato `rl_*`, rate limiting en memoria, endpoint admin `/api/admin/a2a-keys` (CRUD), acepta clienteId existente o datos crudos (crea cliente temporal)
- **[STEP]** Async tasks para fix timeout Vercel: POST devuelve 202 inmediatamente + worker interno en `/api/a2a/tasks/[taskId]/run` con maxDuration=300. Polling de estado via `/api/a2a/tasks/[taskId]`
- **[STEP]** Migraciones SQL: `a2a_api_keys` y `a2a_tasks` con RLS
- **[STEP]** npm audit fix: vulnerabilidades reducidas (3 moderate restantes requieren breaking change en resend — no aplicables sin --force)
- **[DECISION]** Supervisor paralelo con concurrencia máxima 3 (no ilimitada)
  - *Razon*: Anthropic rate limits — demasiadas llamadas simultáneas generan 429. 3 es el sweet spot entre velocidad y estabilidad.
  - *Alternativas descartadas*: Todo paralelo (rate limit errors), todo serie (lento, ~8 min)
- **[DECISION]** Async tasks con worker interno (no queue externa como BullMQ)
  - *Razon*: Vercel tiene timeout de 60s en funciones serverless. El worker usa maxDuration=300. Sin infraestructura adicional.
  - *Alternativas descartadas*: Queue externa (dependencia), Vercel Cron (solo triggered, no on-demand)
- **[REQUIRES]** Nueva env var `A2A_INTERNAL_SECRET` en Vercel y `.env.local`
- **[REQUIRES]** Ejecutar migrations SQL en Supabase: `20260423_a2a_api_keys.sql` y `20260423_a2a_tasks.sql`

## Tareas pendientes

| Prioridad | Tarea | Detalle |
|-----------|-------|---------|
| Alta | Publicación automática en GBP | Cuando Google apruebe cuota API, conectar publicación directa de posts, FAQs y fotos |
| Alta | Publicación automática en web | Integrar con CMS del cliente para inyectar schemas, FAQs y chunks |
| Media | Agentes auto-ejecutan todo | Pipeline de voz publique automáticamente (GBP + web) sin intervención |
| ~~Resuelto~~ | ~~Ejecutar migration-configuracion.sql~~ | ~~Tabla `configuracion` creada en Supabase~~ |
| ~~Resuelto~~ | ~~Ejecutar migrations A2A en Supabase~~ | ~~`a2a_api_keys` y `a2a_tasks` creadas en Supabase — 2026-04-24~~ |
| ~~Resuelto~~ | ~~Añadir A2A_INTERNAL_SECRET en Vercel~~ | ~~Añadida via CLI a production — 2026-04-24~~ |
| ~~Resuelto~~ | ~~Rotar todas las API keys (breach Vercel)~~ | ~~Hecho 2026-04-24 — Supabase, Anthropic, Resend, Google, PORTAL_SECRET~~ |
| Media | Re-rotación privada de keys | Las actuales pasaron por chat; rotar 1 vez más sin exponer en conversación |
| ~~Resuelto~~ | ~~Vulnerabilidades uuid/svix/resend~~ | ~~Override uuid@14.0.0 en package.json. 0 vulnerabilidades. 2026-04-24~~ |
| Baja | System prompts de voz | Reescribir prompts genéricos → específicos para búsqueda por voz |
| ~~Resuelto~~ | ~~Vulnerabilidades npm~~ | ~~4 high → 0 con upgrade Next.js 15.5.14~~ |
| ~~Resuelto~~ | ~~NotebookLM sync~~ | ~~Funciona como rutina nocturna manual desde Claude Code~~ |
| ~~Resuelto~~ | ~~Onboarding manual~~ | ~~Automatizado: GBP + supervisor + portal + email al pasar a activo~~ |

## Resumen ejecutivo

**Radar Local** es una plataforma SaaS de posicionamiento local (GEO/AEO/Map Pack) construida en 3 semanas. El sistema incluye:

- **Panel admin** con dashboard, pipeline CRM (9 estados), gestion de clientes, 11 agentes IA con supervisor, sistema de autonomia inteligente (3 niveles), control de gastos API y reportes mensuales
- **Journey publico** automatizado: landing → formulario auditoria → resultados con competidores reales (Google Places API) → presupuesto con ROI → email profesional con PDFs adjuntos y CTA WhatsApp
- **Pipeline CRM automatico**: los leads del formulario publico se crean automaticamente en el pipeline y avanzan de estado al enviar presupuesto
- **Sistema de autonomia**: Las tareas de bajo riesgo (posts, schemas, FAQs) se auto-ejecutan. Las de riesgo medio se ejecutan y notifican. Las criticas (nombre, direccion, resenas negativas) esperan aprobacion humana.
- **Infraestructura**: Supabase (PostgreSQL), Vercel (produccion), GitHub (CI/CD), Resend (emails), Claude API (agentes), Google Places API (datos reales)

**Estado actual**: Desplegado en produccion (https://radar-local.vercel.app). Next.js 15.5.14. Protocolo A2A completo: AgentCard pública, endpoints para agentes externos, supervisor paralelo (4 grupos, concurrencia 3), white label API con auth `rl_*`, async tasks con polling para evitar timeouts de Vercel. Monitor externo verifica presencia real en Perplexity/Brave/Bing. Onboarding automatizado al pasar a "activo". Landing con admin panel. Pagina /pricing. Migrations A2A ejecutadas en Supabase. A2A_INTERNAL_SECRET en Vercel production. ⚠️ Pendientes: re-rotación privada de keys (las actuales pasaron por chat), 3 vulnerabilidades moderate (resend@6.1.3 — breaking change, pospuesto).
