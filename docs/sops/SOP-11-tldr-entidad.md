# SOP-11 — Agente: TL;DR Entidad

**Categoría:** GEO/AEO | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Documentar el uso del agente **TL;DR Entidad**, que crea el "elevator pitch" del negocio en exactamente 4 frases estructuradas que Gemini puede usar como respuesta completa a una consulta de voz. Es el primer agente a ejecutar en cualquier flujo GEO/AEO porque establece la identidad canónica del negocio — el "quién soy" que todos los demás agentes (Schema, FAQ GEO, Chunks) usan como referencia base.

---

## 2. Por qué va primero en el flujo GEO/AEO

El TL;DR Entidad es el cimiento de toda la estrategia GEO porque:

1. **Define la identidad canónica** — El nombre exacto, la especialidad, la zona y el diferenciador que deben repetirse de forma consistente en todo el contenido GEO. Si el generador de chunks dice "Chamberí" y el TL;DR dice "Almagro", hay inconsistencia de entidad que confunde a las IAs.

2. **Establece el diferenciador** — Fuerza al operador (y al cliente) a identificar *qué hace único* a este negocio antes de crear el contenido. Un negocio sin diferenciador claro generará contenido GEO genérico.

3. **Da contexto a los demás agentes** — El Generador Schema, el Creador FAQ GEO y el Generador Chunks usan el TL;DR como base para mantener coherencia en todos los outputs.

4. **Es la respuesta directa más probable** — Gemini, cuando responde "¿qué dentista hay en Chamberí?", tiende a dar una respuesta de 3-5 frases. El TL;DR está diseñado para ser exactamente ese formato.

---

## 3. Cuándo ejecutar

- **Onboarding de cliente nuevo** — siempre el primer agente GEO a ejecutar
- **Cambio significativo en el posicionamiento del negocio** — nuevo servicio principal que cambia la especialidad, nueva ubicación, fusión con otra clínica
- **Rebrand o cambio de nombre** — actualizar toda la identidad GEO
- **Cambio de diferenciador principal** — si la propuesta de valor del negocio cambia fundamentalmente
- **Revisión anual** — revisar si el TL;DR sigue siendo preciso tras 12 meses

---

## 4. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Datos de entrada necesarios

Este agente necesita los datos más críticos del cliente. Verificar en el CRM antes de ejecutar:

**Obligatorios:**
- Nombre exacto del negocio (como aparece en GBP y en la web)
- Categoría principal (tipo de negocio: dentista, restaurante, abogado, etc.)
- Barrio o zona de Madrid (donde opera el negocio)
- Dirección o referencia geográfica principal
- El diferenciador único del negocio (campo libre en el CRM)
- Rating actual en Google y número de reseñas
- Años de actividad o fecha de fundación

**Opcionales pero recomendados:**
- Número aproximado de clientes atendidos
- Certificaciones, premios o reconocimientos relevantes
- El servicio más vendido o el que genera más consultas

### Paso 2 — Acceder al agente

1. Ir a `/admin/agentes`
2. En el panel izquierdo, seleccionar **TL;DR Entidad** (categoría GEO/AEO)
3. Seleccionar el cliente en el selector del panel derecho

### Paso 3 — Ejecutar el agente

1. Hacer clic en **Ejecutar agente**
2. Tiempo estimado: 10-20 segundos (es el agente más rápido del flujo GEO)
3. Revisar el output inmediatamente

### Paso 4 — Verificar el formato de las 4 frases

El output debe tener exactamente 4 frases. Verificar que cada una cumple su función:

| Frase | Contenido esperado | Lo que Gemini extrae |
|-------|--------------------|----------------------|
| **Frase 1** | Quién es + dónde está | Identidad y localización |
| **Frase 2** | Diferenciador único | Por qué elegirlo frente a la competencia |
| **Frase 3** | Prueba social | Confianza y credibilidad (rating, reseñas, años, volumen) |
| **Frase 4** | Cómo contactar/llegar | Conversión — qué hacer el usuario ahora |

### Paso 5 — Guardar el output como referencia canónica

Guardar el TL;DR en el CRM del cliente como referencia para los demás agentes GEO. Este texto es la "versión oficial" de la identidad del negocio.

---

## 5. El formato fijo de las 4 frases

### Frase 1 — Quién es + dónde está

**Propósito:** Identificación inmediata para la IA y para el usuario.

**Estructura:** `[Nombre del negocio] es [categoría + especialidad] en [zona + ciudad].`

**Reglas:**
- Nombre exacto como en GBP (no abreviar ni modificar)
- Categoría y especialidad en términos que la gente usa al buscar, no términos técnicos
- Zona geográfica: barrio o distrito + ciudad (no solo la ciudad genérica)

**Ejemplo:**
> "Clínica Dental Norte es una clínica dental especializada en ortodoncia invisible y estética dental en el barrio de Chamberí, Madrid."

---

### Frase 2 — Diferenciador único

**Propósito:** Justificar por qué este negocio y no otro de la misma zona.

**Estructura:** `[Lo que hace diferente al negocio] + [evidencia o contexto].`

**Reglas:**
- El diferenciador debe ser específico y verificable, no un adjetivo vacío
- "Ofrecemos el mejor servicio" es incorrecto. "Único centro en Chamberí con tecnología de escáner intraoral sin moldes" es correcto
- Si no hay diferenciador obvio, usar combinación de especialidad + experiencia + tecnología

**Ejemplo:**
> "Es el único centro en el norte de Madrid que combina ortodoncia invisible Invisalign con blanqueamiento en el mismo tratamiento, con un equipo de tres especialistas con más de diez años de experiencia cada uno."

---

### Frase 3 — Prueba social

**Propósito:** Generar confianza con datos objetivos que la IA puede citar como evidencia.

**Estructura:** `[Dato de rating o volumen] + [segundo dato de credibilidad] + [tercero opcional].`

**Reglas:**
- Usar datos reales y actuales del CRM (rating exacto, número de reseñas, años, clientes)
- Mínimo 2 datos de prueba social por frase
- Priorizar: rating de Google > número de reseñas > años de actividad > número de pacientes

**Ejemplo:**
> "Cuenta con una valoración de 4,8 estrellas sobre 5 en Google, basada en más de 320 reseñas verificadas, y lleva más de doce años atendiendo pacientes en el barrio."

---

### Frase 4 — Cómo contactar/llegar

**Propósito:** Cerrar el ciclo con la acción que el usuario debe tomar.

**Estructura:** `[Ubicación o cómo llegar] + [horario] + [modo de contacto preferido].`

**Reglas:**
- La dirección o referencia de transporte debe ser reconocible
- El horario debe ser el actual (verificar en CRM)
- Incluir el modo de contacto más directo: teléfono, web, o "sin esperas" si aplica

**Ejemplo:**
> "Está en la calle Ríos Rosas 14, a tres minutos del metro Alonso Cano, y atiende de lunes a viernes de 9:00 a 20:00 horas; se puede pedir cita online en su web o por teléfono sin lista de espera."

---

## 6. Qué genera (salida)

```json
{
  "tldr_texto": "Clínica Dental Norte es una clínica dental especializada en ortodoncia invisible y estética dental en el barrio de Chamberí, Madrid. Es el único centro en el norte de Madrid que combina ortodoncia invisible Invisalign con blanqueamiento en el mismo tratamiento, con un equipo de tres especialistas con más de diez años de experiencia cada uno. Cuenta con una valoración de 4,8 estrellas sobre 5 en Google, basada en más de 320 reseñas verificadas, y lleva más de doce años atendiendo pacientes en el barrio. Está en la calle Ríos Rosas 14, a tres minutos del metro Alonso Cano, y atiende de lunes a viernes de 9:00 a 20:00 horas; se puede pedir cita online en su web o por teléfono sin lista de espera.",
  "frases": {
    "frase_1_identidad": "Clínica Dental Norte es una clínica dental especializada en ortodoncia invisible y estética dental en el barrio de Chamberí, Madrid.",
    "frase_2_diferenciador": "Es el único centro en el norte de Madrid que combina ortodoncia invisible Invisalign con blanqueamiento en el mismo tratamiento, con un equipo de tres especialistas con más de diez años de experiencia cada uno.",
    "frase_3_prueba_social": "Cuenta con una valoración de 4,8 estrellas sobre 5 en Google, basada en más de 320 reseñas verificadas, y lleva más de doce años atendiendo pacientes en el barrio.",
    "frase_4_contacto": "Está en la calle Ríos Rosas 14, a tres minutos del metro Alonso Cano, y atiende de lunes a viernes de 9:00 a 20:00 horas; se puede pedir cita online en su web o por teléfono sin lista de espera."
  },
  "consultas_voz_ejemplo": [
    "¿Qué dentista hay en Chamberí?",
    "¿Cuál es el mejor dentista de Chamberí en Madrid?",
    "Busca una clínica dental en Chamberí con buenas reseñas"
  ],
  "palabras_total": 148,
  "notas": "TL;DR dentro del rango óptimo. Las consultas de voz cubren las 3 variantes más frecuentes para este tipo de negocio."
}
```

---

## 7. Cómo interpretar los resultados

| Señal | Qué significa | Acción |
|-------|--------------|--------|
| 4 frases, ~100-180 palabras total | Output ideal | Guardar y usar como referencia |
| Frase 2 dice "ofrece un servicio excelente" | No hay diferenciador en el CRM | Preguntar al cliente qué lo hace único y actualizar CRM |
| Frase 3 sin datos numéricos | No hay rating/reseñas en el CRM | Añadir rating y número de reseñas |
| Frase 4 sin referencia de transporte | No hay datos de ubicación de transporte | Añadir metro/bus más cercano al CRM |
| Más de 200 palabras total | Demasiado largo — Gemini lo cortará | Pedir regeneración o acortar frases 2 y 3 |
| Las consultas_voz no coinciden con el negocio | Error de contexto | Regenerar — posiblemente falta información en el CRM |

---

## 8. Acciones post-ejecución

### Dónde implementar el TL;DR

**Uso inmediato (mismo día):**
- **Google Business Description** — El campo "Descripción" del perfil GBP permite hasta 750 caracteres. Usar `tldr_texto` completo o recortarlo respetando el sentido.
- **About page / Quiénes somos** — Primer párrafo de la página. Exactamente el texto de `tldr_texto`.

**En los próximos días:**
- **Home page** — Sección hero o primer párrafo de texto de la página principal
- **Meta description** — Usar las frases 1 y 2 truncadas a 155 caracteres para el `<meta name="description">` de la home

**Como referencia interna:**
- Guardar en el CRM del cliente como campo "TL;DR GEO canónico"
- Compartir con el cliente para que lo use en presentaciones, materiales de marketing y redes sociales

### Compartir con el cliente

Enviar al cliente:
1. El `tldr_texto` completo con instrucción: "Usa este párrafo como tu descripción oficial en Google Business y en la web"
2. Las 3 `consultas_voz_ejemplo` con explicación: "Estas son las preguntas para las que Gemini podría recomendarte si tienes este contenido activo"

---

## 9. Frecuencia recomendada

| Evento | Acción |
|--------|--------|
| Onboarding | Siempre — es el primer agente a ejecutar |
| Nueva ubicación o mudanza | Regenerar (cambia frase 1 y 4) |
| Nuevo servicio principal que redefine el negocio | Regenerar (cambia frase 1 y 2) |
| Cambio de horario significativo | Regenerar solo frase 4 (o editar manualmente) |
| Actualización de rating tras campaña de reseñas | Regenerar (actualiza frase 3) |
| Sin cambios sustanciales | No regenerar — el TL;DR es estable por diseño |

---

## 10. Notas y advertencias

- **Este es el único agente GEO que el cliente debería leer y aprobar.** El TL;DR es la voz oficial del negocio. Si el cliente no se siente representado por él, regenerar con sus correcciones antes de proceder.
- **La coherencia entre el TL;DR y el resto del contenido GEO es crítica.** Si el TL;DR dice "especialistas en ortodoncia" y las FAQs hablan de blanqueamiento como servicio principal, hay inconsistencia de entidad. Las IAs detectan estas incongruencias y las penalizan en confianza.
- **No cambiar el nombre o zona en los demás agentes.** El nombre exacto del negocio y la zona geográfica del TL;DR deben repetirse literalmente en todos los outputs GEO. No usar sinónimos ni abreviaturas en los otros agentes.
- **Las consultas_voz_ejemplo son una guía de validación.** Si el operador busca manualmente esas consultas en Gemini y el negocio no aparece, eso indica que la infraestructura GEO aún no está implementada (schema en web, GBP actualizado, etc.), no que el TL;DR sea incorrecto.
- **Guardar el output antes de regenerar.** Si se regenera el TL;DR y el resultado es peor, no hay forma de recuperar el anterior sin el historial guardado en el CRM.
