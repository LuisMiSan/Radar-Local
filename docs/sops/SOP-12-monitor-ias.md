# SOP-12 — Agente: Monitor IAs

**Categoría:** GEO/AEO | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Documentar el uso del agente **Monitor IAs**, que evalúa la preparación del negocio del cliente para ser recomendado por voz en las 4 plataformas de IA principales: Gemini, ChatGPT/Copilot, Perplexity y Siri. Genera un score de voz de 0 a 100 y un plan de acción priorizado. Es el "termómetro" de visibilidad en IAs — se usa al inicio para establecer el baseline y mensualmente para medir el progreso de toda la estrategia GEO/AEO.

**IMPORTANTE:** El agente evalúa basándose en el perfil del cliente en el CRM, **no hace búsquedas reales** en las IAs. El score refleja qué tan bien preparada está la infraestructura del negocio para ser encontrado, no si ya aparece en las IAs en este momento.

---

## 2. Cuándo ejecutar

- **Inicio de onboarding** — antes de cualquier otro agente, para establecer el score baseline
- **Inicio del ciclo GEO/AEO** — después de ejecutar todos los demás agentes, para medir el impacto inmediato
- **Seguimiento mensual** — es el único agente GEO que se ejecuta todos los meses
- **Tras implementar mejoras significativas** — nueva web, GBP verificado, schema implementado, llms.txt creado

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Preparar los datos del cliente

El Monitor IAs evalúa la infraestructura completa. Antes de ejecutar, verificar que el CRM tiene datos en estas áreas:

**Infraestructura GBP:**
- GBP reclamado y verificado (sí/no)
- Nombre del negocio en GBP (exacto)
- Categoría principal en GBP
- Horarios completos y actualizados
- Descripción del negocio actualizada
- Fotos subidas (número aproximado)
- Rating y número de reseñas
- Servicios y productos listados en GBP
- Q&A con preguntas y respuestas añadidas (sí/no)

**Infraestructura Bing / Microsoft:**
- Bing Places reclamado (sí/no)
- Bing Webmaster Tools configurado (sí/no)

**Infraestructura web:**
- URL del sitio web
- Schema JSON-LD implementado (sí/no — de qué tipos)
- llms.txt en el dominio raíz (sí/no)
- HTTPS activo (sí/no)
- Velocidad de carga estimada

**Infraestructura Apple:**
- Apple Business Connect reclamado (sí/no)
- Perfil de Apple Maps actualizado (sí/no)

### Paso 2 — Acceder al agente

1. Ir a `/admin/agentes`
2. En el panel izquierdo, seleccionar **Monitor IAs** (categoría GEO/AEO)
3. Seleccionar el cliente en el selector del panel derecho

### Paso 3 — Ejecutar el agente

1. Hacer clic en **Ejecutar agente**
2. Tiempo estimado: 20-40 segundos (es el agente más complejo del flujo GEO)
3. Revisar el output completo antes de entregar al cliente

### Paso 4 — Interpretar el score antes de actuar

Leer el score global + el desglose por plataforma + la `brecha_principal` antes de decidir qué hacer. Ver sección 5 para interpretación detallada.

---

## 4. Cómo obtiene datos cada plataforma de IA

Esta información es crítica para entender por qué cada elemento de la infraestructura importa.

### Gemini

**Fuentes principales:** Google Business Profile (GBP) + Google Maps + Schema JSON-LD en la web del negocio

**Mecanismo:** Gemini tiene acceso privilegiado a la base de datos de GBP. Cuando alguien busca "dentista en Chamberí" en Google, Gemini primero consulta GBP para obtener los datos del negocio y luego los combina con el contenido de la web (incluyendo Schema) para generar la respuesta. Un GBP incompleto = una respuesta pobre o ninguna recomendación.

**Señales que más pondera:** GBP verificado, categoría correcta, rating alto, reseñas recientes, servicios listados, fotos actualizadas.

---

### ChatGPT y Microsoft Copilot

**Fuentes principales:** Índice de Bing + Bing Places + Bing Webmaster Tools

**Mecanismo:** ChatGPT y Copilot no tienen acceso directo a GBP. Usan el índice de búsqueda de Bing como base de datos de negocios locales. Si el negocio no está en Bing Places o si Bing Webmaster Tools no está configurado, Bing tiene datos desactualizados o incompletos sobre ese negocio, y ChatGPT/Copilot lo refleja en sus respuestas.

**Señales que más pondera:** Bing Places completo y verificado, web rastreable por Bingbot, Schema JSON-LD en la web, menciones en webs de directorios (Páginas Amarillas, Yelp, etc.).

---

### Perplexity

**Fuentes principales:** Rastreo web propio + índice Bing + Schema JSON-LD + directorios online

**Mecanismo:** Perplexity es el más "parecido a un buscador tradicional" de los 4. Rastrea webs directamente y prioriza fuentes con contenido estructurado y verificable. El Schema JSON-LD tiene un peso enorme en Perplexity porque permite que la IA extraiga datos del negocio de forma estructurada sin depender de lenguaje natural.

**Señales que más pondera:** Schema JSON-LD en la web (especialmente LocalBusiness y FAQPage), contenido de calidad con chunks bien estructurados, menciones en fuentes de alta autoridad, HTTPS, velocidad de carga.

---

### Siri

**Fuentes principales:** Apple Maps (Apple Business Connect) + Gemini (backend para búsquedas sin perfil Apple Maps)

**Mecanismo:** Siri prioriza Apple Maps para búsquedas locales en dispositivos Apple. Si el negocio no tiene perfil en Apple Business Connect, Siri cae al backend de Gemini/Google. Un negocio sin perfil Apple Maps puede seguir apareciendo en Siri vía Gemini, pero con menos precisión y prioridad.

**Señales que más pondera:** Apple Business Connect verificado, fotos actualizadas en Apple Maps, horarios correctos, categoría principal correcta.

---

## 5. Qué genera (salida)

```json
{
  "score_voz": 62,
  "nivel": "competitivo",
  "descripcion_nivel": "El negocio es visible en algunas búsquedas de voz locales pero tiene brechas significativas en Bing/Copilot y Perplexity que limitan su alcance.",
  "evaluacion_plataformas": {
    "gemini": {
      "score": 78,
      "estado": "Bueno",
      "puntos_fuertes": ["GBP verificado", "Rating 4.8 con 320 reseñas", "Horarios completos"],
      "puntos_debiles": ["Sin Q&A en GBP", "Descripción GBP desactualizada", "Pocas fotos recientes"]
    },
    "chatgpt_copilot": {
      "score": 45,
      "estado": "Deficiente",
      "puntos_fuertes": ["Bing Places reclamado"],
      "puntos_debiles": ["Bing Webmaster Tools no configurado", "Sin sitemap enviado a Bing", "Schema no detectado por Bingbot"]
    },
    "perplexity": {
      "score": 58,
      "estado": "Parcial",
      "puntos_fuertes": ["Schema LocalBusiness implementado", "HTTPS activo"],
      "puntos_debiles": ["Sin FAQPage schema", "Sin llms.txt", "Velocidad de carga mejorable"]
    },
    "siri": {
      "score": 65,
      "estado": "Aceptable",
      "puntos_fuertes": ["Apple Business Connect reclamado"],
      "puntos_debiles": ["Categoría en Apple Maps incorrecta", "Sin fotos en perfil Apple"]
    }
  },
  "brecha_principal": "Bing/ChatGPT — el negocio es prácticamente invisible para los 300M+ usuarios de Copilot por falta de configuración en Bing Webmaster Tools y ausencia de Schema en el índice de Bing.",
  "quick_win": "Configurar Bing Webmaster Tools y enviar el sitemap: mejora estimada de +15 puntos en score ChatGPT/Copilot en 30 días.",
  "plan_accion": [
    {
      "prioridad": 1,
      "accion": "Configurar Bing Webmaster Tools y enviar sitemap",
      "plataforma": "ChatGPT/Copilot",
      "impacto": "Alto",
      "tiempo_estimado": "2 horas",
      "instrucciones": "Ir a bing.com/webmasters, verificar el dominio, enviar sitemap.xml"
    },
    {
      "prioridad": 2,
      "accion": "Crear llms.txt en el dominio raíz",
      "plataforma": "Perplexity + todos",
      "impacto": "Medio-alto",
      "tiempo_estimado": "1 hora",
      "instrucciones": "Crear archivo /llms.txt con resumen del negocio y estructura del sitio"
    },
    {
      "prioridad": 3,
      "accion": "Implementar FAQPage schema en la web",
      "plataforma": "Perplexity + Gemini",
      "impacto": "Alto",
      "tiempo_estimado": "3 horas",
      "instrucciones": "Ejecutar agente Creador FAQ GEO si no se ha hecho, implementar schema en página /faq"
    },
    {
      "prioridad": 4,
      "accion": "Actualizar categoría en Apple Business Connect",
      "plataforma": "Siri",
      "impacto": "Medio",
      "tiempo_estimado": "30 minutos",
      "instrucciones": "Ir a businessconnect.apple.com y actualizar la categoría principal"
    },
    {
      "prioridad": 5,
      "accion": "Añadir Q&A al perfil GBP",
      "plataforma": "Gemini",
      "impacto": "Medio",
      "tiempo_estimado": "1 hora",
      "instrucciones": "Usar las FAQs de intención descubrimiento y horarios del agente FAQ GEO"
    }
  ],
  "infraestructura_checklist": {
    "gbp_verificado": true,
    "bing_places": true,
    "bing_webmaster_tools": false,
    "schema_localbusiness": true,
    "schema_faqpage": false,
    "llms_txt": false,
    "https": true,
    "apple_business_connect": true
  },
  "proxima_evaluacion": "Mayo 2026"
}
```

---

## 6. El score de voz 0-100: interpretación y acciones

### 0-30 — Invisible

**Qué significa:** El negocio no aparece en ninguna plataforma de IA de forma consistente. No tiene GBP verificado, o tiene la infraestructura mínima sin optimizar.

**Qué hacer:**
1. Reclamar y verificar GBP inmediatamente (si no está hecho)
2. Ejecutar todos los agentes GEO/AEO en orden
3. Reclamar Bing Places y Apple Business Connect
4. Implementar Schema LocalBusiness en la web

**Expectativa:** Con las acciones básicas, puede salir del nivel invisible en 30-60 días.

---

### 31-60 — Parcial

**Qué significa:** El negocio aparece en alguna plataforma (normalmente Gemini vía GBP) pero es invisible o marginal en otras (Bing/Copilot, Perplexity, Siri).

**Qué hacer:**
1. Identificar las plataformas con score < 50 (son las brechas críticas)
2. Priorizar el `quick_win` del output
3. Ejecutar el `plan_accion` en el orden indicado
4. Evaluar de nuevo en 30 días

**Expectativa:** El nivel parcial se puede superar en 60-90 días con el plan de acción completo.

---

### 61-80 — Competitivo

**Qué significa:** El negocio aparece en la mayoría de plataformas y compite bien en búsquedas de voz locales. Tiene la infraestructura base implementada pero hay optimizaciones pendientes.

**Qué hacer:**
1. Revisar los `puntos_debiles` de la plataforma con menor score
2. Mantener el contenido GEO actualizado (FAQs, chunks, TL;DR)
3. Trabajar en diferenciadores de calidad: más reseñas, contenido editorial, menciones en prensa local
4. Evaluar mensualmente y actuar si el score baja

**Expectativa:** Pasar de competitivo a dominante requiere meses de trabajo consistente.

---

### 81-100 — Dominante

**Qué significa:** El negocio tiene una infraestructura GEO completa y es recomendado de forma consistente en todas las plataformas de IA para las búsquedas locales de su categoría.

**Qué hacer:**
1. Mantener la infraestructura actualizada (no descuidar lo que funciona)
2. Monitorizar mensualmente para detectar caídas
3. Expandir la estrategia GEO a búsquedas de cola larga y servicios específicos
4. Usar el score como argumento de venta ante el cliente (diferenciación competitiva)

---

## 7. La infraestructura que evalúa el Monitor IAs

| Elemento | Plataforma que lo usa | Peso en el score |
|----------|----------------------|-----------------|
| **GBP verificado** | Gemini (alto), Siri (indirecto) | Alto |
| **GBP actualizado** (horarios, fotos, servicios) | Gemini | Alto |
| **GBP Q&A** | Gemini | Medio |
| **Bing Places** | ChatGPT/Copilot | Alto |
| **Bing Webmaster Tools + sitemap** | ChatGPT/Copilot | Alto |
| **Schema LocalBusiness** | Todos | Alto |
| **Schema FAQPage** | Gemini, Perplexity | Alto |
| **Schema AggregateRating** | Gemini, Perplexity | Medio |
| **llms.txt** | Perplexity, modelos de IA con rastreo | Medio-alto |
| **HTTPS** | Perplexity, Bing | Medio |
| **Velocidad de carga web** | Perplexity, Bing | Medio |
| **Apple Business Connect** | Siri | Alto para Siri |
| **Rating y número de reseñas** | Todos | Alto |
| **Directorios online** (Yelp, PA, etc.) | Bing/ChatGPT, Perplexity | Medio |

---

## 8. Acciones post-ejecución

### Uso del score en el informe del cliente

El score de voz es uno de los datos más visuales e impactantes para el cliente. Incluirlo en el informe mensual con:
- Score actual vs score anterior
- Diferencia (+ o -)
- Las 2-3 acciones que más han contribuido al cambio
- Las 2-3 acciones prioritarias para el próximo mes

### Uso del `brecha_principal` y `quick_win`

La `brecha_principal` es la acción de mayor impacto para el próximo período. El `quick_win` es la acción de menor esfuerzo con resultado rápido. Priorizar:
1. `quick_win` para mostrar resultados rápidos al cliente
2. Primer ítem del `plan_accion` para el impacto a largo plazo

### Guardar el historial de scores

Registrar en el CRM del cliente:
- Fecha de la evaluación
- Score total
- Score por plataforma
- Acciones tomadas desde la última evaluación

Esto permite mostrar tendencia al cliente y justificar el valor del servicio.

---

## 9. Frecuencia recomendada

| Momento | Acción |
|---------|--------|
| Inicio de onboarding | Ejecutar para obtener baseline |
| Tras implementar toda la estrategia GEO/AEO | Ejecutar para ver impacto inicial |
| Mensual (recurrente) | Ejecutar para seguimiento — es el único agente mensual del flujo GEO |
| Tras cambios grandes en infraestructura | Ejecutar para medir el impacto del cambio |

---

## 10. Notas y advertencias

- **El score no es en tiempo real.** Evalúa la infraestructura disponible en el CRM en el momento de la ejecución. Si se implementa schema en la web hoy y se ejecuta el Monitor IAs mañana, el score subirá porque el CRM habrá sido actualizado con esa información. El impacto real en las IAs puede tardar días o semanas en reflejarse.
- **Un score alto no garantiza aparecer en todas las búsquedas.** Las IAs tienen sus propios algoritmos y pueden priorizar competidores por factores que el Monitor IAs no puede predecir (más reseñas recientes, más menciones en medios, etc.). El score mide preparación, no posición.
- **Validar el score con búsquedas manuales trimestralmente.** Para confirmar que la evaluación del Monitor IAs se alinea con la realidad, hacer búsquedas reales en Gemini y Perplexity con las consultas de voz del cliente cada trimestre. Documentar capturas de pantalla.
- **Un score que cae bruscamente indica un problema.** Si el score cae más de 15 puntos entre dos evaluaciones mensuales sin cambios en el negocio, revisar: ¿el GBP tiene penalización?, ¿el dominio web tiene problemas de indexación?, ¿hay reseñas negativas recientes?.
- **llms.txt es la frontera del GEO 2026.** Este archivo (ubicado en `/llms.txt` del dominio) le dice a las IAs cómo rastrear y citar la web. Es relativamente nuevo (estándar emergente 2025-2026) pero Perplexity y algunos modelos ya lo leen. Implementarlo es un quick win de bajo esfuerzo y alto impacto futuro.
- **Apple Business Connect es la brecha más olvidada.** La mayoría de agencias ignoran Apple Maps porque no tiene cuota de mercado dominante. Pero Siri sigue siendo el asistente de voz por defecto en cientos de millones de dispositivos iOS. Un perfil Apple Business Connect completo tiene un coste de implementación bajo y un impacto desproporcionado en el score de Siri.
