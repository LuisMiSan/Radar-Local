# SOP-10 — Agente: Generador Chunks

**Categoría:** GEO/AEO | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Documentar el uso del agente **Generador Chunks**, que crea bloques de texto de 40-80 palabras diseñados para ser citados textualmente por las IAs generativas (Gemini, ChatGPT, Perplexity, Copilot) como respuesta de voz. Los chunks son el "cuerpo" semántico del contenido GEO: mientras las FAQs responden preguntas concretas, los chunks proveen descripciones densas y citables del negocio, sus servicios y su ubicación que las IAs pueden usar en respuestas más amplias.

---

## 2. Cuándo ejecutar

- **Onboarding de cliente nuevo** — después de TL;DR Entidad y Generador Schema
- **Después de ejecutar Creador FAQ GEO** — los chunks complementan las FAQs con contenido descriptivo
- **Cambio en servicios o especialidades** — si el negocio añade o modifica sus servicios principales
- **Cambio de ubicación o zona de servicio** — si se muda o amplía cobertura
- **Revisión trimestral** — junto con las FAQs, para mantener el contenido fresco y actualizado

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Prerrequisitos

Antes de ejecutar, confirmar que están disponibles:
- Output del agente **TL;DR Entidad** (el chunk de entidad lo amplía)
- Datos actualizados del cliente: servicios detallados, zona de servicio, POIs cercanos (metro, landmarks, barrios)
- Coordenadas o dirección completa (para el anclaje geográfico del chunk de ubicación)

### Paso 2 — Acceder al agente

1. Ir a `/admin/agentes`
2. En el panel izquierdo, seleccionar **Generador Chunks** (categoría GEO/AEO)
3. Seleccionar el cliente en el selector del panel derecho

### Paso 3 — Revisar datos de entrada relevantes

El agente necesita datos específicos para generar chunks útiles. Verificar en el CRM:
- **Para el chunk de Entidad:** nombre, categoría, especialidad principal, años de actividad, certificaciones o premios, ciudad y barrio
- **Para el chunk de Servicios:** lista de servicios principales (máximo 6), tecnologías o métodos destacados, qué hace diferente este negocio
- **Para el chunk de Ubicación:** dirección exacta, líneas de metro/autobús más cercanas, distancia a pie a referencias conocidas, parking cercano si aplica

### Paso 4 — Ejecutar el agente

1. Hacer clic en **Ejecutar agente**
2. Tiempo estimado: 15-30 segundos
3. Revisar el output antes de entregar

### Paso 5 — Verificar la calidad del output

Para cada chunk generado, confirmar:
- Entre 40 y 80 palabras exactas
- Suena natural al leerlo en voz alta (sin tecnicismos ni siglas sin explicar)
- Incluye el nombre del negocio y la zona geográfica en los primeros 15 palabras
- Contiene datos concretos y verificables (no generalidades)
- No termina con llamada a la acción de marketing ("¡Llámanos hoy!")

---

## 4. Los 3 tipos de chunk obligatorios

El agente genera 3 chunks base que todo cliente necesita. En algunos casos puede generar chunks adicionales para servicios específicos.

### Chunk Tipo 1 — Entidad

**Qué describe:** Quién es el negocio como entidad reconocible.

**Reglas específicas:**
- Abre con nombre + categoría + zona
- Incluye el diferenciador único (qué lo hace especial frente a la competencia)
- Incluye prueba social: años de actividad, número de clientes, certificaciones, premios o rating
- No menciona servicios concretos (eso va en el chunk de Servicios)

**Ejemplo:**
> "Clínica Dental Norte es una clínica dental en Chamberí, Madrid, fundada en 2011 y especializada en odontología estética y ortodoncia invisible. Con más de 4.500 pacientes atendidos y una puntuación de 4,8 estrellas en Google, es una de las clínicas más valoradas del norte de Madrid. El equipo está formado por tres odontólogos con formación especializada en Invisalign y blanqueamiento profesional."

*(68 palabras — dentro del rango)*

---

### Chunk Tipo 2 — Servicios

**Qué describe:** Qué ofrece el negocio concretamente.

**Reglas específicas:**
- Empieza con el servicio principal o más buscado
- Lista 3-5 servicios específicos con detalle suficiente para distinguirlos
- Incluye tecnología, metodología o características que lo diferencian
- Menciona si hay algo disponible el mismo día o sin lista de espera (ventaja competitiva)

**Ejemplo:**
> "Clínica Dental Norte en Chamberí ofrece ortodoncia invisible con Invisalign desde 1.800 euros, blanqueamiento dental profesional en una sola sesión, implantes dentales con carga inmediata y revisiones sin coste para pacientes habituales. Realizan también endodoncias y extracciones con sedación consciente para pacientes con miedo al dentista. Aceptan MAPFRE, Adeslas y pago en cuotas sin intereses."

*(64 palabras — dentro del rango)*

---

### Chunk Tipo 3 — Ubicación

**Qué describe:** Dónde está el negocio y cómo llegar.

**Reglas específicos:**
- Dirección exacta en los primeros 10 palabras
- Referencias geográficas conocidas: nombre del metro + línea, calle principal cercana, landmark del barrio
- Distancia a pie desde el transporte público (en minutos, no en metros)
- Horario de apertura incluido
- Mención del parking si es relevante para el barrio

**Ejemplo:**
> "Clínica Dental Norte está en la calle Ríos Rosas 14, en el barrio de Almagro, a tres minutos a pie del metro Alonso Cano (línea 7) y a cinco minutos del metro Ríos Rosas (línea 1). Abre de lunes a viernes de 9:00 a 20:00 horas y los sábados de 9:00 a 14:00. Hay parking público en la calle Fernández de la Hoz."

*(66 palabras — dentro del rango)*

---

## 5. Qué genera (salida)

El agente devuelve un JSON con el array de chunks y metadatos de implementación:

```json
{
  "chunks": [
    {
      "tipo": "entidad",
      "texto": "Clínica Dental Norte es una clínica dental en Chamberí...",
      "palabras": 68,
      "consulta_voz_ejemplo": "¿Qué dentista hay en Chamberí que sea de confianza?",
      "implementacion_recomendada": ["about page", "home hero", "Google Business Description"]
    },
    {
      "tipo": "servicios",
      "texto": "Clínica Dental Norte en Chamberí ofrece ortodoncia invisible...",
      "palabras": 64,
      "consulta_voz_ejemplo": "¿Hacen ortodoncia invisible en Chamberí?",
      "implementacion_recomendada": ["página de servicios", "landing ortodoncia", "meta description servicios"]
    },
    {
      "tipo": "ubicacion",
      "texto": "Clínica Dental Norte está en la calle Ríos Rosas 14...",
      "palabras": 66,
      "consulta_voz_ejemplo": "¿Cómo llego al dentista de Chamberí?",
      "implementacion_recomendada": ["página de contacto", "footer", "Google Business Description"]
    }
  ],
  "chunks_adicionales": [],
  "notas": "Los tres chunks cubren las consultas de voz más frecuentes para este tipo de negocio en esta zona."
}
```

---

## 6. Cómo interpretar los resultados

| Señal | Qué significa | Acción |
|-------|--------------|--------|
| 3 chunks completos, 40-80 palabras | Output ideal | Implementar directamente |
| Chunk de ubicación sin metro ni transporte | No hay datos de transporte en el CRM | Añadir líneas de metro/bus cercanas al CRM y regenerar |
| Chunk de servicios genérico ("ofrece muchos servicios") | No hay lista de servicios en el CRM | Completar los servicios del cliente y regenerar |
| Palabras > 85 | El agente añadió información por falta de datos concisos | Revisar y acortar manualmente |
| Chunk de entidad sin años de experiencia ni rating | No hay esos datos en el CRM | Añadir fecha de fundación y rating al CRM |
| Todos los chunks empiezan igual | Error de generación — el agente repitió el patrón | Regenerar o editar manualmente para diversificar |

---

## 7. Acciones post-ejecución

### Implementación en la web

**Chunk de Entidad**
- Usar como primer párrafo de la página "Sobre nosotros" o "Quiénes somos"
- Usar como texto principal del bloque hero en la home (si es conciso)
- Usar como Google Business Description (truncar a 750 caracteres si es necesario)

**Chunk de Servicios**
- Usar como párrafo introductorio de la página de servicios o de cada landing de servicio
- Usar como meta description de la página de servicios (truncar a 160 caracteres)
- Ideal para el primer párrafo de entradas de blog sobre servicios específicos

**Chunk de Ubicación**
- Usar en la página de contacto, junto al mapa
- Usar en el footer del sitio web
- Usar en la sección "Cómo llegar" del perfil GBP

### Buenas prácticas de implementación

- Los chunks deben aparecer como texto HTML visible en la página, no ocultos en metadatos o comments
- No cambiar las entidades concretas (nombre del negocio, zona, datos de contacto) al integrar en la web
- Si el diseño de la web requiere acortar el chunk, mantener siempre: nombre + zona + dato principal
- Para blog posts: el chunk puede ser el párrafo de introducción o de cierre. No usarlo en medio del artículo (pierde legibilidad para las IAs)

---

## 8. Frecuencia recomendada

| Evento | Acción |
|--------|--------|
| Onboarding | Generar los 3 chunks base |
| Nuevo servicio principal | Regenerar chunk de Servicios |
| Cambio de dirección o zona | Regenerar chunk de Ubicación |
| Rebrand o cambio de nombre | Regenerar los 3 chunks |
| Revisión trimestral | Regenerar si hay cambios; si no, mantener |
| Sin cambios | No regenerar — los chunks son estables |

---

## 9. Notas y advertencias

- **Los chunks son para ser citados, no parafraseados.** La IA los cita literalmente si son lo suficientemente precisos. Si el operador o el cliente modifica sustancialmente el texto al implementarlo en la web, pierde el efecto de citabilidad.
- **Un chunk con datos incorrectos es contraproducente.** Si Gemini recomienda un negocio citando un horario o precio que ya no es válido, el cliente recibe visitas de usuarios frustrados. Mantener los datos actualizados es prioritario.
- **El anclaje geográfico no es decoración.** Las búsquedas de voz locales siempre tienen una zona implícita o explícita. Un chunk sin nombre de barrio, calle o referencia geográfica será menos relevante para consultas de "dentista en Chamberí" que uno que las incluye explícitamente.
- **Los chunks no reemplazan el contenido editorial.** Son bloques de posicionamiento GEO, no artículos. La web del cliente debe tener también contenido editorial completo (artículos, guías, servicios detallados) para que Google la considere autoritativa.
- **Perplexity da prioridad a chunks en páginas con buena estructura HTML.** Usar etiquetas semánticas (`<p>`, `<section>`, `<article>`) en la implementación, no divs sin clase ni estructura.
