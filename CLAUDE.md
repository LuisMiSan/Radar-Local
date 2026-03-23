# Radar Local — Instrucciones para el agente

## Qué es este proyecto
App web SaaS para agencias que optimizan Google Business Profile (GBP)
y posicionamiento GEO/AEO para clínicas y negocios locales en España.

## Stack tecnológico
- Next.js 14 con App Router
- TypeScript
- Tailwind CSS para estilos
- Supabase para base de datos y autenticación
- Claude API (claude-sonnet-4-6) para los agentes de IA

## Regla CRÍTICA — Parar cuando el usuario lo pida
Cuando el usuario diga cualquier variación de "para", "stop", "guarda todo", "me voy", "mañana seguimos", "deja de trabajar", o cualquier instrucción similar:
1. DETENTE INMEDIATAMENTE — no lances más herramientas ni hagas más cambios
2. Resume brevemente qué has hecho y qué queda pendiente
3. Guarda el progreso (commit si el usuario lo pide, o lista de pendientes)
4. NO sigas trabajando "por si acaso" ni "para terminar esto rápido"
5. Responde confirmando que has parado y qué se ha guardado

Esta regla tiene MÁXIMA PRIORIDAD sobre cualquier tarea en curso.

## Reglas importantes
- Código siempre en TypeScript, nunca JavaScript puro
- Comentarios en español
- Componentes pequeños y reutilizables
- Siempre manejar errores (try/catch)
- Mobile-first en todos los diseños
- Nunca hardcodear API keys — usar variables de entorno

## Estructura de carpetas
- /app → páginas y rutas (Next.js App Router)
- /components → componentes reutilizables
- /lib → funciones de utilidad y llamadas a APIs
- /types → tipos TypeScript

## Idioma
La interfaz de la app está en español.
Los nombres de variables y funciones en inglés.
