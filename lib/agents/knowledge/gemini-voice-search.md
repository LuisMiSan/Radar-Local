# Búsqueda por Voz, Gemini y Google Maps — Guía Operativa para Agentes
# Fuente: 8 notebooks de investigación del equipo Radar Local

## VISIÓN DE RADAR LOCAL

Radar Local NO hace SEO Local convencional. Prepara negocios para que Gemini los recomiende cuando alguien pregunta por voz. La propuesta es: "Preparamos tu negocio para que Gemini te recomiende cuando alguien pregunta por voz". El diferencial es GEO (Generative Engine Optimization) + AEO (Answer Engine Optimization) frente a agencias de SEO tradicionales.

Dos pilares de servicio:
1. **Visibilidad Local**: Auditoría GBP, optimización NAP, keywords de voz, gestión de reseñas, posts
2. **Autoridad Maps + IA**: Schema JSON-LD, FAQs para Gemini, chunks citables, monitorización en IAs

---

## CÓMO FUNCIONA ASK MAPS CON GEMINI (2025-2026)

### Arquitectura del sistema
- Gemini está integrado en Google Maps como copiloto conversacional
- Combina modelos Gemini con +300 millones de lugares y +500 millones de contribuyentes
- Usa "Grounding with Google Maps": conecta el LLM con datos factuales de ubicación, coordenadas y metadatos estructurados para evitar alucinaciones
- Arquitectura RAG (Retrieval-Augmented Generation): extrae datos del Knowledge Graph de Google y los sintetiza en respuestas conversacionales
- Funciona en navegación (manos libres), exploración, descubrimiento y Google Lens
- La alianza Apple-Google hace que Siri use Gemini, poniendo esta IA en casi todos los móviles

### Tipos de consultas por voz
1. **Descubrimiento**: "¿Dónde hay un buen [categoría] cerca de mí?"
2. **Consultas complejas**: "Mi teléfono se está muriendo, ¿dónde puedo cargarlo sin esperar en una fila de café?"
3. **Contexto social**: "Mis amigos vienen de tal zona, ¿algún lugar con mesa para 4 a las 7?"
4. **Proximidad en ruta**: "¿Hay un restaurante económico con opciones veganas a lo largo de mi ruta?"
5. **Multi-paso**: "¿Cómo es el aparcamiento ahí? OK, vamos allí."
6. **A pie**: "¿En qué barrio estoy?", "¿Cuáles son los mejor valorados cerca?"
7. **Visuales (Lens)**: Apuntar cámara a fachada → Gemini da el "inside scoop" sobre menú, ambiente y si vale la pena
8. **Intención subjetiva ("vibe")**: "busca un café con terraza que no sea una cadena" — Gemini analiza fotos y reseñas para responder

### Datos de mercado 2026
- 60% de búsquedas Google terminan sin clic (zero-click) — la IA da la respuesta directamente
- 50% de todas las búsquedas se realizan por voz
- 44% de usuarios que prueban búsqueda con IA la prefieren sobre la tradicional
- Búsquedas por voz son más largas (+40 caracteres) y conversacionales
- 95% de citaciones de ChatGPT vienen de páginas actualizadas en los últimos 10 meses

---

## LOS 4 PILARES DEL RANKING EN GOOGLE MAPS

### 1. Proximidad + Radio de Autoridad
- Filtro inicial por coordenadas del usuario
- PERO un negocio con reputación digital robusta puede superar a uno más cercano si la IA confía más en su idoneidad
- Gemini usa coordenadas exactas + datos GPS de fotos para validar ubicación

### 2. Relevancia Semántica
- Ya NO es coincidencia de palabras clave — es entender la INTENCIÓN
- La IA analiza si contenido y reseñas responden a escenarios de uso específicos
- Evalúa atributos del perfil: accesibilidad, Wi-Fi, música en vivo, parking, opciones de pago, "bueno para niños"

### 3. Prominencia (Trust)
- Construida por señales de consenso: Gemini corrobora datos del perfil con menciones en medios, redes, directorios
- GBP representa el 36% del peso total del ranking
- Reseñas online: 16% del peso — no solo estrellas, sino análisis de sentimiento y extracción de temas
- SEO On-Page: 17% — estructura web, keywords locales en H1 y meta
- Consistencia NAP idéntica en toda la web genera confianza algorítmica
- Cámaras de comercio, patrocinios locales, menciones .gov/.edu son señales potentes

### 4. Inteligencia Contextual (NUEVO)
- Hora del día, clima, modo de transporte del usuario
- Historial de preferencias personales (lugares guardados, búsquedas previas)
- Contexto dinámico: prioriza opciones veganas si el usuario lo prefiere
- "Goal Completion": si un usuario llama o pide direcciones y no vuelve a buscar, Google considera que el negocio resolvió la necesidad

---

## FACTORES QUE GEMINI EVALÚA PARA RECOMENDAR

1. **Reseñas y rating** — Factor nº1. Análisis de sentimiento + extracción de temas ("la gente viene por el ambiente romántico"). Review velocity (flujo constante) importa más que cantidad total.
2. **Completitud del perfil** — Horarios reales (evitar que Gemini envíe a un local cerrado), fotos, web, descripción, TODOS los atributos binarios activados.
3. **Match semántico con la consulta** — Keywords en descripción, categoría, servicios que coincidan con la INTENCIÓN del usuario.
4. **Proximidad** — Cercanía al usuario o su ruta actual.
5. **Personalización** — Historial del usuario, lugares guardados, preferencias aprendidas.
6. **Frescura** — Posts recientes, fotos nuevas, respuestas a reseñas, contenido actualizado.
7. **Datos estructurados (Schema)** — JSON-LD es el "idioma oficial" de la IA. Sin LocalBusiness, FAQPage o Service, el contenido es ruido.
8. **Señales visuales** — Fotos reales geoetiquetadas (EXIF con GPS), videos cortos (<30-45 seg), Street View.
9. **Super Citaciones** — Presencia verificada en Apple Maps, Bing Places, Yelp, Waze, directorios especializados.
10. **Presencia conversacional** — Menciones útiles en Reddit, foros locales — la IA lee estas conversaciones.

---

## OPTIMIZACIÓN PARA BÚSQUEDA POR VOZ

### Principio fundamental
La búsqueda por voz es CONVERSACIONAL. El usuario NO dice "restaurante italiano Madrid centro" — dice "¿Dónde puedo comer una buena pasta cerca de aquí que no sea muy caro?". Todo el contenido debe responder a PREGUNTAS NATURALES en lenguaje hablado.

### Regla de las 60 palabras
La respuesta central debe estar al inicio del contenido, en 40-60 palabras. Este "punto dulce" facilita que la IA extraiga el fragmento para leer en voz alta.

### Formato de contenido que Gemini puede citar
1. **Respuestas directas** (2-3 frases): Gemini extrae y lee en voz alta
2. **Datos verificables**: Horarios exactos, dirección, rango de precios, nº reseñas
3. **Diferenciadores claros**: "Especializado en...", "El único en la zona que..."
4. **Párrafos atómicos**: 1-3 frases que entreguen un concepto completo de forma independiente
5. **Listas y tablas**: Los motores de respuesta adoran estructuras enumeradas
6. **FAQs con preguntas exactas**: Como las diría un usuario en un prompt de voz

### Patrones de búsqueda por voz en español
- "¿Dónde hay un [categoría] cerca de mí?"
- "¿Cuál es el mejor [categoría] en [zona]?"
- "¿Hay algún [categoría] abierto ahora?"
- "¿Me puedes recomendar un [categoría] bueno en [ciudad]?"
- "Necesito un [categoría] que haga [servicio específico]"
- "¿Cuánto cuesta [servicio] en [zona]?"
- "¿Qué horario tiene [negocio]?"
- "¿Cómo llego a [negocio] desde aquí?"
- "Búscame un [categoría] [cualidad] cerca de [referencia]"
- "¿Qué dicen de [negocio]? ¿Vale la pena?"

### Descripciones optimizadas para IA
NO usar relleno de keywords. Redactar en lenguaje natural que responda a preguntas habladas.
- MAL: "Mejor taller mecánico Madrid centro reparaciones coche"
- BIEN: "Somos un taller especializado en transmisiones automáticas de vehículos europeos en el centro de Madrid, con más de 15 años de experiencia"

### Entidades técnicas vs adjetivos vacíos
Sustituir descripciones genéricas por materiales/servicios específicos que la IA pueda validar:
- MAL: "ventanas buenas", "materiales de calidad", "el mejor servicio"
- BIEN: "carpintería con rotura de puente térmico", "mármol de Carrara", "sistema de aerotermia certificado"

---

## ESTRATEGIA DE RESEÑAS PARA IA

Las reseñas son COMBUSTIBLE para Gemini. La IA no solo mira estrellas — hace análisis de sentimiento y extracción de temas.

### Estructura ideal de reseña (Barrio + Problema + Solución)
"Increíble transformación de nuestro ático en [barrio]. La eficiencia del [solución técnica] superó las expectativas."

### Qué incentivar que mencionen los clientes:
- El barrio o zona específica
- El problema concreto que se resolvió
- La solución técnica aplicada
- Detalles sensoriales: "ambiente tranquilo", "fácil de estacionar", "terraza con vistas"

### Señales que Gemini detecta con ML
- Algoritmos eliminan 45% más reseñas falsas — solo genuinas cuentan
- Picos sospechosos de reseñas = penalización
- Recencia vital: review velocity constante > acumular muchas de golpe

---

## SCHEMA CRÍTICO PARA VOZ

### Schemas obligatorios
- **LocalBusiness** (usar subtipo más específico: Dentist, Restaurant, etc.) con TODOS los campos
- **FAQPage**: Preguntas reales en lenguaje conversacional (3.2x más probabilidad de aparecer en resúmenes IA)
- **OpeningHoursSpecification**: Para "¿está abierto ahora?"
- **AggregateRating**: Para "¿cuál es el mejor...?"
- **GeoCoordinates**: Para "¿dónde hay un... cerca?"
- **Service**: Para "necesito un [servicio]"
- **Speakable**: Indica a asistentes qué partes leer en voz alta

### Schemas recomendados
- **hasMap**: Para "¿cómo llego a...?"
- **areaServed**: Con barrios/zonas específicos
- **ProfessionalService**: Para profesionales/servicios especializados
- **HowTo**: Guías paso a paso que la IA puede sintetizar

### llms.txt
Archivo en raíz del sitio que sirve como "menú VIP" para agentes de IA, guiándolos al contenido de mayor valor sin ruido de diseño/anuncios.

---

## ANCLAJE GEOGRÁFICO

No solo mencionar la ciudad. Vincular con hitos locales (POIs):
- "Frente al Retiro", "a 2 minutos del metro Sol", "en el corazón de Malasaña"
- Usar coordenadas GPS en metadatos EXIF de fotos
- Crear páginas dedicadas por barrio/zona de servicio (evitar Doorway Pages — contenido único)

---

## OPTIMIZACIÓN MULTI-PLATAFORMA

### Google (Gemini)
- GBP completamente optimizado es la fuente primaria
- JSON-LD obligatorio
- Fotos reales geoetiquetadas

### ChatGPT
- Usa índice de Bing → estar en Bing Places es OBLIGATORIO
- Cita páginas actualizadas en últimos 10 meses
- Prioriza fuentes con E-E-A-T demostrable

### Apple (Siri)
- Ahora corre bajo Gemini pero usa Apple Maps
- Listados verificados en Apple Maps son críticos
- Consistencia NAP con Apple Business Connect

### Perplexity
- Similar a ChatGPT en fuentes
- Prioriza contenido estructurado y citable
- FAQs bien formateadas tienen alta probabilidad de citación

### Alexa/Cortana
- Dependen de Bing Places
- Requieren datos consistentes en directorios principales

---

## DIRECTRICES PARA AGENTES DE VOZ

### Al generar FAQs para voz:
1. Usar lenguaje CONVERSACIONAL, no formal. "¿Dónde está?" no "¿Cuál es la ubicación?"
2. Preguntas en primera persona: "¿Me pueden atender sin cita?", "¿Tienen parking?"
3. Respuestas CORTAS (40-60 palabras) con datos concretos verificables
4. Incluir nombre del negocio + zona en la respuesta
5. Cada FAQ autocontenida (funciona sin contexto adicional)
6. Cubrir 7 intenciones: descubrimiento, horarios, servicios, acceso, comparación, precio, confianza
7. Escribir exactamente como un usuario lo diría en un prompt de voz

### Al generar chunks citables:
1. Cada chunk = 1 respuesta completa a 1 pregunta (40-80 palabras)
2. Incluir: nombre + categoría + ubicación + diferenciador + dato verificable
3. NO jerga técnica — lenguaje de cliente real
4. Optimizar para lectura en voz alta (que suene natural hablado)
5. Usar sustantivos concretos, no adjetivos vacíos
6. Incluir POIs cercanos para anclaje geográfico

### Al generar Schema JSON-LD:
1. FAQPage con mínimo 5 preguntas en lenguaje de voz
2. LocalBusiness con subtipo específico y TODOS los campos posibles
3. AggregateRating siempre que haya reseñas
4. OpeningHoursSpecification detallado (cada día)
5. areaServed con barrios/zonas específicos
6. Servicios listados individualmente
7. Speakable en secciones clave

### Al generar TL;DR de entidad:
1. Formato: "[Nombre] es [categoría] en [zona]. [Diferenciador]. [Dato social]. [Contacto]."
2. Máximo 4 frases — lo que Gemini puede leer como respuesta de voz
3. Incluir rating y nº reseñas (prueba social)
4. Mencionar 1-3 servicios principales
5. Incluir consultas_voz_ejemplo que activarían esta respuesta

### Al monitorizar presencia en IAs:
1. Verificar en Gemini, ChatGPT, Perplexity y Siri
2. Probar con consultas de voz reales en español
3. Evaluar si el negocio aparece como recomendación directa
4. Comparar contra competidores en mismas consultas
5. Medir score_voz (0-100) basado en presencia, citación y posición

### Al generar keywords:
1. Tres bloques: keywords_map_pack, keywords_voz, keywords_geo
2. Keywords de voz en formato pregunta conversacional completa
3. Incluir las 5W (quién, qué, cuándo, dónde, por qué)
4. Priorizar long-tail conversacionales sobre short-tail genéricos

---

## MÉTRICAS DE ÉXITO VOZ

- ¿Gemini recomienda el negocio en consultas de voz relevantes?
- ¿El negocio aparece como featured snippet para preguntas locales?
- ¿Las FAQs aparecen en "Preguntas frecuentes" de Google?
- ¿El Schema FAQPage está indexado y activo?
- ¿La web pasa Core Web Vitals (requisito para posición 0)?
- ¿Las reseñas son suficientes (>20) y positivas (>4.0)?
- ¿Hay presencia en Bing Places y Apple Maps?
- ¿El contenido fue actualizado en los últimos 10 meses?
- ¿Las fotos son reales y geoetiquetadas?
- ¿Hay un llms.txt configurado?
- ¿El negocio aparece en citaciones de ChatGPT/Perplexity?
