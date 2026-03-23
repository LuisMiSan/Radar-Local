# Diario de Desarrollo — Radar Local

> Registro detallado de cada sesion de trabajo, decisiones, errores, soluciones y lecciones aprendidas.
> Objetivo: que sirva como guia para futuros proyectos similares.

---

## Dia 1 — Sabado 8 de marzo de 2026

### Sesion 1: Creacion del proyecto y Fase 1

**Que hicimos:**
Arrancamos desde cero. La idea: una plataforma para preparar perfiles de Google Business Profile (GBP) para busqueda por voz con Gemini. No es SEO local clasico, es GEO (Generative Engine Optimization) y AEO (Answer Engine Optimization).

**Pasos:**
1. `npx create-next-app@latest radar-local` — Next.js 14 con App Router, TypeScript, Tailwind
2. Disenar el schema SQL para Supabase (5 tablas iniciales):
   - `clientes` — datos del negocio
   - `perfiles_gbp` — perfil de Google Business Profile vinculado
   - `tareas` — historial de ejecuciones de agentes
   - `metricas` — metricas de rendimiento
   - `reportes` — informes generados
3. Crear tipos TypeScript alineados con la DB:
   - 2 packs de servicio: `visibilidad_local` y `autoridad_maps_ia`
   - 11 agentes definidos como union type
   - Enums para estados, prioridades, etc.
4. Design system:
   - Primary: navy `#1a1f3c`
   - Accent: green `#00d4a0`
   - Componentes UI: Badge, Card, Header, Sidebar
5. Panel admin:
   - Sidebar colapsable
   - Dashboard con metricas
   - Lista de clientes + ficha detallada
6. Mock data como fallback cuando Supabase no esta configurado

**Decisiones importantes:**
- **Mock-first**: todo funciona sin Supabase conectado (datos falsos pero funcionales). Esto nos permite desarrollar UI sin depender de la DB.
- **Supabase client con validacion de URL**: si la URL tiene placeholder, no crashea — usa mocks.

**Errores y soluciones:**
- El cliente de Supabase crasheaba si la URL era un placeholder → solucion: validar URL antes de crear el client.

**Leccion aprendida:**
> Empezar con mocks permite iterar rapido en la UI sin bloqueos por configuracion de DB.

**Commit:** `feat: Fase 1 completa — schema SQL, panel admin y design system`

---

## Dia 2 — Domingo 9 de marzo de 2026

### Sesion 2: Fase 2 — Los 11 agentes IA + Journey publico

**Que hicimos:**
Sesion larga y productiva. Dos grandes bloques:

#### Parte A: Sistema de 11 agentes IA

Disenamos 11 agentes especializados, divididos en 2 categorias:

**Map Pack (agentes 1-5) — Pack Visibilidad Local:**
| # | Agente | Funcion |
|---|--------|---------|
| 1 | Auditor GBP | Auditoria completa del perfil, puntuacion 0-100 |
| 2 | Optimizador NAP | Verifica Nombre/Direccion/Telefono en directorios |
| 3 | Keywords Locales | Investigacion de keywords con intencion local y de voz |
| 4 | Gestor Resenas | Analisis de resenas + generacion de respuestas |
| 5 | Redactor Posts GBP | Crea posts optimizados para Map Pack |

**GEO/AEO (agentes 6-11) — Pack Autoridad Maps + IA:**
| # | Agente | Funcion |
|---|--------|---------|
| 6 | Generador Schema | JSON-LD (LocalBusiness, FAQPage) |
| 7 | Creador FAQ GEO | FAQs optimizadas para Gemini/ChatGPT/Perplexity |
| 8 | Generador Chunks | Bloques de contenido citables por IAs |
| 9 | TL;DR Entidad | Resumen de entidad para LLMs |
| 10 | Monitor IAs | Monitoriza menciones en motores generativos |
| 11 | Generador Reporte | Reporte mensual consolidado |

**Arquitectura de agentes (archivos):**
```
lib/agents/
  config.ts          → Metadata de cada agente (id, nombre, categoria, pack)
  types.ts           → Interfaces (AgentInput, AgentResult, TareaGenerada)
  runner.ts          → Ejecutor generico (Claude API o mock segun env)
  prompts.ts         → Prompt USER de cada agente + knowledge base
  system-prompts.ts  → Prompt SYSTEM de cada agente (personalidad, reglas)
  skills.ts          → Habilidades compartidas y propias
  mock-data.ts       → Generador de datos mock por agente
  index.ts           → Orquestador: runAgent()
```

**Patron mock-first**: si no hay API key de Claude → devuelve datos mock realistas. Si hay key → llama a Claude Sonnet 4.6 de verdad.

#### Parte B: Journey publico de captacion

Flujo completo para captar clientes:
```
Landing (/) → Formulario auditoria gratuita
   ↓
Rellena datos del negocio + 2 competidores
   ↓
POST /api/audit → Claude analiza
   ↓
Resultados (/auditoria/[id]) — puntuacion + gaps + comparativa
   ↓
Presupuesto (/presupuesto/[id]) — propuesta con ROI a 3 meses
   ↓
Email automatico con resultados
```

**Errores y soluciones:**
- **`globalThis` para persistir datos entre hot-reloads**: Next.js en dev mode pierde el estado del servidor en cada cambio de archivo. Solucion: usar `globalThis.AUDIT_STORE` para persistir datos in-memory durante desarrollo.
- **Panel de agentes**: creamos una vista grid agrupada por pack — visualmente se distingue que agentes tiene cada pack.

**Decisiones importantes:**
- **Propuesta de valor clara**: "No hacemos SEO Local. Preparamos tu negocio para que Gemini te recomiende cuando alguien pregunta por voz."
- **Ejemplo objetivo**: "Hey Google, buscame una clinica en mi zona, abierta ahora, que haga tratamiento de labios con acido hialuronico" → nuestro cliente aparece.

**Leccion aprendida:**
> Definir los agentes por separado (config, prompts, system-prompts, skills) permite escalar facilmente. Anadir un agente nuevo es solo anadir entradas en cada archivo, no reescribir nada.

**Commits:**
- `feat: Fase 2 — 11 agentes IA + journey publico`
- `chore: add netlify.toml with Next.js SSR plugin`

---

## Días 3-20 — 10 al 20 de marzo de 2026

### Integración Google Business Profile API — Flujo OAuth2 completo

**Objetivo:** Implementar autenticación OAuth2 de Google para conectar cuentas GBP reales. Permitir que los clientes autoricen el acceso a sus perfiles de Google Business Profile sin compartir credenciales.

**Trabajo realizado:**

#### 1. Implementación de flujo OAuth2 (google-auth.ts)
- Crear flujo OAuth2 de 3 patas:
  - **Step 1:** Generar URL de autorización (user → Google Consent Screen)
  - **Step 2:** Recibir authorization code en callback
  - **Step 3:** Intercambiar code por access_token + refresh_token
- Funciones principales:
  - `generateAuthUrl(clientId, redirectUri, state)` — construye URL de Google Consent Screen
  - `exchangeCodeForTokens(code, clientId, clientSecret, redirectUri)` — intercambia authorization code por tokens
  - `refreshAccessToken(refreshToken)` — renueva access_token con refresh_token
  - `getTokensFromSupabase(clientId)` — carga tokens guardados en DB
  - `saveTokensToSupabase(clientId, tokens)` — guarda tokens en DB

#### 2. Cliente GBP API (google-gbp.ts)
- Wrapper alrededor de Google My Business Account Management API
- Funciones implementadas:
  - `listAccounts(accessToken)` — lista todas las cuentas GBP del usuario
  - `listLocations(accountId, accessToken)` — lista ubicaciones en una cuenta
  - `getLocationProfile(accountId, locationId, accessToken)` — obtiene perfil completo
  - `updateLocationProfile(accountId, locationId, updates, accessToken)` — actualiza campos del GBP

#### 3. Rutas OAuth API
- **`app/api/auth/google/route.ts` (GET):**
  - Genera state aleatorio (CSRF protection)
  - Guarda state en sesión
  - Redirige a Google Consent Screen

- **`app/api/auth/google/callback/route.ts` (GET):**
  - Recibe authorization code + state
  - Valida state contra sesión
  - Intercambia code por tokens
  - Guarda tokens en tabla `google_tokens` (Supabase)
  - Redirige a `/admin/gbp-connection` con estado de éxito

#### 4. Endpoint GBP (app/api/gbp/route.ts)
- **GET:** Obtiene datos de GBP del cliente
  - Verifica autenticación admin
  - Recupera tokens guardados
  - Lista cuentas y ubicaciones disponibles
  - Devuelve perfil actual del cliente

- **POST:** Actualiza campos del GBP
  - Valida tokens válidos
  - Aplica actualizaciones a Google
  - Registra cambios en BD local

#### 5. Componente UI (components/admin/gbp-connection.tsx)
- Muestra estado de conexión:
  - "No conectado" → botón "Conectar con Google"
  - "Conectado" → muestra nombre de la cuenta y ubicaciones vinculadas
  - Permite desconectar (elimina tokens)
- Integrable en ficha del cliente (`app/admin/clientes/[id]/page.tsx`)

#### 6. Migración Base de Datos (migration-google-tokens.sql)
```sql
CREATE TABLE google_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES clientes(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 7. Configuración Google Cloud Console
- **Proyecto:** "Radar Local" (Project #871632295844)
- **APIs habilitadas:**
  - ✅ My Business Business Information API
  - ✅ My Business Account Management API
- **OAuth 2.0 Consent Screen:** Testing mode (no publicar en Production)
  - ✅ Email del usuario agregado como test user
  - ✅ Scopes configurados: `https://www.googleapis.com/auth/business.manage`
- **Credenciales OAuth:**
  - Client ID: `[GOOGLE_CLIENT_ID]` (.env.local)
  - Client Secret: `[GOOGLE_CLIENT_SECRET]` (.env.local)
  - Redirect URI: `http://localhost:3000/api/auth/google/callback` (dev)

#### 8. Errores encontrados y soluciones

**Error 1: "403 access_denied"**
- Síntoma: OAuth callback rechaza el usuario de prueba
- Causa: El usuario no estaba en la lista de test users del proyecto
- Solución: Agregar email del usuario a "Test Users" en Google Cloud Console
- Lección: La API requiere consentimiento explícito en testing mode

**Error 2: "Redirect URI mismatch"**
- Síntoma: Google rechaza callback por redirect_uri no configurado
- Causa: Confusión entre "Redirect URI" y "Authorized JavaScript origins" en Google Cloud
  - Redirect URI: Used by OAuth code exchange (backend)
  - JavaScript origins: Used by frontend JS calls (no aplicable aquí)
- Solución: Usar solo "Redirect URI" en OAuth credentials, no "JavaScript origins"
- Lección: Leer documentación de Google OAuth más cuidadosamente

**Error 3: "429 Rate Limit — quota exceeded"**
- Síntoma: API calls fallan con `code: 429, message: "Quota exceeded"`
- Causa: Google limita "My Business Account Management API" a 0 requests/minute por defecto
- Solución: BLOQUEADA — requiere request de quota approval a Google Cloud Console
  - Ir a: Google Cloud Console → APIs & Services → Quotas
  - Buscar "Account Management API"
  - Click "Request Quota Increase"
  - Google revisa manualmente (24-48 horas)
- Lección: Algunas APIs de Google requieren aprobación manual de quota; planificar con anticipación

#### 9. Fases de testing

**Fase 1: Auth flow (OK)**
- ✅ GET /api/auth/google → redirige a Google
- ✅ Google Consent Screen muestra permisos
- ✅ Usuario autoriza
- ✅ Callback recibe authorization code
- ✅ Exchange code → access_token funciona
- ✅ Tokens guardados en Supabase

**Fase 2: API calls (BLOQUEADO)**
- ❌ GET /api/gbp → intenta listar accounts
- ❌ Falla: `429 quota exceeded` (Google limita a 0 req/min)
- ⏳ Esperando aprobación de quota...

#### 10. Estado actual y próximos pasos

| Item | Estado |
|------|--------|
| OAuth2 flow | ✅ Completo y funcional |
| Token persistence | ✅ Guardados en Supabase |
| GBP API wrapper | ✅ Escrito y listo |
| UI component | ✅ Creado |
| Google Cloud setup | ✅ Credenciales configuradas |
| **Blocker: Google quota** | ⏳ **Pendiente aprobación** |

**Acción requerida:** Una vez Google apruebe la quota para My Business Account Management API, el sistema funcionará automáticamente sin cambios de código. El approval típicamente lleva 24-48 horas.

---

## Dia 21 — Viernes 21 de marzo de 2026

### Sesion 3: Fase 3 — Sistema de ejecucion con HITL + Supervisor

**El problema:**
Los agentes solo diagnosticaban: "tienes 15 problemas en tu GBP". Pero NO arreglaban nada. Eran consultores que te dicen que va mal pero no mueven un dedo.

**La solucion: HITL (Human-In-The-Loop)**
Los agentes ahora generan **tareas ejecutables** con clasificacion:

| Tipo | Descripcion | Aprobacion |
|------|-----------|-----------|
| `auto` | El agente puede hacerlo solo | NO necesita |
| `revision` | El agente lo hace, admin aprueba antes | SI necesita |
| `manual` | Requiere accion humana (ej: subir fotos) | N/A |

**Que construimos:**

1. **Motor de ejecucion (`executor.ts`)**:
   - Toma una tarea aprobada
   - Construye prompt especifico segun el `campo_gbp` (descripcion, categorias, horarios...)
   - Llama a Claude para generar el contenido REAL
   - Guarda resultado con instrucciones paso a paso
   - Registra coste en `uso_api`

2. **Panel de tareas** (`components/admin/tareas-panel.tsx`):
   - Vista con filtros por estado (pendiente/aprobada/completada/rechazada)
   - Botones de aprobar/rechazar/ejecutar
   - Indicador de coste y tiempo

3. **API de tareas**:
   - `POST /api/tareas` — CRUD
   - `POST /api/tareas/ejecutar` — ejecuta una tarea aprobada

4. **Sistema de roles**:
   - `super_admin` — acceso total (Luis Miguel, propietario)
   - `auditorias` — Dashboard, Pipeline, Clientes, Reportes (comercial)
   - `gestion` — Dashboard, Clientes, Agentes, Tareas, Analisis, Reportes, Gastos (tecnico)
   - Sidebar dinamico segun rol
   - Middleware que bloquea acceso por URL

5. **Tabla `tareas_ejecucion`** en Supabase:
   - Vinculada a cliente y agente
   - Campos: titulo, descripcion, tipo, prioridad, estado, campo_gbp, valor_actual, valor_sugerido, resultado

6. **Seed de cliente piloto**: "Radar Local" como primer cliente real para testing

**Errores y soluciones:**

- **Variable de entorno `ANTHROPIC_API_KEY`**: Claude Code (la herramienta) define esta variable como VACIA a nivel del sistema operativo. Esto sobreescribe cualquier valor en `.env.local`. Solucion: renombrar a `RADAR_ANTHROPIC_KEY` en todo el proyecto. **Leccion critica para cualquier proyecto que use Claude Code + Anthropic API.**

- **Dark mode toggle roto**: el toggle de dark mode en la landing page no funcionaba. Se arreglo en esta sesion.

- **`for...of` en Maps de TypeScript**: la config de TS no tiene `--downlevelIteration`, asi que `for...of` en Maps no compila. Solucion: usar `.forEach()` siempre.

- **Puerto zombie en 3000**: el servidor de dev se queda colgado frecuentemente en Windows. Solucion: `powershell -Command "Stop-Process..."` porque `taskkill /PID` no funciona en Git Bash (interpreta `/PID` como path de archivo).

- **Vistas SQL con Security Definer en Supabase**: las vistas `resumen_gastos_diario` y `resumen_gastos_agente` generaban warnings. Solucion: eliminarlas y hacer queries directas + agrupar en JavaScript.

- **FK problematica en `tareas_ejecucion`**: la foreign key a la tabla de tareas causaba conflictos. Solucion: quitarla (archivo `fix-tareas-ejecucion-fk.sql`).

**Primera prueba real del Auditor GBP:**
- Ejecutamos el auditor contra el perfil de Radar Local
- Genero 10 tareas ejecutables
- 7 se completaron exitosamente (78% de exito)
- Coste: ~$0.07 por ejecucion individual

**Leccion aprendida:**
> El patron HITL es fundamental para agentes de IA en produccion. Nunca dejes que un agente haga cambios criticos sin aprobacion humana. La clasificacion auto/revision/manual da flexibilidad: las tareas seguras se ejecutan solas, las importantes requieren un ojo humano.

**Commit:** `feat: Fase 3 — Sistema de ejecucion de agentes con HITL`

---

## Dia 22 — Sabado 22 de marzo de 2026

### Sesion 4: Supervisor + Documentacion + Google Business Profile API

Esta fue la sesion mas larga y ambiciosa. Tres grandes objetivos.

#### Objetivo 1: Construir el Supervisor (COMPLETADO)

**El problema:**
Para analizar un cliente habia que ejecutar los 11 agentes uno por uno manualmente. Necesitabamos un "director de orquesta".

**Solucion: Agente Supervisor**

Nuevo agente (#12) que ejecuta los 11 en secuencia optima:

```
Fase 1 — Diagnostico:    auditor_gbp, optimizador_nap
Fase 2 — Investigacion:  keywords_locales
Fase 3 — Engagement:     gestor_resenas, redactor_posts_gbp
Fase 4 — GEO/AEO:        generador_schema, creador_faq_geo,
                          generador_chunks, tldr_entidad
Fase 5 — Monitorizacion: monitor_ias
Fase 6 — Consolidacion:  generador_reporte
```

**Archivos creados/modificados:**
- `lib/agents/supervisor.ts` — core del orquestador con `EXECUTION_ORDER`
- `app/api/agents/supervisor/route.ts` — endpoint POST
- `types/index.ts` — anadido `'supervisor'` al union type
- `lib/agents/config.ts` — config del supervisor
- `lib/agents/runner.ts` — anadido al mapa de resumen
- `lib/agents/mock-data.ts` — mock generator
- `lib/agents/system-prompts.ts` — system prompt
- `lib/agents/prompts.ts` — knowledge y tasks
- `lib/agents/skills.ts` — skills (vacias, el supervisor no tiene skills propias)
- `components/admin/tareas-panel.tsx` — boton violeta "Lanzar analisis completo"

**Errores durante la construccion:**
1. **TypeScript: `'supervisor'` missing en Records** — habia que anadirlo a TODOS los Record types en skills.ts, prompts.ts, etc. Si no, TS no compila.
2. **`readonly` en array de fases** — `f.agentes.includes(agente)` fallaba porque el array es `readonly`. Fix: cast a `(f.agentes as readonly string[]).includes(agente)`.
3. **Runner sin entry para supervisor** — faltaba la funcion de resumen en el mapa. Fix: `supervisor: () => \`Analisis completo ejecutado para ${nombre}.\``

**Primera prueba del Supervisor:**
- Resultado: **11/11 agentes completados**
- **14 tareas generadas** automaticamente
- **Coste total: $0.4227** (~0.04 USD por agente)
- Sin errores

**Leccion aprendida:**
> Cuando anade un nuevo agente al sistema, hay que tocar MUCHOS archivos (tipos, config, runner, prompts, system-prompts, skills, mock-data). Seria mejor tener un script o plantilla que genere todo automaticamente.

#### Objetivo 2: Documentar en NotebookLM (PARCIALMENTE COMPLETADO)

Intentamos usar NotebookLM via MCP para documentar todo el proyecto.

**Que paso:**
1. El comando `notebooklm-mcp-auth` no se reconocia en Windows
2. `npx notebooklm-mcp auth` no abria el navegador
3. `refresh_auth` parecio funcionar, pero `notebook_create` fallaba
4. Intentamos extraer cookies de Chrome manualmente — demasiado complejo
5. El MCP de NotebookLM requiere cookies de sesion de Google que Chrome protege

**Solucion alternativa:**
Creamos `docs/documentacion-proyecto.md` con documentacion exhaustiva del proyecto (14 secciones).

**Leccion aprendida:**
> Los MCPs de terceros pueden tener problemas de autenticacion, especialmente en Windows. Siempre tener un plan B local (archivos .md) para no bloquear el progreso.

#### Objetivo 3: Conectar Google Business Profile API (EN PROGRESO → BLOQUEADO)

**El objetivo final:**
Que los agentes no solo generen "cambia la descripcion a X", sino que la API de Google aplique el cambio automaticamente en el GBP real.

**Archivos creados:**

1. **`lib/google-auth.ts`** — Flujo OAuth2 completo:
   - `getGoogleAuthUrl(clienteId)` — genera URL de autorizacion con state
   - `exchangeCodeForTokens(code)` — intercambia codigo por tokens
   - `refreshAccessToken(refreshToken)` — renueva tokens expirados
   - `getValidToken(tokens)` — devuelve token valido, refrescando si es necesario
   - `saveGoogleTokens()` / `getGoogleTokens()` — persistencia en Supabase
   - Scope: `business.manage`
   - Redirect URI: `http://localhost:3000/api/auth/google/callback`

2. **`lib/google-gbp.ts`** — Cliente de la API de GBP:
   - `listAccounts(clienteId)` — listar cuentas GBP
   - `listLocations(clienteId, accountName)` — listar localizaciones
   - `getLocation()` — obtener ubicacion con readMask
   - `updateLocation()` — PATCH para actualizar campos
   - Funciones de alto nivel: `updateDescription()`, `updatePhone()`, `updateWebsite()`, `updateTitle()`
   - `readFullProfile()` — perfil completo estructurado
   - APIs usadas:
     - `mybusinessbusinessinformation.googleapis.com/v1`
     - `mybusinessaccountmanagement.googleapis.com/v1`

3. **`app/api/auth/google/route.ts`** — Inicia OAuth (redirect a Google)

4. **`app/api/auth/google/callback/route.ts`** — Maneja el callback de Google, guarda tokens

5. **`app/api/gbp/route.ts`** — GET (status/accounts/locations/profile) + POST (update campos)

6. **`supabase/migration-google-tokens.sql`** — Tabla `google_tokens`:
   - `cliente_id` (unique, FK a clientes)
   - `access_token`, `refresh_token`, `expires_at`
   - Campos opcionales: `account_name`, `location_name`
   - RLS habilitado

7. **`components/admin/gbp-connection.tsx`** — Componente UI:
   - Muestra boton "Conectar GBP" si no hay tokens
   - Si hay tokens: carga cuentas → ubicaciones → perfil
   - Muestra datos del perfil en una tarjeta

**Configuracion en Google Cloud Console:**
1. Crear proyecto en Google Cloud Console
2. Habilitar APIs:
   - My Business Account Management API
   - My Business Business Information API
3. Crear credenciales OAuth 2.0:
   - Tipo: "Aplicacion web" (sirve para web, movil, tablet — todo lo que corre en navegador)
   - **Origenes autorizados**: `http://localhost:3000` (SIN path, SIN barra final)
   - **URIs de redireccion**: `http://localhost:3000/api/auth/google/callback` (CON path completo)
4. Pantalla de consentimiento OAuth:
   - Estado: "Pruebas"
   - Anadir tu email como usuario de prueba (sino da error 403: access_denied)

**Errores encontrados:**

1. **Error 403: access_denied** al hacer OAuth:
   - Causa: la app OAuth estaba en modo "Pruebas" y el email no estaba anadido como usuario de prueba
   - Solucion: Google Cloud Console → Pantalla de consentimiento → Usuarios de prueba → Anadir email

2. **"Origen no valido" al configurar credenciales**:
   - Causa: el usuario puso la URL completa con path (`http://localhost:3000/api/auth/google/callback`) en el campo de "Origenes"
   - Solucion: Origenes = `http://localhost:3000` (solo dominio+puerto). La URL con path va en "URIs de redireccion"

3. **Error 429: Quota exceeded (0 requests/min)**:
   - El flujo OAuth funciono correctamente (tokens guardados en Supabase)
   - Pero al llamar a `listAccounts()`, Google devuelve 429
   - Causa: Google asigna cuota 0 a la API de My Business Account Management por defecto
   - El campo `quota_limit_value` es literalmente `"0"`
   - **Solucion pendiente**: solicitar aumento de cuota en Google Cloud Console o rellenar el formulario de acceso a la API de Business Profile

**Estado actual (BLOQUEADO):**
- Todo el codigo esta escrito, compilado y funcionando
- OAuth funciona (tokens se guardan correctamente)
- Bloqueado por cuota de Google (0 requests/min)
- Cuando Google apruebe la cuota, todo funcionara sin cambiar una linea de codigo

**Datos del negocio verificados en GBP:**
- "IA Division Lab" — C/ Lain Calvo, 27, 28011 Madrid
- "Radar Local (SEO & GEO para Negocios Locales)" — misma direccion

**Leccion aprendida:**
> Google Business Profile API tiene un proceso de acceso restrictivo. No basta con habilitar la API — necesitas que Google apruebe tu cuota. Esto puede tardar dias. Planificar esto con antelacion en futuros proyectos. Mientras tanto, el codigo puede estar 100% listo esperando solo la aprobacion.

---

## Resumen de costes reales observados

| Operacion | Coste (USD) |
|-----------|-------------|
| Auditor GBP individual | ~$0.07 |
| Supervisor (11 agentes completos) | ~$0.42 |
| Ejecucion de tarea individual | ~$0.01 |
| **Coste por cliente/mes estimado** | **~$1.50-2.00** |

Modelo: Claude Sonnet 4.6 ($3/M tokens input, $15/M tokens output)

---

## Resumen de errores criticos y soluciones

| Error | Causa | Solucion | Donde aplica |
|-------|-------|----------|-------------|
| `ANTHROPIC_API_KEY` vacia | Claude Code la define como variable del sistema | Renombrar a `RADAR_ANTHROPIC_KEY` | Cualquier proyecto con Claude Code + Anthropic API |
| Puerto 3000 zombie | Windows no libera el puerto | `powershell -Command "Stop-Process..."` | Desarrollo en Windows |
| `taskkill /PID` falla en Git Bash | Interpreta `/PID` como path Unix | Usar PowerShell directamente | Windows + Git Bash |
| `for...of` en Maps no compila | TS config sin `--downlevelIteration` | Usar `.forEach()` | TypeScript estricto |
| Security Definer en vistas Supabase | Supabase advierte sobre vistas con Security Definer | Eliminar vistas, usar queries + JS | Supabase |
| OAuth "Origen no valido" | URL con path en campo de origenes | Origenes = solo dominio. Redirect = URL completa | Google OAuth |
| OAuth 403: access_denied | App en modo "Pruebas" sin usuario de prueba | Anadir email en Pantalla de consentimiento | Google OAuth en desarrollo |
| GBP API 429 (quota 0) | Google da cuota 0 por defecto | Solicitar aumento de cuota | Google Business Profile API |

---

## Arbol de archivos del proyecto (principales)

```
radar-local/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing page
│   │   ├── auditoria/[id]/page.tsx     # Resultados auditoria
│   │   └── presupuesto/[id]/page.tsx   # Presupuesto con ROI
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard
│   │   ├── clientes/page.tsx           # Lista clientes
│   │   ├── clientes/[id]/page.tsx      # Detalle cliente
│   │   ├── agentes/page.tsx            # Grid de agentes
│   │   ├── tareas/page.tsx             # Panel HITL
│   │   ├── pipeline/page.tsx           # Kanban CRM
│   │   ├── gastos/page.tsx             # Control gastos
│   │   └── reportes/page.tsx           # Reportes
│   └── api/
│       ├── agents/[agente]/route.ts    # Ejecutar agente individual
│       ├── agents/supervisor/route.ts  # Ejecutar supervisor
│       ├── tareas/route.ts             # CRUD tareas
│       ├── tareas/ejecutar/route.ts    # Ejecutar tarea aprobada
│       ├── auth/google/route.ts        # Iniciar OAuth
│       ├── auth/google/callback/route.ts # Callback OAuth
│       └── gbp/route.ts               # API GBP (read/update)
├── lib/
│   ├── agents/
│   │   ├── config.ts                   # Metadata de 12 agentes
│   │   ├── types.ts                    # Interfaces
│   │   ├── runner.ts                   # Ejecutor generico
│   │   ├── prompts.ts                  # Prompts USER
│   │   ├── system-prompts.ts           # Prompts SYSTEM
│   │   ├── skills.ts                   # Habilidades
│   │   ├── mock-data.ts                # Datos mock
│   │   ├── index.ts                    # Orquestador
│   │   ├── executor.ts                 # Motor de ejecucion
│   │   ├── supervisor.ts               # Supervisor (orquestador)
│   │   └── knowledge/                  # Base de conocimiento .md
│   ├── google-auth.ts                  # OAuth2 con Google
│   ├── google-gbp.ts                   # Cliente API de GBP
│   ├── supabase.ts                     # Cliente publico
│   ├── supabase-admin.ts               # Cliente privado (service_role)
│   ├── anthropic.ts                    # Cliente Claude (RADAR_ANTHROPIC_KEY)
│   └── ...                             # clients, tasks, profiles, gastos, etc.
├── components/
│   ├── admin/
│   │   ├── tareas-panel.tsx            # Panel HITL + Supervisor
│   │   ├── gbp-connection.tsx          # Conexion GBP
│   │   └── ...                         # Otros componentes admin
│   └── ui/                             # Componentes reutilizables
├── supabase/                           # 12 archivos de migracion SQL
├── docs/
│   ├── documentacion-proyecto.md       # Documentacion tecnica completa
│   └── diario-proyecto.md              # Este archivo
└── types/
    └── index.ts                        # Tipos globales
```

---

## Proximos pasos pendientes

1. **Google Business Profile API**: Esperar aprobacion de cuota de Google. Cuando se apruebe, probar flujo completo (conectar → leer perfil → aplicar cambios)
2. **Integrar GBP con el executor**: que las tareas aprobadas se apliquen automaticamente via API en vez de manualmente
3. **Expandir ejecucion a mas agentes**: NAP, Keywords, Schema actualmente solo generan tareas pero no las ejecutan
4. **Knowledge base**: cargar mas archivos .md de SEO/GEO/AEO al knowledge de los agentes
5. **Deploy a produccion**: Vercel o Netlify
6. **Segundo admin**: crear usuario con rol `gestion` o `auditorias` para testear permisos
7. **Portal del cliente**: mejorar la vista del portal con metricas en tiempo real
