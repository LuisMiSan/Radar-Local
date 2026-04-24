# SOP-09 — Agente: Creador FAQ GEO

**Categoría:** GEO/AEO | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Documentar el uso del agente **Creador FAQ GEO**, que genera preguntas frecuentes conversacionales optimizadas para ser leídas en voz alta por Gemini, Siri, Google Assistant y otros motores de respuesta. Cada FAQ cubre una de las 7 intenciones de voz que un usuario potencial puede tener cuando busca un negocio local. El objetivo no es solo informar: es que la IA elija *este negocio* como la respuesta.

---

## 2. Cuándo ejecutar

- **Onboarding de cliente nuevo** — después de ejecutar TL;DR Entidad (SOP-11) y Generador Schema (SOP-08)
- **Cambio en servicios del negocio** — si el cliente añade o elimina servicios principales
- **Cambio de precios o tarifas** — cuando la política de precios cambie significativamente
- **Cambio de horarios** — horarios de apertura actualizados
- **Revisión trimestral** — refrescar FAQs para mantener relevancia y cobertura

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Prerrequisitos

Antes de ejecutar este agente, confirmar que ya existen:
- Output del agente **TL;DR Entidad** guardado en el CRM del cliente
- Output del agente **Generador Schema** implementado (o al menos generado) en la web
- Datos actualizados del cliente: servicios, precios (si los hay), horarios, zona de servicio

### Paso 2 — Acceder al agente

1. Ir a `/admin/agentes`
2. En el panel izquierdo, seleccionar **Creador FAQ GEO** (categoría GEO/AEO)
3. Seleccionar el cliente en el selector del panel derecho

### Paso 3 — Revisar los datos de entrada

El agente usa automáticamente los datos del CRM, pero antes de ejecutar verificar que están completos:
- Nombre del negocio y zona geográfica (barrio, ciudad, distrito)
- Categoría y servicios principales
- Horarios de apertura
- Precio orientativo o rango de precios (si aplica)
- Rating y número de reseñas
- Diferenciador principal (qué hace a este negocio único)
- Puntos de acceso y transporte público cercano

### Paso 4 — Ejecutar el agente

1. Hacer clic en **Ejecutar agente**
2. Tiempo estimado: 20-45 segundos (genera múltiples FAQs en una sola llamada)
3. El output aparece en el panel derecho

### Paso 5 — Revisar la calidad de las FAQs

Verificar para cada FAQ:
- La respuesta tiene entre 40-60 palabras (apta para voz)
- Incluye el nombre del negocio y la zona geográfica
- No hay ambigüedad: una sola pregunta, una sola respuesta
- El lenguaje es conversacional (como hablaría una persona, no un folleto)
- Las 7 intenciones de voz están cubiertas (ver sección siguiente)

---

## 4. Las 7 intenciones de voz cubiertas

El agente genera al menos una FAQ por cada una de estas intenciones:

| # | Intención | Ejemplo de consulta real | Qué busca el usuario |
|---|-----------|-------------------------|---------------------|
| 1 | **Descubrimiento** | "¿Qué dentistas hay en Chamberí?" | Encontrar opciones en su zona |
| 2 | **Horarios** | "¿A qué hora cierra la clínica dental en Malasaña?" | Planificar su visita |
| 3 | **Servicios** | "¿Hacen ortodoncia invisible en [nombre]?" | Confirmar que ofrecen lo que necesita |
| 4 | **Acceso / Cómo llegar** | "¿Cómo llego a la clínica dental de Chamberí?" | Planificar el desplazamiento |
| 5 | **Comparación** | "¿Por qué elegir [nombre] y no otra clínica?" | Justificar su decisión |
| 6 | **Precio** | "¿Cuánto cuesta una limpieza dental en Chamberí?" | Evaluar si puede permitírselo |
| 7 | **Confianza** | "¿Es buena la clínica dental [nombre]?" | Validar la elección antes de llamar |

---

## 5. Qué genera (salida)

El agente devuelve un JSON con el array de FAQs y el schema FAQPage listo para implementar:

```json
{
  "faqs": [
    {
      "pregunta": "¿Qué dentistas hay en el barrio de Chamberí en Madrid?",
      "respuesta": "Clínica Dental Norte es un dentista en Chamberí, Madrid, especializado en odontología general, ortodoncia invisible y blanqueamiento dental. Está ubicado en la calle Ríos Rosas 14, a dos minutos a pie del metro Alonso Cano. Abre de lunes a viernes de 9:00 a 20:00 horas.",
      "intencion": "descubrimiento",
      "palabras": 52
    },
    {
      "pregunta": "¿Cuánto cuesta una limpieza dental en Chamberí?",
      "respuesta": "En Clínica Dental Norte, en Chamberí, la limpieza dental profesional tiene un precio de 65 euros e incluye revisión y diagnóstico completo. Es uno de los precios más competitivos del barrio para una clínica con más de 12 años de experiencia y 4,8 estrellas en Google.",
      "intencion": "precio",
      "palabras": 48
    }
  ],
  "total_faqs": 7,
  "intenciones_cubiertas": ["descubrimiento", "horarios", "servicios", "acceso", "comparacion", "precio", "confianza"],
  "schema_faqpage": {
    "script": "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\",\n  \"mainEntity\": [ ... array de Question+acceptedAnswer ... ]\n}\n</script>",
    "descripcion": "Schema FAQPage listo para insertar en el <head> de la página FAQ del cliente"
  },
  "notas_implementacion": {
    "pagina_principal": "Página /faq o sección FAQ en la home",
    "gbp": "Añadir las FAQs de tipo descubrimiento y horarios en la sección Q&A del perfil GBP",
    "schema": "Insertar el script FAQPage en el <head> de la misma página donde estén las FAQs visibles"
  }
}
```

---

## 6. Reglas de calidad de las FAQs

El agente aplica automáticamente estas reglas, pero el operador debe verificarlas antes de entregar:

**Conversacional** — La pregunta y la respuesta suenan naturales al hablarlas, no al leerlas. "¿Qué dentistas hay en Chamberí?" es correcto. "¿Cuáles son los servicios odontológicos disponibles en la zona de Chamberí?" es incorrecto (demasiado formal para voz).

**Atómico (40-60 palabras)** — Cada respuesta es autocontenida: un solo tema, una sola respuesta. Si un asistente de voz lee la respuesta, tiene sentido sin contexto adicional. Respuestas de menos de 40 palabras pueden ser incompletas. Más de 60 palabras pueden cortarse en voz.

**Verificable** — Los datos incluidos (precio, horario, dirección, rating) deben ser correctos y estar en el CRM. Una FAQ con datos incorrectos es peor que no tener FAQ.

**Citable** — La respuesta debe poder ser leída literalmente por la IA como respuesta completa. No puede terminar con "...visítenos para más información" ni frases incompletas.

**Anclaje geográfico** — Cada respuesta incluye el nombre del negocio + la zona (barrio, calle o referencia geográfica). Esto es crítico para las búsquedas locales de voz.

---

## 7. Cómo interpretar los resultados

| Señal | Qué significa | Acción |
|-------|--------------|--------|
| 7 FAQs, todas las intenciones cubiertas | Output ideal | Implementar directamente |
| Menos de 7 FAQs | Faltan datos en el CRM (precio, horario, etc.) | Completar CRM y regenerar |
| Respuestas > 65 palabras | El agente tuvo que incluir mucha info por falta de concisión en los datos | Revisar manualmente y acortar |
| Respuestas sin nombre del negocio | Error de contexto — el agente no recibió el nombre correctamente | Verificar datos en CRM y regenerar |
| FAQ de precio con "consultar precio" | No hay datos de precio en el CRM | Añadir precio orientativo o rango al CRM |
| Intención "confianza" genérica | No hay datos de rating/reseñas | Añadir rating y número de reseñas al CRM |

---

## 8. Acciones post-ejecución

### Implementación en la web del cliente

**Opción A — Página FAQ dedicada (recomendado)**
1. Crear una página `/faq` en la web del cliente
2. Añadir las 7 preguntas y respuestas en formato HTML expandible (accordion) o listado simple
3. Insertar el schema FAQPage del output en el `<head>` de esa página
4. Verificar con Google Rich Results Test

**Opción B — Sección FAQ en la home page**
1. Añadir una sección "Preguntas frecuentes" en la página principal
2. Incluir las 3-5 FAQs más relevantes (descubrimiento, horarios, servicios)
3. Insertar el schema FAQPage en el `<head>` de la home

**IMPORTANTE:** El schema FAQPage solo funciona si las preguntas y respuestas también son visibles en el HTML de la página. No sirve de nada poner el schema si el contenido no está en la página.

### Implementación en Google Business Profile

1. Ir al perfil GBP del cliente
2. Sección **"Preguntas y respuestas" (Q&A)**
3. Añadir manualmente las FAQs de intención **descubrimiento** y **horarios** (estas son las que Gemini usa para respuestas en Maps)
4. Usar el texto exacto del output — no parafrasear

### Verificación en Rich Results Test

1. Ir a https://search.google.com/test/rich-results
2. Introducir la URL de la página FAQ del cliente
3. Confirmar que aparece el tipo "FAQ" en los resultados enriquecidos
4. Guardar captura para el informe del cliente

---

## 9. Frecuencia recomendada

| Evento | Acción |
|--------|--------|
| Onboarding | Ejecutar completo (7 FAQs) |
| Cambio de servicios | Regenerar FAQs de intención "servicios" y "comparación" |
| Cambio de precios | Regenerar FAQ de intención "precio" |
| Cambio de horarios | Regenerar FAQ de intención "horarios" |
| Revisión trimestral | Regenerar todas para mantener frescura |
| Sin cambios | No regenerar — las FAQs son estables |

---

## 10. Notas y advertencias

- **El schema FAQPage y el contenido HTML deben coincidir.** Si las FAQs del schema no coinciden con el texto visible en la página, Google puede penalizar o ignorar el schema. Siempre implementar juntos.
- **Las FAQs del GBP son diferentes de las del sitio web.** En GBP, las respuestas pueden ser ligeramente más cortas (30-45 palabras) porque Gemini las muestra en un contexto visual. En la web, las respuestas de 40-60 palabras son el estándar para voz.
- **No publicar FAQs con datos desactualizados.** Una FAQ que dice "abrimos hasta las 20:00" cuando ahora cierran a las 18:00 genera desconfianza. El precio de mantener las FAQs actualizadas es mínimo; el coste de tenerlas incorrectas es alto.
- **Gemini da prioridad a las FAQs de negocios verificados en GBP.** Si el cliente aún no tiene GBP verificado, la implementación web del schema tiene el mismo efecto para Perplexity y ChatGPT, pero Gemini le dará menos peso en Maps. Priorizar la verificación GBP.
- **Las 7 intenciones no son opcionales.** Cada una cubre un momento diferente del proceso de decisión del usuario. Un negocio que solo tiene FAQs de "descubrimiento" y "horarios" pierde a los usuarios en la fase de evaluación (precio, confianza, comparación).
