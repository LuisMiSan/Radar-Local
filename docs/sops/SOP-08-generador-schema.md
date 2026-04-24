# SOP-08 — Agente: Generador Schema

**Categoría:** GEO/AEO | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Documentar el uso del agente **Generador Schema** de Radar Local, que crea datos estructurados JSON-LD (schema.org) para el negocio del cliente. Estos schemas son el idioma oficial que las IAs generativas (Gemini, ChatGPT, Perplexity, Copilot) usan para entender y clasificar negocios. Sin Schema, el contenido de la web es ruido ambiguo para la IA; con Schema, es una fuente autoritativa que puede citar directamente.

**Estadística clave:** Las páginas con FAQPage schema tienen 3,2 veces más probabilidad de aparecer en resúmenes de IA generativa (fuente: análisis de visibilidad en motores generativos, 2025-2026).

---

## 2. Cuándo ejecutar

- **Onboarding de cliente nuevo** — primera ejecución para establecer el baseline de Schema
- **Cambio de datos del negocio** — si cambian horarios, dirección, teléfono, servicios principales o nombre
- **Después de ejecutar TL;DR Entidad** — el agente Schema usa la identidad canónica del TL;DR como base
- **Antes de implementar FAQs** — el FAQPage schema generado aquí es el contenedor de las FAQs del agente siguiente

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Acceder al panel de agentes

1. Ir a `/admin/agentes` en el dashboard de Radar Local
2. En el panel izquierdo, localizar la categoría **GEO/AEO**
3. Hacer clic en **Generador Schema**

### Paso 2 — Seleccionar el cliente

1. En el panel derecho, usar el selector de cliente para elegir el negocio
2. Verificar que los datos del cliente estén completos antes de ejecutar:
   - Nombre exacto del negocio (igual que en GBP)
   - Dirección completa (calle, número, código postal, ciudad)
   - Categoría principal GBP (ej: Dentist, Restaurant, LegalService...)
   - Teléfono
   - URL del sitio web
   - Horarios de apertura
   - Rating actual y número de reseñas
   - Coordenadas GPS (latitud y longitud) si están disponibles
   - Servicios principales (mínimo 3, máximo 8)

### Paso 3 — Ejecutar el agente

1. Hacer clic en **Ejecutar agente**
2. Esperar a que el agente procese los datos (tiempo estimado: 15-30 segundos)
3. El output aparece en el panel derecho en formato JSON

### Paso 4 — Revisar el output antes de entregar

Verificar que el JSON generado incluya los schemas esperados:
- `LocalBusiness` (o el subtipo correcto: Dentist, Restaurant, etc.)
- `FAQPage` (si el cliente tiene FAQs)
- `AggregateRating` (solo si hay datos de rating disponibles)
- `OpeningHoursSpecification`
- `GeoCoordinates`
- `Speakable` (para contenido marcado como legible por voz)

### Paso 5 — Copiar y entregar al cliente o desarrollador

1. Copiar el bloque JSON-LD completo
2. Entregar con instrucciones de implementación (ver sección 6)

---

## 4. Qué genera (salida)

El agente devuelve un JSON con un array de schemas listos para implementar. Estructura del output:

```json
{
  "schemas": [
    {
      "tipo": "LocalBusiness",
      "subtipo": "Dentist",
      "script": "<script type=\"application/ld+json\">\n{ ... JSON-LD completo ... }\n</script>",
      "descripcion": "Schema principal del negocio con todos los datos de entidad"
    },
    {
      "tipo": "FAQPage",
      "script": "<script type=\"application/ld+json\">\n{ ... JSON-LD completo ... }\n</script>",
      "descripcion": "Contenedor para las FAQs GEO — pendiente de poblar con el agente FAQ GEO"
    },
    {
      "tipo": "AggregateRating",
      "script": "<script type=\"application/ld+json\">\n{ ... JSON-LD completo ... }\n</script>",
      "descripcion": "Rating agregado basado en los datos de reseñas del cliente"
    },
    {
      "tipo": "OpeningHoursSpecification",
      "incluido_en": "LocalBusiness",
      "descripcion": "Horarios estructurados embebidos en el schema LocalBusiness"
    },
    {
      "tipo": "GeoCoordinates",
      "incluido_en": "LocalBusiness",
      "descripcion": "Coordenadas GPS embebidas en el schema LocalBusiness"
    },
    {
      "tipo": "Speakable",
      "script": "<script type=\"application/ld+json\">\n{ ... JSON-LD completo ... }\n</script>",
      "descripcion": "Marca los párrafos de la web que las IAs de voz pueden leer directamente"
    }
  ],
  "implementacion": {
    "instrucciones": "Pegar cada bloque <script> en el <head> del HTML de la página correspondiente",
    "paginas_recomendadas": ["Página principal", "Página de contacto", "Página sobre nosotros"],
    "verificacion": "Usar Google Rich Results Test: https://search.google.com/test/rich-results"
  }
}
```

### Schemas que genera en detalle

**LocalBusiness + subtipo específico**
El agente identifica el subtipo correcto de schema.org según la categoría GBP del negocio. Esto es importante porque Google y las IAs tratan `Dentist` de forma diferente a `HealthAndBeautyBusiness`. Los subtipos más comunes en Radar Local incluyen: `Dentist`, `Restaurant`, `LegalService`, `Accountant`, `AutoRepair`, `HairSalon`, `RealEstateAgent`, `MedicalClinic`, `Gym`, `Hotel`.

**FAQPage**
Contenedor vacío (o con las FAQs si ya se han generado con el agente FAQ GEO). Marca la página como una fuente de preguntas y respuestas que las IAs pueden extraer.

**AggregateRating**
Usa el rating y número de reseñas del cliente para generar las estrellas en Rich Results. Solo se genera si el cliente tiene datos de rating actualizados.

**Speakable**
Marca los fragmentos de texto de la web que son aptos para ser leídos en voz alta. Requiere que el desarrollador añada selectores CSS o XPath específicos.

---

## 5. Cómo interpretar los resultados

| Schemas presentes | Interpretación | Acción |
|------------------|---------------|--------|
| LocalBusiness + Rating + FAQ | Implementación completa — máxima señal para IAs | Implementar todos en web |
| Solo LocalBusiness | Implementación básica — suficiente para visibilidad inicial | Ejecutar FAQ GEO después |
| Sin subtipo específico (solo "LocalBusiness") | El agente no encontró coincidencia exacta en schema.org | Revisar la categoría GBP del cliente |
| Sin AggregateRating | El cliente no tiene rating registrado en el CRM | Añadir rating y número de reseñas al CRM y regenerar |
| Sin GeoCoordinates | No hay coordenadas en el perfil del cliente | Añadir lat/lng al CRM (buscar en Google Maps) |

**Señal de alerta:** Si el output solo tiene 1 schema (LocalBusiness básico), verificar que los datos del cliente estén completos en el CRM antes de entregar.

---

## 6. Acciones post-ejecución

### Implementación del JSON-LD en la web

**Dónde pegar el Schema:**
- Cada bloque `<script type="application/ld+json">` va dentro del `<head>` del HTML
- En Next.js/React: usar el componente `<Script>` o la función `metadata` de Next.js 14
- En WordPress: plugin "Schema Pro" o "Rank Math" permiten añadir JSON-LD personalizado
- En HTML estático: pegar directamente antes del cierre de `</head>`

**Ejemplo en Next.js 14 (App Router):**
```jsx
// app/layout.tsx o app/page.tsx
export default function Layout({ children }) {
  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObject) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Verificación obligatoria

1. Ir a **Google Rich Results Test**: https://search.google.com/test/rich-results
2. Pegar la URL de la web del cliente (o el código HTML si aún no está publicado)
3. Verificar que aparezcan sin errores: LocalBusiness, FAQPage, AggregateRating
4. Guardar captura de pantalla del resultado para el informe del cliente

### Envío al cliente

Entregar:
- Los bloques JSON-LD listos para copiar-pegar
- Instrucciones de implementación adaptadas a su CMS
- Resultado de la verificación en Rich Results Test

---

## 7. Frecuencia recomendada

| Evento | Acción |
|--------|--------|
| Onboarding (primera vez) | Ejecutar y implementar completo |
| Cambio de horarios | Regenerar y actualizar en web |
| Cambio de dirección | Regenerar y actualizar en web |
| Cambio de teléfono o URL | Regenerar y actualizar en web |
| Nuevo servicio principal | Regenerar (puede cambiar el subtipo) |
| Cambio significativo en rating | Regenerar AggregateRating |
| Sin cambios | No regenerar — el Schema es estable |

**Regla general:** El Schema no es contenido de marketing que hay que refrescar. Solo se regenera cuando cambian los datos del negocio. Una vez implementado correctamente, funciona de forma pasiva.

---

## 8. Notas y advertencias

- **El subtipo de LocalBusiness importa más de lo que parece.** Google y Gemini asignan contexto diferente a `Dentist` vs `MedicalClinic`. Si el cliente tiene categoría principal "Clínica Dental" en GBP, el subtipo correcto es `Dentist`, no `MedicalClinic`. El agente lo detecta automáticamente, pero revisar si el output parece incorrecto.
- **El FAQPage schema vacío es válido pero inútil.** Se genera como contenedor, pero no tendrá efecto hasta que se pueble con las FAQs del agente Creador FAQ GEO (SOP-09). Ejecutar ambos agentes antes de implementar.
- **AggregateRating puede causar penalización si es falso.** Google penaliza schemas con ratings inflados o que no reflejan reseñas reales. El agente usa los datos del CRM — asegurarse de que el rating y número de reseñas sean los actuales de GBP.
- **Speakable requiere colaboración con el desarrollador.** El schema Speakable necesita que el desarrollador marque los elementos HTML concretos. El agente genera el schema base, pero el desarrollador debe añadir los selectores CSS/XPath correctos.
- **Un Schema por página, no uno global para todo el sitio.** El LocalBusiness puede ir en todas las páginas, pero el FAQPage solo va en la página de preguntas frecuentes. No mezclar todos los schemas en una sola página a menos que sean relevantes para esa página.
