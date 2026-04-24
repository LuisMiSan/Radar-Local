# SOP-03 — Optimizador NAP

**Categoría:** Map Pack | **Versión:** 1.0 | **Fecha:** Abril 2026

---

## 1. Objetivo

Verificar que el **NAP** del negocio (Name, Address, Phone — Nombre, Dirección, Teléfono) es **idéntico carácter por carácter** en todos los directorios online donde aparece el cliente, y generar un plan de corrección para las inconsistencias detectadas.

Las inconsistencias de NAP son una de las causas más frecuentes de pérdida de posición en Map Pack y pasan completamente desapercibidas para el dueño del negocio. Google usa los datos de directorios externos para validar la información de GBP. Si encuentra contradicciones ("Calle Mayor, 12" en un sitio y "C/ Mayor 12" en otro), **pierde confianza en los datos del negocio** y puede bajarlo en el ranking o directamente no mostrarlo.

---

## 2. Cuándo ejecutar

- **Mes 1 (baseline obligatorio):** Para todo cliente nuevo. Construye el mapa completo de presencia online del negocio.
- **Trimestral:** Los directorios actualizan sus datos de fuentes propias. Un NAP correcto puede corromperse sin que nadie lo toque.
- **Tras cambio de datos del negocio:** Si el cliente cambia de local, número de teléfono, nombre comercial o añade una sucursal, ejecutar inmediatamente.
- **Tras fusión o rebranding:** Cualquier cambio de identidad del negocio requiere una auditoría completa de NAP.

---

## 3. Cómo ejecutar (paso a paso en el panel de agentes)

### Paso 1 — Definir el NAP canónico

Antes de ejecutar el agente, hay que tener claro el **formato canónico** — la versión "oficial" que se usará en todos los directorios. Este es el estándar que el agente usará para detectar desviaciones.

**Reglas del formato canónico:**

**Nombre:** Usar exactamente el mismo nombre que aparece en GBP. Sin abreviaturas no oficiales.
- Correcto: "Clínica Dental Martínez"
- Incorrecto: "Clínica Dra. Martínez", "Dental Martínez"

**Dirección:** Usar el formato oficial del Callejero Municipal. Prestar atención a:
- "Calle" vs "C/" vs "C." (elegir uno y ser consistente)
- Número de piso/local: "2º B" vs "2B" vs "Piso 2, Puerta B"
- Código postal siempre incluido
- No incluir el barrio en el campo de dirección (va en un campo separado si existe)

**Teléfono:** Formato con prefijo nacional, sin espacios o con espacio estándar:
- Recomendado: "+34 91 234 56 78" o "91 234 56 78"
- Evitar: "(91) 234-56-78", "0034912345678"

**Ejemplo de NAP canónico:**
```
Nombre: Clínica Dental Martínez
Dirección: Calle Gran Vía, 45, 2º B, 28013 Madrid
Teléfono: +34 91 234 56 78
```

### Paso 2 — Recopilar presencia en directorios

Reunir la lista de directorios donde está dado de alta el cliente. Consultar al cliente o revisar los que el agente sugiere por defecto (ver ecosistema en sección 8).

Para cada directorio, copiar el NAP tal como aparece actualmente.

### Paso 3 — Ejecutar el agente

- Acceder a `/admin/agentes`
- Seleccionar el cliente en el panel izquierdo
- Seleccionar agente `optimizador_nap` en el panel derecho
- Introducir:
  - NAP canónico (formato definitivo)
  - Lista de directorios con el NAP actual en cada uno
- Ejecutar y esperar resultado (2-3 minutos)

### Paso 4 — Revisar el JSON de salida

El agente devuelve el porcentaje de consistencia global y la lista detallada de inconsistencias con instrucciones de corrección por plataforma.

---

## 4. Qué genera (salida)

```json
{
  "nap_canonico": {
    "nombre": "Clínica Dental Martínez",
    "direccion": "Calle Gran Vía, 45, 2º B, 28013 Madrid",
    "telefono": "+34 91 234 56 78"
  },
  "porcentaje_consistencia": 62,
  "total_directorios_auditados": 13,
  "directorios_consistentes": 8,
  "directorios_con_problemas": 5,
  "inconsistencias": [
    {
      "plataforma": "Yelp España",
      "campo": "telefono",
      "valor_actual": "912345678",
      "valor_correcto": "+34 91 234 56 78",
      "impacto": "medio",
      "pasos_correccion": [
        "Acceder a biz.yelp.es",
        "Login con cuenta del negocio",
        "Ir a Información del negocio > Número de teléfono",
        "Cambiar por: +34 91 234 56 78",
        "Guardar cambios"
      ]
    },
    {
      "plataforma": "PáginasAmarillas",
      "campo": "nombre",
      "valor_actual": "Dental Martínez",
      "valor_correcto": "Clínica Dental Martínez",
      "impacto": "alto",
      "pasos_correccion": [
        "Acceder a paginasamarillas.es y buscar el listado",
        "Reclamar perfil si no está reclamado",
        "Contactar con soporte de PA para corrección de nombre (suele requerir documentación)",
        "Subir copia del CIF o documentación legal con nombre completo"
      ]
    }
  ],
  "directorios_no_dados_de_alta": [
    {
      "plataforma": "Apple Business Connect",
      "prioridad": "alta",
      "url_registro": "register.apple.com/business",
      "razon": "Apple Maps usa estos datos para Siri en iOS"
    }
  ]
}
```

---

## 5. Cómo interpretar los resultados

### Porcentaje de consistencia

| Rango | Estado | Acción |
|---|---|---|
| 90-100% | Excelente | Mantenimiento trimestral |
| 70-89% | Aceptable | Corregir inconsistencias de impacto alto en las próximas 2 semanas |
| 50-69% | Problemático | Campaña de corrección urgente en el mes en curso |
| 0-49% | Crítico | Problema grave. Puede estar penalizando activamente el ranking. Corrección inmediata. |

### Impacto de cada inconsistencia

**Alto:** Directorios de autoridad alta (GBP, Bing Places, Apple Maps, Yelp, TripAdvisor). Una inconsistencia aquí tiene impacto directo en el ranking.

**Medio:** Super Citaciones y directorios sectoriales (PáginasAmarillas, QDQ, Doctoralia). Corregir en el ciclo siguiente.

**Bajo:** Directorios secundarios y redes sociales. Corregir cuando sea posible, sin urgencia.

### Directorios no dados de alta

El agente también detecta directorios de alta prioridad donde el negocio no está presente. Esto no es inconsistencia NAP, pero sí es una oportunidad perdida. Priorizar alta en Apple Business Connect (Siri) y Bing Places (usuarios Windows y Edge).

---

## 6. Acciones post-ejecución

### Proceso de corrección manual

Cada inconsistencia requiere acción manual del operador en cada plataforma. Seguir los `pasos_correccion` del JSON de salida para cada caso.

**Orden de corrección recomendado:**
1. Primero: GBP (si tiene inconsistencias, corregir antes que nada)
2. Segundo: Bing Places y Apple Business Connect (alto impacto en Bing Maps y Siri)
3. Tercero: Yelp, TripAdvisor, PáginasAmarillas (super citaciones)
4. Cuarto: Directorios sectoriales específicos del cliente
5. Quinto: Redes sociales y el resto de directorios

**Registrar correcciones:** Anotar en el CRM qué se ha corregido, en qué plataforma y cuándo. Los cambios en directorios pueden tardar días o semanas en reflejarse en Google.

### Alta en directorios nuevos

Para los directorios marcados como "no dados de alta", crear el listado usando siempre el NAP canónico. No improvisar el formato — copiar exactamente del documento canónico.

---

## 7. Frecuencia recomendada

| Situación | Frecuencia |
|---|---|
| Mantenimiento estándar | Trimestral |
| Tras cambio de datos del negocio | Inmediato |
| Tras rebranding o mudanza | Inmediato + seguimiento mensual durante 3 meses |
| Cliente con consistencia < 70% | Mensual hasta superar 85% |

---

## 8. Notas y advertencias

### Ecosistema de directorios relevantes en España (2026)

**Críticos — impacto directo en Google:**
- Google Business Profile (fuente primaria)
- Bing Places for Business (Bing Maps, Edge, Copilot)
- Apple Business Connect (Apple Maps, Siri)

**Super Citaciones — alta autoridad de dominio:**
- Yelp España (yelp.es)
- PáginasAmarillas (paginasamarillas.es)
- QDQ (qdq.com)
- TripAdvisor (para hostelería, turismo, restauración)
- Foursquare

**Especializados por sector:**
- Doctoralia (salud, medicina, dental)
- TheFork / ElTenedor (restaurantes)
- Booking / Airbnb (alojamiento)
- Habitaclia / Idealista (inmobiliario)
- InfoJobs / Indeed (RRHH — secundario)

**Redes sociales (NAP en página "Sobre nosotros"):**
- Facebook Business Page
- Instagram (bio)
- LinkedIn Company Page
- Twitter/X (bio)

**Navegación:**
- Waze (waze.com/business)
- TomTom (maps.tomtom.com)
- HERE Maps

**Otros directorios generales España:**
- Europages
- Páginas Blancas (paginasblancas.es)
- Axesor (negocio con CIF)

**Advertencias importantes:**
- **Nunca usar "y" en lugar de "&" o viceversa** en el nombre si no es consistente con GBP.
- **No añadir ciudad al nombre** (ej: "Clínica Dental Martínez Madrid") — esto viola las directrices de GBP y puede suspender el perfil.
- Algunos directorios (PáginasAmarillas, Axesor) obtienen sus datos del Registro Mercantil. Si la razón social difiere del nombre comercial, puede ser necesario separar ambos conceptos en la estrategia.
- **El agente no puede actualizar los directorios directamente** — solo analiza y genera instrucciones. Todas las correcciones son manuales.
- **Packs con acceso:** `visibilidad_local` y `autoridad_maps_ia`.
