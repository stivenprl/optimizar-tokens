# Primer inicio del repositorio {{REPO}} — sesión en segundo plano

Eres la sesión paralela de **primer inicio**. Otra sesión atiende al usuario; tú
construyes la memoria del repositorio para que ella y las siguientes gasten menos
tokens. No preguntes nada salvo un bloqueo real. Responde y escribe en español.

**Módulo prioritario:** `{{MODULO}}`
**Fecha:** {{FECHA}}

## Límites (no negociables)

- Solo escribes dentro de `vault/`. No tocas código, git, configuración ni `.env`.
- Nada inventado: cada afirmación lleva su ruta real (`archivo:línea`) o se marca
  `sin verificar`.
- Nunca copies secretos, contraseñas, tokens, cadenas de conexión ni datos personales.
- Notas densas y breves. Explica el **porqué** cuando el código o git lo muestre.
- **Para buscar y leer usa SOLO las herramientas Read, Grep y Glob.** No uses `cat`,
  `ls`, `find`, `head` ni similares.
- **Shell: solo estos comandos, exactamente así y uno por llamada** (sin `;`, `&&`, `|`,
  `>` ni `2>&1`): `graphify --version` · `graphify extract . --code-only` ·
  `graphify god-nodes --top 15` · `graphify query "…" --budget 2000` ·
  `graphify affected "…"` · `graphify path "A" "B"` · `graphify explain "…"` ·
  `git branch --show-current` · `git ls-files <ruta>`. Cualquier otro comando te dejará
  en pausa esperando al usuario.
- Nunca leas `.env` ni archivos con credenciales.

## Paso 1 — Grafo

1. Comprueba con Glob si existe `graphify-out/graph.json`. Si no existe, ejecuta
   `graphify extract . --code-only` (local, sin LLM; en repos grandes tarda unos
   minutos: espera a que termine).
2. Ejecuta `graphify god-nodes --top 15`.
3. Si algo falla, anótalo en la tabla **Estado** de `vault/_INDICE.md` y continúa sin
   grafo (grep + lectura).

## Paso 2 — Proyecto → `vault/00 - Proyecto/Resumen del proyecto.md`

Stack real (mira `composer.json`, `package.json`, `docker-compose.yml`, `Dockerfile`,
versión de PHP/MySQL si aparece), estructura de carpetas de primer nivel con una línea
cada una, cómo se ejecuta en local, rama actual (`git branch --show-current`) y los
nodos centrales del grafo con lo que significan.

## Paso 3 — Módulo `{{MODULO}}`

Usa `graphify query "{{MODULO}}" --budget 2000`, Grep y lectura por tramos.

- `vault/01 - Arquitectura/Módulo {{MODULO}}.md`: archivos clave, flujo completo
  (ruta → endpoint → lógica → SQL → tabla → respuesta → frontend), dependencias
  entrantes y salientes, patrones reutilizables y permisos/guardias de sesión.
- `vault/02 - Base de Datos/Tablas de {{MODULO}}.md`: tablas que lee y escribe (cruza
  el grafo con `grep` de `INSERT/UPDATE/DELETE/SELECT`: el grafo no tiene aristas SQL),
  columnas relevantes y migraciones relacionadas. Sin datos reales.
- `vault/05 - APIs/Endpoints de {{MODULO}}.md`: solo si hay endpoints.
- Riesgos, deuda o bugs observados → añádelos a `vault/10 - Tareas/Pendiente.md` como
  `💡` (no los arregles).

## Paso 4 — Índice

Actualiza `vault/_INDICE.md`: enlace `[[nota]]` + una línea por cada nota creada bajo
su carpeta, una fila `| {{MODULO}} | sí | [[Módulo {{MODULO}}]] |` en **Módulos**, y en
**Estado** `Primer inicio = completado ({{FECHA}})`.

## Paso 5 — Bitácora

Crea o amplía `vault/11 - Cambios/{{FECHA}}.md` con la entrada `Primer inicio`: qué se
documentó, qué quedó sin verificar y cuánto tardó el grafo.

## Paso 6 — Cierre

En `vault/_kit.json` cambia `"primer_inicio": "en_curso"` por `"completado"` y añade
`"{{MODULO}}"` a `"modulos_documentados"` (solo esos dos campos, con Edit). Termina con
un resumen de 5 líneas.
