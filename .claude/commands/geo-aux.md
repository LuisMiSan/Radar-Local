# Comandos GEO Auxiliares

---

## /geo:audit <url>
Solo ejecuta el Agente 1 (Analyzer). No reescribe contenido ni genera propuesta.
Útil para: diagnóstico rápido antes de una reunión de ventas.

**Output:** `geo-output/analysis.json` + informe visual en pantalla (30-60 segundos)

---

## /geo:compete <query>
Análisis competitivo. Busca quién aparece actualmente en IAs para una query específica.

**Uso:**
```
/geo:compete "dentista Madrid Chamberí"
/geo:compete "fisioterapeuta rodilla Madrid"
```

**Proceso:**
1. Identificar los 3-5 competidores mejor posicionados para esa query
2. Evaluar qué tienen ellos que nuestro cliente no tiene (señales GEO)
3. Identificar la brecha y las acciones para superarlos

**Output:** `geo-output/competencia-[query].md` con análisis de brechas

---

## /geo:report
Genera la propuesta comercial PDF a partir de los datos del último análisis.
Requiere que existan `geo-output/analysis.json` y `geo-output/ranking.json`.

**Output:** `geo-output/propuesta-cliente.pdf` (usa skill pdf)

---

## /geo:optimize <archivo>
Optimiza un archivo de texto específico sin ejecutar el pipeline completo.

**Uso:**
```
/geo:optimize ./contenido/home.txt
/geo:optimize ./paginas/servicios.md
```

**Output:** `geo-output/optimized/[nombre-archivo].md` con contenido optimizado

---

## /geo:batch <carpeta>
Procesa múltiples URLs o archivos de texto en secuencia.

**Uso:**
```
/geo:batch ./clientes/
```

Donde la carpeta contiene un archivo `urls.txt` con una URL por línea.

**Output:** Una carpeta `geo-output/[dominio]/` por cada URL procesada.
