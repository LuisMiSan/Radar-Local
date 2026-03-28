# Búsqueda por Voz y Gemini en Google Maps — Guía Operativa

## CÓMO FUNCIONA ASK MAPS CON GEMINI (2025-2026)

### Arquitectura del sistema
- Gemini está integrado directamente en Google Maps como experiencia conversacional.
- Combina los modelos Gemini con la base de datos de +300 millones de lugares y +500 millones de contribuyentes.
- Funciona en navegación (conducción, caminata, ciclismo), exploración y descubrimiento.

### Tipos de consultas por voz que procesan
1. **Consultas complejas del mundo real**: "Mi teléfono se está muriendo, ¿dónde puedo cargarlo sin esperar en una fila larga de café?"
2. **Consultas con contexto social**: "Mis amigos vienen de tal zona, ¿algún lugar con mesa para 4 a las 7?"
3. **Consultas de proximidad en ruta**: "¿Hay un restaurante económico con opciones veganas a lo largo de mi ruta, a un par de kilómetros?"
4. **Consultas de seguimiento multi-paso**: "¿Cómo es el aparcamiento ahí? OK, vamos allí."
5. **Consultas a pie**: "¿En qué barrio estoy?", "¿Cuáles son los restaurantes mejor valorados cerca?"
6. **Consultas visuales (Lens)**: Apuntar cámara → "¿Qué es este lugar y por qué es popular?"

### LO QUE GEMINI EVALÚA PARA RECOMENDAR UN NEGOCIO
1. **Reseñas y rating** — Factor nº1. Gemini busca "top-rated" y analiza sentiment de reseñas.
2. **Completitud del perfil** — Horarios, fotos, web, descripción. La IA extrae todo esto.
3. **Match con la consulta** — Keywords en descripción, categoría y servicios que coincidan con la intención.
4. **Proximidad** — Cercanía a la ubicación del usuario o su ruta actual.
5. **Personalización** — Historial de búsqueda, lugares guardados, preferencias aprendidas del usuario.
6. **Frescura** — Actividad reciente (posts, fotos nuevas, respuestas a reseñas).
7. **Visibilidad Street View** — Gemini usa imágenes de Street View para landmarks visibles desde la calle.

## CÓMO OPTIMIZAR PARA BÚSQUEDA POR VOZ

### Principio fundamental
La búsqueda por voz es CONVERSACIONAL. El usuario NO dice "restaurante italiano Madrid centro" — dice "¿Dónde puedo comer una buena pasta cerca de aquí que no sea muy caro?". El contenido debe responder a PREGUNTAS NATURALES.

### Formato de contenido que Gemini puede citar
1. **Respuestas directas** (2-3 frases máximo): Gemini extrae la respuesta y la lee en voz alta.
2. **Datos verificables**: Horarios exactos, dirección completa, rango de precios, nº de reseñas.
3. **Diferenciadores claros**: "Especializado en...", "El único en la zona que...", "Con más de X años de..."
4. **Formato pregunta-respuesta**: FAQs que coincidan con cómo habla la gente.

### Patrones de búsqueda por voz en español
- "¿Dónde hay un [categoría] cerca de mí?"
- "¿Cuál es el mejor [categoría] en [zona]?"
- "¿Hay algún [categoría] abierto ahora?"
- "¿Me puedes recomendar un [categoría] bueno en [ciudad]?"
- "Necesito un [categoría] que haga [servicio específico]"
- "¿Cuánto cuesta [servicio] en [zona]?"
- "¿Qué horario tiene [negocio]?"
- "¿Cómo llego a [negocio] desde aquí?"

## FACTORES DE RANKING EN BÚSQUEDA POR VOZ

### Posición 0 (Featured Snippet) = Respuesta de voz
Google Assistant/Gemini lee el featured snippet como respuesta. Para capturarlo:
- FAQPage schema con preguntas en lenguaje natural
- Respuestas concisas de 40-60 palabras (lo que cabe en una respuesta hablada)
- Formato "pregunta como heading + respuesta como párrafo"

### Schema crítico para voz
- **FAQPage**: Preguntas reales en lenguaje conversacional
- **LocalBusiness** con todos los campos
- **OpeningHoursSpecification**: Para "¿está abierto ahora?"
- **AggregateRating**: Para "¿cuál es el mejor...?"
- **GeoCoordinates**: Para "¿dónde hay un... cerca?"
- **hasMap**: Para "¿cómo llego a...?"

### Señales que Gemini detecta con ML
- **Autenticidad de reseñas**: Algoritmos detectan y eliminan 45% más reseñas falsas. Solo reseñas genuinas cuentan.
- **Patrones sospechosos**: Picos de reseñas, misma reseña en múltiples negocios, cuentas fraudulentas.
- **Calidad de fotos**: Fotos reales del negocio vs fotos de stock.
- **Actividad orgánica**: Contribuciones naturales de clientes reales.

## DIRECTRICES PARA AGENTES DE VOZ

### Al generar FAQs para voz:
1. Usar lenguaje CONVERSACIONAL, no formal. "¿Dónde está?" no "¿Cuál es la ubicación?"
2. Preguntas en primera persona: "¿Me pueden atender sin cita?", "¿Tienen parking?"
3. Respuestas CORTAS (40-60 palabras) con datos concretos
4. Incluir el nombre del negocio + zona en la respuesta
5. Cada FAQ debe ser autocontenida (funciona sin contexto adicional)
6. Cubrir las 5 intenciones: encontrar, comparar, horarios, precios, cómo llegar

### Al generar chunks citables:
1. Cada chunk = 1 respuesta completa a 1 pregunta
2. Incluir: nombre + categoría + ubicación + diferenciador + dato verificable
3. NO usar jerga técnica — lenguaje que usaría un cliente real
4. Optimizar para ser leído en voz alta (que suene natural)

### Al generar Schema JSON-LD:
1. FAQPage con mínimo 5 preguntas en lenguaje de voz
2. LocalBusiness con TODOS los campos posibles
3. AggregateRating siempre que haya reseñas
4. OpeningHoursSpecification detallado (cada día)
5. areaServed con barrios/zonas específicos
6. Usar el subtipo más específico (Dentist, not LocalBusiness)

### Al generar TL;DR de entidad:
1. Formato: "[Nombre] es [categoría] en [zona]. [Diferenciador]. [Dato social]. [Contacto]."
2. Máximo 4 frases — lo que Gemini puede leer como respuesta
3. Incluir rating y nº reseñas (prueba social)
4. Mencionar servicios principales (1-3 máximo)

## MÉTRICAS DE ÉXITO VOZ

- ¿Gemini recomienda el negocio en consultas de voz relevantes?
- ¿El negocio aparece como featured snippet para preguntas locales?
- ¿Las FAQs del negocio aparecen en "Preguntas frecuentes" de Google?
- ¿El Schema FAQPage está indexado y activo?
- ¿La web pasa Core Web Vitals (requisito para posición 0)?
- ¿Las reseñas son suficientes (>20) y positivas (>4.0)?
