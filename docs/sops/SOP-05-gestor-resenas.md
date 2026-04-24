# SOP-05 — Gestor Reseñas

**Categoría:** Map Pack | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Gestionar las reseñas del cliente para maximizar su impacto en el ranking de Map Pack y en las recomendaciones de Gemini. Las reseñas son **combustible para el algoritmo de Gemini**: el modelo realiza análisis de sentimiento, extrae temas recurrentes y evalúa la velocidad de reseñas recientes (review velocity) para decidir a qué negocios recomienda cuando un usuario pregunta por voz o en AI Overviews.

El agente tiene dos funciones principales:
1. **Generar respuestas a reseñas** en el tono exacto del dueño del negocio
2. **Diseñar una estrategia de captación** de nuevas reseñas con la estructura óptima para Gemini

---

## 2. Cuándo ejecutar

- **Mensual (ciclo estándar):** Para revisar reseñas nuevas del mes, responder las sin respuesta y actualizar la estrategia de captación.
- **Tras recibir una reseña negativa:** Respuesta prioritaria. Una reseña negativa sin respuesta o con una respuesta mal redactada daña la percepción y puede impactar el ranking.
- **Tras recibir un volumen inusual de reseñas positivas:** Puede indicar una campaña exitosa de captación o un momento viral. Conviene responder todas para consolidar la señal.
- **Al inicio del onboarding:** Para hacer el análisis de tono inicial y establecer el perfil de voz del dueño.

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Recopilar reseñas existentes y respuestas del dueño

Este paso es crítico. El agente necesita analizar el **tono real del dueño** antes de generar ninguna respuesta. Sin este análisis, las respuestas sonarán genéricas y artificiales.

**Qué recopilar de GBP:**

A) **Todas las reseñas de los últimos 12 meses** (o desde el último ciclo si ya se hizo el onboarding):
- Texto completo de cada reseña
- Puntuación (1-5 estrellas)
- Fecha
- Si tiene respuesta del dueño (y el texto de esa respuesta)

B) **Historial de respuestas del dueño** (si existen):
- Mínimo 5 respuestas anteriores del propietario
- Si no hay respuestas anteriores, pedir al cliente que escriba 2-3 respuestas de muestra o una descripción de cómo quiere sonar

**Cómo copiar las reseñas:**
- Acceder a business.google.com
- Ir a "Reseñas"
- Copiar texto de cada reseña y respuesta en el campo de input del agente

### Paso 2 — Definir reseñas que necesitan respuesta urgente

Antes de ejecutar el agente, identificar y marcar:
- Reseñas negativas (1-2 estrellas) sin respuesta
- Reseñas neutras (3 estrellas) sin respuesta
- Reseñas positivas recientes (últimos 30 días) sin respuesta
- Reseñas que mencionan problemas o situaciones que el dueño debería conocer

### Paso 3 — Ejecutar el agente

- Acceder a `/admin/agentes`
- Seleccionar el cliente en el panel izquierdo
- Seleccionar agente `gestor_resenas` en el panel derecho
- Introducir:
  - Todas las reseñas recopiladas (con puntuación, fecha y texto)
  - Respuestas anteriores del dueño (para análisis de tono)
  - Servicios principales del negocio (para contextualizar respuestas)
  - Keywords locales del cliente (si ya se ejecutó Keywords Locales)
- Ejecutar y esperar resultado (3-5 minutos)

### Paso 4 — Revisar las respuestas generadas

Antes de publicar, revisar:
- ¿El tono suena como el dueño o suena corporativo/genérico?
- ¿Las respuestas a negativos son defensivas o empáticas?
- ¿Las keywords aparecen de forma natural o forzada?
- ¿Hay alguna respuesta que requiera información que el agente no tenía? (Ej: una queja sobre un empleado concreto)
- Ajustar manualmente si es necesario antes de publicar

---

## 4. Qué genera (salida)

```json
{
  "perfil_de_voz": {
    "tono_general": "cercano y profesional, usa el tuteo, a veces añade emojis simples",
    "caracteristicas": [
      "Saluda siempre por el nombre del cliente si aparece",
      "Agradece la visita antes de responder el contenido",
      "Cuando hay queja, reconoce el problema sin excusas y ofrece solución concreta",
      "Cierra siempre con invitación a volver"
    ],
    "frases_tipicas": [
      "Muchas gracias por confiar en nosotros",
      "Nos alegramos de que hayas quedado contento",
      "Estamos aquí para lo que necesites"
    ],
    "evitar": ["exceso de formalidad", "respuestas de más de 4 líneas", "disculpas sin solución concreta"]
  },
  "respuestas_generadas": [
    {
      "id_resena": "resena_001",
      "puntuacion": 5,
      "texto_resena": "Excelente fisioterapeuta, me quitó el dolor de espalda en 3 sesiones. Muy recomendable en Malasaña.",
      "respuesta_generada": "¡Muchísimas gracias! Nos alegra mucho que te hayas recuperado tan rápido. La espalda es delicada y es importante tratarla bien desde el principio. Cuando lo necesites, aquí seguimos en Malasaña. ¡Cuídate!",
      "keywords_incluidas": ["fisioterapeuta", "Malasaña"],
      "tipo": "positiva",
      "urgencia": "baja"
    },
    {
      "id_resena": "resena_002",
      "puntuacion": 2,
      "texto_resena": "Esperé 25 minutos aunque tenía cita. Nadie me avisó del retraso.",
      "respuesta_generada": "Lamentamos mucho lo que ocurrió. Los retrasos son la excepción, no la norma, y entendemos que tu tiempo es valioso. Hemos revisado el protocolo de avisos para que esto no vuelva a pasar. Si quieres darnos la oportunidad de compensarlo, escríbenos directamente.",
      "keywords_incluidas": [],
      "tipo": "negativa",
      "urgencia": "alta",
      "nota_operador": "Verificar con el cliente si hubo un problema real ese día antes de publicar"
    }
  ],
  "estrategia_captacion": {
    "estructura_resena_ideal": {
      "formato": "Barrio + Problema que tenía + Solución que encontró",
      "ejemplo": "Vine desde Lavapiés con una contractura cervical que llevaba semanas molestando. En dos sesiones ya notaba la diferencia. Muy recomendable.",
      "razon": "Gemini extrae tres entidades de esta estructura: ubicación (señal geográfica), problema (relevancia de servicio) y resultado (señal de calidad)"
    },
    "canales_captacion": [
      {
        "canal": "WhatsApp post-visita",
        "timing": "24h después de la sesión",
        "mensaje_sugerido": "Hola [nombre], ¿cómo te has encontrado después de la sesión de ayer? Si tienes un momento, nos ayudaría muchísimo que dejaras tu opinión en Google: [enlace corto]. ¡Gracias!"
      },
      {
        "canal": "Tarjeta física en recepción",
        "timing": "Al finalizar la visita",
        "mensaje_sugerido": "¿Te ha ido bien? Cuéntalo en Google y ayuda a otros a encontrarnos"
      }
    ],
    "frecuencia_objetivo": "4-6 reseñas nuevas al mes",
    "advertencia": "No ofrecer descuentos ni incentivos a cambio de reseñas — viola las políticas de Google y puede resultar en suspensión del perfil"
  },
  "resumen_estado": {
    "total_resenas": 47,
    "puntuacion_media": 4.6,
    "resenas_sin_respuesta": 12,
    "resenas_negativas_sin_respuesta": 2,
    "review_velocity_30d": 4,
    "recomendacion": "La puntuación es buena pero hay 2 negativas sin respuesta que dañan la percepción. Responder hoy. La velocidad de reseñas está en el límite — activar estrategia de captación WhatsApp."
  }
}
```

---

## 5. Cómo interpretar los resultados

### Cómo Gemini procesa las reseñas

Gemini no lee las reseñas como un humano. Realiza:

1. **Extracción de temas:** Detecta qué servicios se mencionan, qué problemas resuelve el negocio, qué características destacan los clientes.
2. **Análisis de sentimiento:** Clasifica cada reseña como positiva, negativa o neutra y pondera el sentimiento global.
3. **Valoración de recencia (review velocity):** Las reseñas recientes tienen más peso. Un negocio con 200 reseñas antiguas puede puntuar menos que uno con 40 reseñas del último año.
4. **Detección de autenticidad:** Patrones sospechosos (muchas reseñas el mismo día, textos muy similares, cuentas nuevas) activan señales de fraude que reducen el peso de esas reseñas.

### Métricas clave a monitorizar

| Métrica | Objetivo | Alerta |
|---|---|---|
| Puntuación media | > 4.3 estrellas | < 4.0 |
| % reseñas con respuesta | > 80% | < 50% |
| Review velocity (30d) | > 4 reseñas/mes | < 2 reseñas/mes |
| Reseñas negativas sin respuesta | 0 | Cualquiera |
| Tiempo de respuesta a negativos | < 48h | > 7 días |

### La estructura ideal de reseña: Barrio + Problema + Solución

Esta estructura genera las tres entidades que Gemini necesita:
- **Barrio/zona:** Señal geográfica que confirma la relevancia local del negocio
- **Problema que tenía:** Señal de relevancia del servicio para esa necesidad
- **Solución encontrada:** Señal de calidad y resultado

Cuando el cliente solicita reseñas, sugerir amablemente esta estructura. No dar el texto — dejar que el cliente lo escriba con sus propias palabras.

---

## 6. Acciones post-ejecución

### Publicar respuestas en GBP

1. Acceder a business.google.com > Reseñas
2. Para cada reseña sin respuesta, copiar la respuesta generada del JSON
3. Revisar y ajustar si es necesario antes de publicar
4. Publicar comenzando siempre por las reseñas negativas (prioridad alta)
5. Anotar en CRM: número de respuestas publicadas y fecha

### Activar estrategia de captación

1. Implementar el canal de captación recomendado (WhatsApp, tarjeta física u otros)
2. Crear el enlace corto de GBP para reseñas (business.google.com > Obtener más reseñas > Copiar enlace)
3. Configurar el mensaje de WhatsApp post-visita si aplica
4. Revisar resultados en el próximo ciclo mensual

### Alertas que requieren acción inmediata

- **Reseña negativa de 1 estrella:** Responder en menos de 24 horas. Si hay datos incorrectos en la reseña, responder con hechos pero sin confrontación.
- **Sospecha de reseña falsa de la competencia:** No responder agresivamente. Marcar como inadecuada en GBP y documentar para posible reporte.
- **Caída brusca de puntuación:** Investigar qué ocurrió antes de responder. Puede haber un incidente real que el cliente deba conocer.

---

## 7. Frecuencia recomendada

| Situación | Frecuencia |
|---|---|
| Ciclo estándar | Mensual |
| Reseña negativa recibida | Inmediato (< 24h) |
| Cliente con review velocity < 2/mes | Intensificar captación hasta alcanzar objetivo |
| Puntuación media < 4.0 | Análisis urgente + plan de recuperación |

---

## 8. Notas y advertencias

**REGLA CRÍTICA — Análisis de tono previo:**
Nunca generar respuestas sin antes analizar el historial de respuestas del dueño. Una respuesta en un tono que no es el del dueño es fácilmente detectable por clientes habituales y genera desconfianza. Si el dueño no tiene respuestas anteriores, pedirle que escriba 2-3 de ejemplo antes de ejecutar el agente por primera vez.

**Prohibido:**
- Ofrecer descuentos, regalos o cualquier incentivo a cambio de reseñas (viola políticas de Google)
- Pedir reseñas en masa el mismo día (trigger de detección de fraude de Google)
- Responder con datos personales del cliente en la respuesta pública
- Usar las respuestas para hacer publicidad de precios o promociones

**Sobre las reseñas negativas:**
- El objetivo NO es eliminarlas (imposible salvo que violen políticas de Google)
- El objetivo es responder de forma que otros clientes potenciales vean que el negocio gestiona bien los problemas
- Una respuesta empática y con solución a una reseña negativa puede convertirse en un activo de confianza

**Packs con acceso:** `visibilidad_local` y `autoridad_maps_ia`.
