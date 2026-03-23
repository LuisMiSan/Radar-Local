

## 1. Vision y Propuesta de Valor

**Radar Local** # Radar Local — Documentacion Completa del Proyectoes una agencia de posicionamiento local que prepara los perfiles de Google Business Profile (GBP) de negocios locales para que **Gemini los recomiende en busquedas por voz**.

### Propuesta diferenciadora
> "No hacemos SEO Local. Preparamos tu negocio para que Gemini te recomiende cuando alguien pregunta por voz."

Ejemplo de busqueda por voz objetivo:
> "Hey Google, buscame una clinica en mi zona, abierta ahora, que haga tratamiento de labios con acido hialuronico"

Nuestro cometido es posicionar la clinica del cliente para que sea la que Gemini recomiende en ese momento.

### Diferenciacion
- **GEO** (Generative Engine Optimization): Optimizar para motores generativos (Gemini, ChatGPT, Perplexity)
- **AEO** (Answer Engine Optimization): Optimizar para busquedas por voz y respuestas directas
- **SEO Local**: Base sobre la que construimos GEO y AEO

**"Esta es nuestra promesa y lo que nos diferencia de cualquier agencia de SEO local"**

---

## 2. Stack Tecnologico

| Componente | Tecnologia |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Base de datos | Supabase (PostgreSQL) |
| IA | Anthropic Claude API (Sonnet 4.6) |
| Graficos | recharts |
| PDF | jsPDF |
| Email | Resend |
| CSS | Tailwind CSS |
| Lenguaje | TypeScript |
| Deploy | Vercel / Netlify |

### Reglas del proyecto
- **Idioma UI**: Espanol
- **Idioma codigo**: Ingles
- **Variable API**: Usar `RADAR_ANTHROPIC_KEY` (NO `ANTHROPIC_API_KEY` que esta vacia como variable del sistema)
- **TypeScript**: No soporta `for...of` en Maps, usar `.forEach()`
- **Puerto dev**: 3000 (zombie frecuente, matar con PowerShell)

---

## 3. Base de Datos (Supabase)

### Tablas principales
| Tabla | Descripcion |
|-------|-----------|
| `clientes` | Datos de clientes (nombre, negocio, email, pack, estado) |
| `perfiles_gbp` | Perfiles de Google Business Profile vinculados a clientes |
| `tareas` | Registro de ejecuciones de agentes (historial) |
| `informes` | Reportes generados |
| `uso_api` | Tracking de gastos de API (tokens, costes) |
| `tareas_ejecucion` | Tareas ejecutables que generan los agentes (el sistema HITL) |
| `admin_profiles` | Perfiles de administradores con roles |

### Migraciones SQL (en orden)
1. `migration.sql` - Schema inicial
2. `migration-auditorias-completa.sql` - Tabla auditorias
3. `migration-pipeline.sql` - Pipeline CRM
4. `migration-pipeline-v2.sql` - Pipeline v2
5. `migration-portal-token.sql` - Tokens de portal cliente
6. `migration-uso-api.sql` - Tracking de gastos API
7. `migration-informes.sql` - Reportes
8. `migration-dimensiones.sql` - Analisis dimensional
9. `migration-tareas-ejecucion.sql` - Sistema de tareas ejecutables
10. `migration-admin-roles.sql` - Roles de administrador
11. `fix-security-definer-views.sql` - Eliminar vistas con Security Definer
12. `fix-tareas-ejecucion-fk.sql` - Quitar FK problematica en tareas_ejecucion

### Vistas SQL eliminadas
- `resumen_gastos_diario` y `resumen_gastos_agente` fueron eliminadas por warning de Security Definer en Supabase. El codigo hace queries directas en JavaScript y agrupa en JS.

---

## 4. Arquitectura de la Aplicacion

### Estructura de carpetas
```
radar-local/
  app/
    (public)/           # Paginas publicas
      page.tsx          # Landing page con formulario de auditoria
      auditoria/[id]/   # Resultados de auditoria
      presupuesto/[id]/ # Presupuesto con ROI
      portal/[token]/   # Portal del cliente (read-only)
    admin/              # Panel de administracion
      page.tsx          # Dashboard
      login/            # Login con Supabase Auth
      clientes/         # Lista + detalle de clientes
      pipeline/         # Kanban CRM
      agentes/          # Grid de 11 agentes
      tareas/           # Panel de tareas ejecutables (HITL)
      analisis/         # Analisis IA
      reportes/         # Reportes
      gastos/           # Control de gastos API
    api/
      agents/[agente]/  # Ejecutar agente individual
      agents/supervisor/ # Ejecutar analisis completo (11 agentes)
      agents/run-all/   # Ejecutar batch
      tareas/           # CRUD de tareas ejecutables
      tareas/ejecutar/  # Motor de ejecucion de tareas
      clients/          # CRUD clientes
      audit/            # Auditoria publica
      presupuesto/      # Generacion presupuesto
      email/            # Envio de emails
      gastos/           # Registro de gastos
      informes/         # CRUD informes
      admin/profile/    # Perfil del admin (rol)
  lib/
    agents/             # Sistema de agentes IA
    supabase.ts         # Cliente Supabase publico
    supabase-admin.ts   # Cliente Supabase privado (service_role)
    clients.ts          # Queries de clientes
    tasks.ts            # Queries de tareas
    profiles.ts         # Queries de perfiles GBP
    gastos.ts           # Tracking de gastos
    tareas-ejecucion.ts # CRUD tareas ejecutables
    roles.ts            # Sistema de roles
    audit.ts            # Logica de auditorias
    email.ts            # Envio con Resend
    pdf-export.ts       # Exportacion PDF
  components/
    admin/              # Componentes del panel admin
    ui/                 # Componentes UI reutilizables
  supabase/             # Migraciones SQL
  types/                # Tipos TypeScript globales
```

---

## 5. Journey del Cliente (Flujo Publico)

```
1. Landing (/)
   Cliente ve el formulario de auditoria gratuita
   ↓
2. Rellena datos del negocio + competidores
   ↓
3. POST /api/audit → Claude analiza el GBP
   ↓
4. Resultados (/auditoria/[id])
   Puntuacion, gaps, comparativa vs competidores
   ↓
5. Presupuesto (/presupuesto/[id])
   Propuesta con ROI a 3 meses
   ↓
6. Se envia email con auditoria + presupuesto
   ↓
7. Firma de contrato + acceso a GBP
   ↓
8. Los agentes comienzan a trabajar
```

---

## 6. Sistema de Agentes IA (11 + Supervisor)

### Arquitectura
```
lib/agents/
  config.ts          # Metadata de los 12 agentes (11 + supervisor)
  types.ts           # Interfaces (AgentInput, AgentResult, TareaGenerada)
  runner.ts          # Ejecutor generico (Claude API o mock)
  prompts.ts         # Prompt USER de cada agente + knowledge
  system-prompts.ts  # Prompt SYSTEM de cada agente
  skills.ts          # Habilidades compartidas + propias
  knowledge-loader.ts # Carga archivos .md de knowledge
  mock-data.ts       # Datos mock (sin API key)
  index.ts           # Orquestador: runAgent()
  executor.ts        # Motor de ejecucion de tareas aprobadas
  supervisor.ts      # Supervisor: ejecuta los 11 en secuencia
  knowledge/         # Base de conocimiento (.md)
    map-pack-ranking.md
    geo-aeo-fundamentals.md
    local-seo-spain.md
```

### Los 11 agentes + Supervisor

#### Map Pack (Agentes 1-5) — Pack Visibilidad Local + Autoridad Maps
| # | Agente | Que hace |
|---|--------|---------|
| 1 | **Auditor GBP** | Auditoria completa del perfil GBP. Puntuacion 0-100, problemas, recomendaciones |
| 2 | **Optimizador NAP** | Verifica Nombre, Direccion, Telefono en directorios |
| 3 | **Keywords Locales** | Investigacion de keywords con intencion local y de voz |
| 4 | **Gestor Resenas** | Analisis de resenas y generacion de respuestas |
| 5 | **Redactor Posts GBP** | Crea posts optimizados para Map Pack |

#### GEO/AEO (Agentes 6-10) — Solo Pack Autoridad Maps + IA
| # | Agente | Que hace |
|---|--------|---------|
| 6 | **Generador Schema** | JSON-LD (LocalBusiness, FAQPage) para LLMs |
| 7 | **Creador FAQ GEO** | FAQs optimizadas para Gemini, ChatGPT, Perplexity |
| 8 | **Generador Chunks** | Bloques de contenido para ser citados por IAs |
| 9 | **TL;DR Entidad** | Resumen de entidad para que los LLMs identifiquen el negocio |
| 10 | **Monitor IAs** | Monitoriza menciones en Gemini, ChatGPT, Perplexity |

#### Reporte (Agente 11) — Solo Pack Autoridad Maps + IA
| # | Agente | Que hace |
|---|--------|---------|
| 11 | **Generador Reporte** | Reporte mensual consolidado con metricas |

#### Supervisor (Orquestador)
| # | Agente | Que hace |
|---|--------|---------|
| 12 | **Supervisor** | Ejecuta los 11 agentes en secuencia optima para un cliente |

### Orden de ejecucion del Supervisor
```
Fase 1 — Diagnostico:    auditor_gbp, optimizador_nap
Fase 2 — Investigacion:  keywords_locales
Fase 3 — Engagement:     gestor_resenas, redactor_posts_gbp
Fase 4 — GEO/AEO:        generador_schema, creador_faq_geo, generador_chunks, tldr_entidad
Fase 5 — Monitorizacion: monitor_ias
Fase 6 — Consolidacion:  generador_reporte (usa todos los resultados anteriores)
```

### Flujo de un agente
```
1. runAgent(agente, clienteId, previousResults?)
2. Valida config + obtiene cliente/perfil GBP de Supabase
3. Construye prompt: System + User (knowledge + skills + contexto + tarea)
4. Llama a Claude API (Sonnet 4.6)
5. Parsea JSON de respuesta
6. Extrae tareas ejecutables del JSON
7. Registra gasto en uso_api
8. Guarda tareas en tareas_ejecucion
9. Devuelve AgentResult
```

---

## 7. Sistema de Tareas Ejecutables (HITL)

### El problema que resuelve
**ANTES**: Los agentes solo diagnosticaban ("tienes 15 problemas") pero NO los arreglaban.
**AHORA**: Los agentes diagnostican Y generan tareas para arreglar cada problema.

### Tipos de tareas
| Tipo | Descripcion | Necesita aprobacion |
|------|-----------|-------------------|
| **auto** | El agente puede hacerlo solo | NO |
| **revision** | El agente lo hace, pero el admin aprueba antes | SI |
| **manual** | Requiere accion humana (ej: subir fotos) | N/A |

### Prioridades
| Prioridad | Ejemplo |
|-----------|---------|
| **critica** | Verificar perfil GBP, completar direccion |
| **alta** | Reescribir descripcion, anadir categorias |
| **media** | Publicar primer post, anadir atributos |
| **baja** | Optimizaciones menores |

### Flujo HITL
```
Agente genera tareas → Pendiente
                          ↓
Admin aprueba         → Aprobada
  o rechaza           → Rechazada
                          ↓
Motor ejecuta         → Ejecutando
                          ↓
Claude genera contenido → Completada (con resultado)
  o falla              → Fallo (con error)
```

### Motor de ejecucion (executor.ts)
- Toma una tarea aprobada
- Construye prompt especifico segun el campo_gbp (descripcion, categorias, horarios, etc.)
- Llama a Claude para generar el contenido real
- Guarda el resultado con instrucciones paso a paso para implementar en el GBP
- Registra el coste en uso_api

---

## 8. Sistema de Roles

### Roles disponibles
| Rol | Acceso | Quien |
|-----|--------|-------|
| **super_admin** | TODO | Propietario (Luis Miguel) |
| **auditorias** | Dashboard, Pipeline, Clientes, Reportes | Comercial / Closer |
| **gestion** | Dashboard, Clientes, Agentes, Tareas, Analisis, Reportes, Gastos | Tecnico |

### Implementacion
- Tabla `admin_profiles` en Supabase con campo `rol`
- Hook `useAdminRole()` en el frontend para obtener el rol
- Sidebar dinamico que muestra solo las secciones del rol
- Middleware que bloquea acceso directo por URL

---

## 9. Packs de Servicio

| Pack | Que incluye | Agentes |
|------|-----------|---------|
| **Visibilidad Local** | Map Pack (agentes 1-5) | 5 agentes |
| **Autoridad Maps + IA** | Map Pack + GEO/AEO + Reporte (agentes 1-11) | 11 agentes |

---

## 10. Control de Gastos

- Cada ejecucion de agente registra tokens consumidos y coste en USD
- Tabla `uso_api` con: agente, modelo, tokens in/out, coste, cliente
- Panel /admin/gastos para visualizar gastos por dia y por agente
- Precios: Sonnet 4.6 = $3/M input, $15/M output

### Costes reales observados
- Auditor GBP individual: ~$0.07
- Supervisor (11 agentes): ~$0.42
- Ejecucion de tarea individual: ~$0.01

---

## 11. Funcionalidades Extra

| Feature | Descripcion |
|---------|-----------|
| Dark mode | Toggle en landing page |
| Bilingue ES/EN | Landing page con selector de idioma |
| Dictado por voz | Web Speech API en formularios |
| Portal del cliente | /portal/[token] con metricas y reportes (read-only) |
| Exportacion PDF | Reportes en PDF con jsPDF |
| Gestion de archivos | Subida de archivos por cliente |

---

## 12. Historial de Desarrollo

### Fase 1 — Schema SQL + Panel Admin + Design System
- Tablas en Supabase: clientes, perfiles_gbp, tareas, metricas
- Panel admin con sidebar, dashboard, clientes
- Colores: primary (#1a1f3c), accent (#00d4a0)

### Fase 2 — 11 Agentes IA + Journey Publico
- 11 agentes con config, prompts, system-prompts, skills, mock-data
- Landing page con formulario de auditoria
- Paginas de auditoria y presupuesto con ROI
- Portal del cliente con token

### Fase 3 — Sistema de Ejecucion con HITL (22 marzo 2026)
- Motor de ejecucion (executor.ts)
- Panel de tareas con aprobacion HITL
- API /api/tareas + /api/tareas/ejecutar
- Sistema de roles (super_admin, auditorias, gestion)
- Tabla tareas_ejecucion con tipos auto/revision/manual
- Supervisor que orquesta los 11 agentes
- Seed de "Radar Local" como cliente piloto
- Prueba real: 11/11 agentes, 14 tareas, $0.42
- Limpieza de vistas SQL con Security Definer

### Proximos pasos
1. Expandir ejecucion a mas agentes (NAP, Keywords, Schema...)
2. Conectar Google Business Profile API (para aplicar cambios automaticamente)
3. Cargar skills de SEO al knowledge base
4. Deploy a produccion (Vercel)
5. Segundo admin con rol diferente para testing

---

## 13. Datos del Cliente Piloto

**Radar Local** (nuestro propio perfil GBP)
- Web: radarlocalmadrid.es
- Ubicacion: Madrid, Espana
- Categoria: Agencia de marketing digital
- Pack: autoridad_maps_ia
- Estado: activo
- ID en Supabase: a1b2c3d4-0000-4000-8000-000000000000

---

## 14. Credenciales y Accesos

- **Admin login**: admin@radarlocal.es
- **Supabase**: Confirmacion de email DESACTIVADA (desarrollo)
- **API keys**: En .env.local (NUNCA en git)
  - RADAR_ANTHROPIC_KEY
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - RESEND_API_KEY (pendiente)
