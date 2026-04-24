# SOP-06 — Redactor Posts GBP

**Categoría:** Map Pack | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Crear posts para Google Business Profile que cumplan dos funciones simultáneas:
1. **Enviar señales de actividad a Google:** El algoritmo de Map Pack valora los negocios que actualizan su perfil regularmente. Un perfil sin posts recientes pierde relevancia frente a competidores activos.
2. **Proporcionar entidades actualizadas a Gemini:** Gemini analiza los posts recientes para entender qué ofrece el negocio *ahora*, no solo lo que dice la descripción. Un post bien redactado puede hacer que Gemini incluya a un negocio en recomendaciones que antes no conseguía.

Los posts de GBP tienen **caducidad efectiva de 7 días** para señales de actividad (aunque permanecen visibles). Por eso la frecuencia semanal es el estándar del sector.

El agente genera el **calendario completo de posts del mes** — el operador solo necesita publicarlos uno por semana en GBP.

---

## 2. Cuándo ejecutar

- **Mensual (ciclo estándar):** Primera semana del mes. Genera el calendario de 4 posts para publicar durante el mes.
- **Tras ejecutar Keywords Locales:** Si es la primera vez para un cliente, ejecutar Keywords Locales antes para que los posts incorporen las keywords correctas.
- **Ante eventos o promociones especiales:** Si el cliente tiene una promoción, evento o novedad importante fuera del ciclo mensual, ejecutar el agente puntualmente para ese post específico.
- **Tras cambios de temporada o catálogo:** Nuevos servicios, horarios especiales, cambios de precio — ejecutar para actualizar el contenido.

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Preparar el briefing del mes

Reunir la información del mes en curso:

**Obligatorio:**
- Servicios principales que el cliente quiere destacar este mes
- ¿Hay alguna promoción u oferta activa? (nombre, condiciones, fechas, límites)
- ¿Hay algún evento relevante? (taller, jornada de puertas abiertas, colaboración...)
- Horarios especiales del mes (festivos, vacaciones, horario de verano...)
- Keywords locales del cliente (del output del agente Keywords Locales)

**Opcional pero recomendado:**
- Caso de éxito reciente que el cliente quiera compartir (sin datos personales del paciente/cliente)
- Consejo o información útil relacionada con el sector
- Novedad del sector relevante para los clientes del negocio

### Paso 2 — Definir el mix de tipos de post

El agente puede generar 6 tipos de post. Para un mes estándar (4 posts), el mix recomendado es:

| Semana | Tipo recomendado | Razón |
|---|---|---|
| Semana 1 | Actualización o Servicio destacado | Arrancar el mes con contenido informativo |
| Semana 2 | Consejo o Caso de éxito | Generar confianza y demostrar expertise |
| Semana 3 | Novedad u Oferta (si hay) | Activar conversión |
| Semana 4 | Evento o Recordatorio de servicio | Cierre de mes con CTA claro |

### Paso 3 — Ejecutar el agente

- Acceder a `/admin/agentes`
- Seleccionar el cliente en el panel izquierdo
- Seleccionar agente `redactor_posts_gbp` en el panel derecho
- Introducir:
  - Briefing del mes (servicios, promociones, eventos)
  - Keywords locales a incorporar (3-5 keywords prioritarias de Map Pack)
  - Tono del negocio (si ya se hizo el análisis en Gestor Reseñas, indicar el perfil de voz)
  - Mix de tipos de post deseado (o dejar que el agente decida)
- Ejecutar y esperar resultado (3-5 minutos)

### Paso 4 — Revisar el JSON de salida

Para cada post generado, verificar:
- ¿El texto suena natural o forzado?
- ¿El CTA es concreto y accionable?
- ¿La keyword aparece de forma orgánica (no como relleno)?
- ¿El texto tiene entre 150-300 palabras? (ideal para GBP)
- ¿Hay anclaje geográfico en el texto?
- ¿Hay información que deba verificarse con el cliente antes de publicar?

Ajustar manualmente si es necesario.

---

## 4. Qué genera (salida)

```json
{
  "cliente": "Fisioterapia García - Malasaña, Madrid",
  "mes": "Mayo 2026",
  "total_posts": 4,
  "posts": [
    {
      "id": "post_001",
      "semana": 1,
      "fecha_publicacion_sugerida": "2026-05-06",
      "tipo": "servicio_destacado",
      "titulo": "Fisioterapia deportiva en Malasaña: recupera tu rendimiento",
      "texto": "¿Tienes una lesión que no termina de ir bien? En nuestra clínica de fisioterapia en Malasaña trabajamos con deportistas de todos los niveles, desde corredores de fin de semana hasta atletas amateur.\n\nNuestra especialidad es la recuperación de lesiones musculares y articulares con técnicas de fisioterapia manual y ejercicio terapéutico. Primera sesión de valoración sin compromiso.\n\nEstamos en el corazón de Malasaña, fácil acceso desde Tribunal y San Bernardo.",
      "cta": "Reserva tu cita hoy — llama al 91 234 56 78 o escríbenos por WhatsApp",
      "keywords_incluidas": ["fisioterapia Malasaña", "fisioterapia deportiva", "lesiones musculares"],
      "entidades_gemini": ["fisioterapia", "Malasaña", "deportistas", "recuperación", "Tribunal"],
      "notas_publicacion": "Añadir foto de la sala de tratamiento o del equipo al publicar en GBP"
    },
    {
      "id": "post_002",
      "semana": 2,
      "fecha_publicacion_sugerida": "2026-05-13",
      "tipo": "consejo",
      "titulo": "3 señales de que tu dolor de espalda necesita fisioterapia",
      "texto": "El dolor de espalda es la consulta más frecuente en nuestra clínica en Malasaña, y muchos pacientes nos dicen lo mismo: 'esperé demasiado'.\n\nEstas son las señales que indican que ya es momento de venir:\n• El dolor lleva más de 2 semanas sin mejorar\n• Sientes hormigueo o entumecimiento en piernas o brazos\n• El dolor te despierta por la noche\n\nUna evaluación a tiempo evita que el problema se cronifique. Atendemos en Madrid centro, zona Malasaña y Conde Duque.",
      "cta": "¿Te identificas con alguna de estas señales? Llámanos o reserva online",
      "keywords_incluidas": ["dolor de espalda", "fisioterapia Malasaña", "Madrid centro"],
      "entidades_gemini": ["dolor de espalda", "fisioterapia", "Malasaña", "Conde Duque", "Madrid centro"],
      "notas_publicacion": "Tipo de post: Actualización. No usar tipo Oferta para este contenido."
    },
    {
      "id": "post_003",
      "semana": 3,
      "fecha_publicacion_sugerida": "2026-05-20",
      "tipo": "oferta",
      "titulo": "Revisión postural gratuita durante mayo en Malasaña",
      "texto": "Este mes ofrecemos revisiones posturales gratuitas de 20 minutos para nuevos pacientes en nuestra clínica de fisioterapia en Malasaña.\n\nEn la revisión evaluamos tu postura, detectamos tensiones acumuladas y te damos recomendaciones personalizadas. Sin compromiso de tratamiento.\n\nPlazas limitadas — disponibles martes y jueves por las tardes.",
      "cta": "Reserva tu revisión gratuita: llama al 91 234 56 78",
      "keywords_incluidas": ["fisioterapeuta Malasaña", "revisión postural"],
      "entidades_gemini": ["revisión postural", "fisioterapia", "Malasaña", "nuevos pacientes"],
      "notas_publicacion": "Usar tipo de post 'Oferta' en GBP. Añadir fecha de fin de oferta: 31 de mayo. Foto: imagen del área de evaluación."
    },
    {
      "id": "post_004",
      "semana": 4,
      "fecha_publicacion_sugerida": "2026-05-27",
      "tipo": "caso_exito",
      "titulo": "Vuelta a la carrera después de una lesión de rodilla",
      "texto": "Hace tres meses, uno de nuestros pacientes llegó a la clínica con una tendinopatía rotuliana que le impedía correr. Llevaba semanas parado y empezaba a pensar que no iba a poder volver a sus entrenos.\n\nCon un plan combinado de fisioterapia manual y ejercicio progresivo, en 8 semanas volvió a correr. Esta semana completó su primer 10K.\n\nSi tienes una lesión que te está frenando, estamos en Malasaña, en el centro de Madrid. Cuéntanos qué te pasa.",
      "cta": "Pide cita en nuestra clínica de Malasaña — primer contacto sin coste",
      "keywords_incluidas": ["fisioterapia Malasaña", "lesión de rodilla", "fisioterapeuta deportivo"],
      "entidades_gemini": ["tendinopatía", "fisioterapia manual", "ejercicio progresivo", "Malasaña", "Madrid"],
      "notas_publicacion": "Verificar con el cliente que el caso descrito es real antes de publicar. Foto: imagen genérica de running o de la clínica."
    }
  ],
  "resumen_keywords_usadas": [
    "fisioterapia Malasaña",
    "fisioterapia deportiva",
    "dolor de espalda",
    "Madrid centro",
    "fisioterapeuta Malasaña"
  ],
  "cobertura_de_tipos": {
    "servicio_destacado": 1,
    "consejo": 1,
    "oferta": 1,
    "caso_exito": 1
  }
}
```

---

## 5. Cómo interpretar los resultados

### Por qué importan los posts en 2026

**Para Google (señal de actividad):**
Google considera que un perfil con posts recientes está "activo" y merece más visibilidad. Los perfiles sin actividad en los últimos 30 días pierden relevancia frente a competidores que publican regularmente. No hace falta que los posts sean perfectos — lo que cuenta es la regularidad.

**Para Gemini (señal de contexto):**
Gemini no solo lee la descripción estática del perfil. Analiza los posts recientes para entender qué está ofreciendo el negocio *hoy*. Si un negocio tiene un post sobre "fisioterapia deportiva en Malasaña" publicado esta semana, Gemini tiene evidencia fresca para incluirlo en una recomendación de voz sobre fisioterapeutas deportivos en esa zona.

### Las entidades de Gemini vs. las keywords de Google

El campo `keywords_incluidas` del JSON sirve para el posicionamiento en búsqueda escrita. El campo `entidades_gemini` sirve para que Gemini pueda extraer y procesar el contenido.

La diferencia: una keyword es "fisioterapeuta Malasaña". Una entidad es el concepto completo que Gemini reconoce: [TIPO: profesional sanitario] + [ESPECIALIDAD: fisioterapia] + [UBICACIÓN: Malasaña].

Un post bien escrito logra que ambos coexistan de forma natural.

### Señales de un post bien redactado

- Suena como una persona real hablando, no como un anuncio
- Tiene una sola idea central (no intenta decir todo)
- El CTA es específico: "llama al XXX", "reserva online", "escríbenos por WhatsApp" (no "contáctanos")
- Menciona el barrio o zona al menos una vez de forma natural
- Si es una oferta, tiene condiciones claras y fecha de fin

### Señales de un post que hay que revisar

- Repite la keyword más de 2 veces (keyword stuffing — Google puede penalizarlo)
- No tiene CTA o el CTA es genérico ("más información")
- Suena a texto generado automáticamente sin personalidad
- Contiene precios sin confirmar con el cliente
- Promete algo que el negocio no puede cumplir

---

## 6. Acciones post-ejecución

### Proceso de publicación manual en GBP

Los posts los genera el agente, pero los publica el operador (o el cliente si tiene acceso). **El agente no puede publicar directamente en GBP.**

**Paso a paso para publicar cada post:**

1. Acceder a business.google.com
2. Ir a la sección "Posts" o "Novedades"
3. Hacer clic en "Añadir actualización" (o "Añadir oferta", "Añadir evento" según el tipo)
4. Copiar el texto del post desde el JSON — revisar que no haya caracteres especiales que se hayan corrompido
5. Añadir la foto indicada en `notas_publicacion`
6. Si es tipo "Oferta": rellenar nombre de la oferta, fecha de inicio y fin, código si aplica
7. Si es tipo "Evento": rellenar nombre del evento, fecha y hora
8. Publicar

**Foto obligatoria:** GBP muestra posts con foto con mucha mayor visibilidad que posts sin foto. Siempre añadir foto. Usar imágenes reales del negocio cuando sea posible. Si no hay fotos disponibles, usar imágenes de stock relacionadas con el servicio (no con personas genéricas de stock).

### Calendario de publicación

Anotar en el calendario de operaciones las fechas sugeridas del JSON. Publicar siempre en martes o miércoles (mayor engagement según datos internos) si las fechas sugeridas son flexibles.

### Seguimiento de rendimiento

Después de 7 días de publicado cada post, revisar en GBP:
- Número de visualizaciones del post
- Clics en el CTA (llamadas, clics web, peticiones de ruta)
- Documentar en el CRM qué tipos de post generan más interacción para ajustar el mix futuro

---

## 7. Frecuencia recomendada

| Situación | Frecuencia |
|---|---|
| Ciclo estándar | Mensual (genera 4 posts = 1 por semana) |
| Cliente muy activo o competencia alta | Quincenal (genera 2 posts adicionales al mes) |
| Evento o promoción puntual | Ejecución puntual fuera del ciclo |
| Temporada especial (verano, Navidad, back to school) | Ejecutar 2 semanas antes de la temporada |

---

## 8. Notas y advertencias

**Tipos de post disponibles en GBP:**
- **Novedad/Actualización:** Post general. Caduca visualmente a los 7 días.
- **Oferta:** Requiere fecha de inicio y fin. Google puede mostrarla en la ficha directamente.
- **Evento:** Requiere fecha y hora. Ideal para talleres, jornadas, inauguraciones.

**Reglas de cada post (checklist rápido):**
- Entidades concretas: mencionar servicio específico + ubicación (barrio/ciudad)
- Anclaje geográfico: al menos una mención de barrio o zona
- CTA accionable: teléfono, WhatsApp o enlace de reserva (nunca solo "contáctanos")
- Frecuencia: un post por semana — ni más ni menos (exceso puede parecer spam)
- Lenguaje natural: escribir como habla la persona, no como un folleto publicitario
- 1-2 keywords orgánicas máximo: si hay más, el texto empieza a sonar artificial

**Lo que NO funciona en posts de GBP:**
- Textos de más de 400 palabras (se cortan en la vista previa)
- Emojis en exceso (máximo 1-2 por post, si el tono del negocio los admite)
- Listas de servicios sin contexto ni narrativa
- Precios sin confirmar con el cliente
- Promesas que el negocio no puede cumplir

**Sobre las fotos:**
- Fotos de alta resolución (mínimo 720x720px)
- Fotos del negocio real tienen más impacto que stock
- Evitar imágenes con texto superpuesto (GBP las puede rechazar o penalizar en visibilidad)

**Packs con acceso:** `visibilidad_local` y `autoridad_maps_ia`.
