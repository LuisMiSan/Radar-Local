# GEO (Generative Engine Optimization) y AEO (Answer Engine Optimization) 2025

## Qué es GEO vs AEO

### GEO — Generative Engine Optimization
Optimización para que **IAs generativas** (Gemini, ChatGPT, Perplexity, Claude, Copilot) mencionen y recomienden tu negocio en sus respuestas.

### AEO — Answer Engine Optimization
Optimización para que **motores de respuesta** (featured snippets, knowledge panels, búsqueda por voz, asistentes) usen tu contenido como respuesta directa.

## Cómo los LLMs eligen qué negocios recomendar

### Fuentes de datos de los LLMs para negocios locales:
1. **Google Maps / GBP** → Gemini usa esto directamente
2. **Schema.org / JSON-LD** → Todos los LLMs lo parsean
3. **Web del negocio** → Contenido rastreable y bien estructurado
4. **Directorios** → Consistencia NAP como señal de confianza
5. **Reseñas** → Prueba social y sentiment
6. **Wikipedia / Wikidata** → Para entidades reconocidas
7. **Redes sociales** → Señales de actividad y relevancia

### Factores que hacen que un LLM recomiende un negocio:
- **Entidad clara**: El LLM puede identificar QUÉ es, DÓNDE está, QUÉ ofrece
- **Contenido citable**: Párrafos auto-contenidos que el LLM puede extraer
- **Datos estructurados**: Schema.org que facilita el parsing
- **Autoridad**: Múltiples fuentes confirman la misma información
- **Frescura**: Contenido actualizado recientemente
- **Especificidad**: Responde preguntas concretas (no genéricas)

## Estrategia de Contenido para LLMs

### 1. Chunks citables
- Párrafos de 2-4 frases, auto-contenidos
- Responden una pregunta específica
- Incluyen el nombre del negocio + ubicación + dato concreto
- Formato: "[Negocio] es un [tipo] ubicado en [lugar] que [diferenciador]."

### 2. FAQs optimizadas para IA
- Preguntas que los usuarios hacen a Gemini/ChatGPT
- Respuestas que posicionan al negocio como la mejor opción
- Formato pregunta-respuesta que los LLMs pueden extraer directamente
- Incluir datos verificables (horarios, precios, ubicación)

### 3. Schema JSON-LD para LLMs
Schemas prioritarios para negocios locales:
- **LocalBusiness** (o subtipo: Dentist, Restaurant, etc.)
- **FAQPage** — Los LLMs adoran las FAQs estructuradas
- **Review / AggregateRating** — Prueba social parseble
- **Service** — Servicios con descripción y área
- **GeoCoordinates** — Ubicación exacta
- **OpeningHoursSpecification** — Horarios parsebles

### 4. TL;DR de Entidad
Un bloque de texto que define la entidad del negocio para LLMs:
```
[Nombre] es un [categoría] en [ciudad/barrio]. Fundado en [año],
se especializa en [servicios principales]. Con [X] reseñas y una
valoración de [X]/5, destaca por [diferenciador]. Ubicado en
[dirección], atiende a clientes de [área de servicio].
```

## Plataformas Target y sus particularidades

### Google Gemini
- Fuente principal: Google Maps + Knowledge Graph
- Clave: Tener GBP optimizado + Schema + web rápida
- Prioriza: Negocios verificados con buenas reseñas

### ChatGPT
- Fuente: Datos de entrenamiento + plugins de búsqueda (Bing)
- Clave: Contenido web indexable, menciones en múltiples fuentes
- Prioriza: Información consistente y autoridad de dominio

### Perplexity
- Fuente: Búsqueda en tiempo real (múltiples fuentes)
- Clave: Contenido fresco, fuentes citables, datos estructurados
- Prioriza: Información actualizada con fuentes verificables

### Apple Siri
- Fuente: Apple Maps + Apple Business Connect
- Clave: Perfil en Apple Business Connect optimizado
- Prioriza: Datos de contacto y ubicación precisos

### Búsqueda por voz (Google Assistant, Alexa)
- Fuente: Featured snippets + Knowledge Graph
- Clave: Respuestas cortas y directas, formato pregunta-respuesta
- Prioriza: Posición 0 en Google, Schema FAQPage

## Métricas de Éxito GEO/AEO
- Presencia en respuestas de cada LLM (sí/no + posición)
- Número de queries donde aparece el negocio
- Contexto de la mención (recomendado vs solo mencionado)
- Featured snippets conseguidos
- Respuestas de voz que mencionan el negocio
