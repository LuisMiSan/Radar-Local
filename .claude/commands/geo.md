# Comando /geo — Pipeline GEO Completo

Ejecuta el pipeline GEO completo de 4 agentes para la URL proporcionada.

## Uso
```
/geo <url>
/geo https://clinica-ejemplo.es
```

## Instrucciones

Cuando el usuario ejecute `/geo <url>`:

1. **Confirmar inicio** — Mostrar:
   ```
   🚀 Iniciando pipeline GEO para: [URL]
   Agentes: Analyzer → Ranker → Rewriter → Indexer
   Tiempo estimado: 3-5 minutos
   ```

2. **Crear carpeta de output**
   ```bash
   mkdir -p geo-output/optimized geo-output/schema
   ```

3. **Ejecutar Agente 1 — Analyzer**
   Usar el agente geo-analyzer.md para analizar la URL y generar `geo-output/analysis.json`
   Mostrar: `🔍 Analizando contenido y señales GEO...`

4. **Ejecutar Agente 2 — Ranker**
   Usar el agente geo-ranker.md con analysis.json para generar `geo-output/ranking.json`
   Mostrar: `📊 Simulando ranking en IAs...`

5. **Ejecutar Agente 3 — Rewriter**
   Usar el agente geo-rewriter.md para generar contenido optimizado
   Mostrar: `✍️ Reescribiendo contenido para IAs...`

6. **Ejecutar Agente 4 — Indexer**
   Usar el agente geo-indexer.md para generar schemas, checklist y propuesta
   Mostrar: `🗂️ Generando schema, checklist y propuesta comercial...`

7. **Resumen final** — Mostrar:
   ```
   ✅ Pipeline GEO completado

   📁 geo-output/
   ├── report.md              ← Informe ejecutivo
   ├── propuesta-cliente.md   ← Propuesta lista para enviar
   ├── checklist.md           ← Implementación paso a paso
   ├── optimized/             ← Contenido reescrito (4 archivos)
   └── schema/                ← JSON-LD listo para instalar

   Score GEO: [actual]/100 → [proyectado]/100 con Radar Local
   ```
