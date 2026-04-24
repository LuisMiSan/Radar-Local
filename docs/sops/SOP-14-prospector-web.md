# SOP-14 — Agente Prospector Web

**Categoría:** Captación | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

El **Prospector Web** es el agente de captación de Radar Local. Su misión es **auditar la web de negocios locales que aún no son clientes**, identificar los que tienen una presencia digital deficiente, y generar automáticamente una propuesta personalizada que incluye:

- Un score de calidad web (0-100)
- Un análisis detallado de problemas
- Un email de captación personalizado con datos concretos del análisis
- Una demo HTML completa de cómo debería verse su web mejorada (si el score es bajo)

Este agente es una **herramienta de ventas**, no de gestión de clientes activos. Se usa para prospectar, no para mantener.

---

## 2. Cuándo ejecutar

### Casos de uso válidos

- Prospección de negocios locales en Madrid para ampliar la cartera de clientes
- Seguimiento de un lead que mostró interés pero no contrató
- Campaña de captación en un barrio o sector específico
- Evaluación rápida de si un negocio es buen candidato para Radar Local

### NO usar para

- Clientes actuales de Radar Local (para ellos, usar los agentes de análisis habituales)
- Negocios sin web (el agente necesita una URL para analizar)
- Evaluaciones internas de calidad web sin intención de contacto

---

## 3. Qué audita

El Prospector Web analiza la URL del prospecto en estas dimensiones:

| Dimensión | Qué evalúa | Peso en el score |
|-----------|-----------|-----------------|
| **Rendimiento** | Velocidad de carga, Core Web Vitals, tiempo hasta primer byte | 20% |
| **SEO técnico** | Title, meta description, headings, estructura de URLs, canonical | 20% |
| **Mobile-first** | Responsive design, legibilidad en móvil, botones táctiles | 15% |
| **SSL y seguridad** | HTTPS activo, certificado válido, headers de seguridad | 10% |
| **Estructura** | Menú claro, páginas esenciales, arquitectura de información | 15% |
| **UX** | CTA visible, formulario de contacto, mapa/dirección, teléfono clickable | 10% |
| **Contenido** | Calidad del texto, keywords locales presentes, originalidad aparente | 10% |

### Sistema de scoring

| Score | Interpretación | Acción del agente |
|-------|---------------|------------------|
| **80-100** | Web en buen estado | No genera demo. Genera análisis y email ligero de mejora GEO/AEO |
| **50-79** | Web mejorable | Genera análisis y email con oportunidades de mejora |
| **0-49** | Web deficiente — intervención urgente | Genera demo HTML completa + email de captación + análisis completo |

**El umbral clave es 50.** Por debajo de 50, el agente entiende que la web necesita una intervención significativa y genera la propuesta completa con demo incluida.

---

## 4. Qué genera (salida)

### Para todos los prospectos (score 0-100)

- **Score web** (0-100) con desglose por dimensión
- **Lista de problemas** ordenados por impacto
- **Email de captación personalizado** con datos concretos del análisis

### Solo para prospectos con score < 50

- **Demo HTML completa**: una página web de muestra que demuestra cómo podría mejorar su presencia digital. Incluye diseño responsive, estructura correcta, contenido de ejemplo, Schema.org básico, y CTA claros. Lista para mostrar al cliente en una URL temporal o como archivo adjunto.

---

## 5. El email de captación — Reglas críticas

El email generado debe cumplir estas reglas sin excepción:

### Tono y forma
- **Siempre de usted** — nunca tutear al prospecto
- **Tono cordial y profesional** — nunca agresivo ni presionante
- **Sin urgencia falsa** — no usar "oferta limitada", "solo hoy", "últimas plazas"
- **Sin presión de venta** — el objetivo es abrir conversación, no cerrar venta por email
- **Firma siempre como** "El equipo de Radar Local"

### Contenido obligatorio
- **Datos concretos del análisis**: mencionar al menos 2-3 problemas específicos encontrados en su web (no genéricos)
- **Nombre del negocio** en el saludo y en el cuerpo del email
- **Link a la demo** (si se generó): enlace directo para que pueda verla sin fricción
- **Un único CTA claro**: llamada, respuesta al email o visita a la demo — solo uno

### Estructura del email

```
Asunto: [Nombre negocio] — análisis de su presencia digital

Saludo personalizado

Párrafo 1: contexto (de dónde sale el análisis, quiénes somos)
Párrafo 2: 2-3 hallazgos concretos de su web actual
Párrafo 3: lo que podría mejorar (si tiene demo, enlazarla aquí)
CTA único y claro

Firma: El equipo de Radar Local
```

### Qué NO debe aparecer nunca en el email
- Promesas de "llegar al número 1"
- Datos inventados o no verificados
- Precios (la conversación de precio es posterior)
- Comparaciones con competidores por nombre

---

## 6. Proceso completo paso a paso

### Paso 1: Crear el prospecto en CRM

1. Ir a `/admin/clientes`.
2. Crear nuevo cliente con estado **"Prospecto"** (no "Activo").
3. Rellenar: nombre del negocio, categoría, ciudad, teléfono (si se conoce), email de contacto, **URL de la web** (obligatoria).

### Paso 2: Ejecutar el agente

1. Ir a `/admin/agentes`.
2. Seleccionar el prospecto en el panel izquierdo.
3. Seleccionar el agente **"Prospector Web"**.
4. Pulsar **"Ejecutar agente"**.
5. Esperar el resultado (1-3 minutos).

### Paso 3: Revisar el análisis

1. Leer el score y el desglose por dimensiones.
2. Revisar los problemas identificados — ¿son precisos? ¿hay alguno que no aplica?
3. Leer el email generado. **Siempre revisar antes de enviar.** Ajustar si hay algo que no suena natural o si hay un error de contexto.

### Paso 4: Revisar la demo (si se generó)

1. Abrir el HTML generado en un navegador para verificar que se ve correctamente.
2. Alojar la demo en una URL accesible (opción: subir a una ruta temporal del proyecto, o usar un servicio como Vercel Preview).
3. Asegurarse de que el link de la demo en el email es correcto y accesible.

### Paso 5: Enviar el email

1. Copiar el email generado a tu cliente de correo (o enviarlo directamente desde `/admin/prospectos` si la integración Resend está activa).
2. Registrar el envío en el CRM del prospecto (fecha de contacto).

### Paso 6: Seguimiento

1. Si no hay respuesta en 5-7 días, enviar un follow-up corto referenciando el email anterior.
2. Si hay respuesta positiva, mover el prospecto a **"Lead activo"** en el CRM.
3. Si hay respuesta negativa o no hay interés, marcar como **"Descartado"** y registrar el motivo.

---

## 7. Frecuencia / Programación

El Prospector Web no tiene cron. Se ejecuta bajo demanda, según el ritmo de prospección.

**Cadencia recomendada para campañas de captación:**
- Seleccionar un sector o barrio específico
- Auditar 10-20 prospectos en una sesión de trabajo
- Enviar los emails en lotes de máximo 10 por día para evitar ser marcado como spam
- Hacer seguimiento al lote anterior antes de abrir uno nuevo

---

## 8. Notas y advertencias

- El agente analiza la web tal como está en el momento de la ejecución. Si la web del prospecto está temporalmente caída o cargando lento por mantenimiento, el score puede ser artificialmente bajo.
- La demo HTML generada es una **propuesta conceptual**, no un producto final. Debe presentarse como "así podría verse su web mejorada", nunca como el producto que se entrega.
- El email es un punto de partida. Siempre personalizarlo con detalles adicionales que conozcas del negocio antes de enviar.
- Este agente **no require pack activo** en el prospecto. Funciona con cualquier perfil marcado como prospecto en el CRM.
- No ejecutar el Prospector Web en clientes activos. Los clientes activos deben usar el flujo de análisis habitual.
- La URL de la web es **obligatoria**. Sin URL, el agente no puede ejecutarse.
