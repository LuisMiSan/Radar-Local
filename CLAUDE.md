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
