---
name: memoria-repo
description: "Primer inicio y uso del vault (vault/) y del grafo (graphify-out/) locales del repositorio. Invocar cuando el hook de inicio diga 'sin iniciar' o se trabaje en un módulo sin documentar."
---

# Memoria del repositorio: vault + grafo

Dos memorias locales por repositorio, **nunca en git** (excluidas en
`.git/info/exclude`):

| Carpeta | Qué guarda | Quién la mantiene |
|---|---|---|
| `vault/` | Por qué existe cada cosa: decisiones, flujos, bugs, bitácora | Claude, al cerrar cambios significativos |
| `graphify-out/` | Qué se relaciona con qué (grafo del código) | Hook `post-commit` de Graphify, solo |

El kit vive en `~/.claude-kit/` y su CLI es `node "$HOME/.claude-kit/kit.mjs"`.

---

## 1. Primer inicio (el hook dijo "repositorio sin iniciar")

Objetivo: dejar lanzada la creación del vault y del grafo **en paralelo** y volver
enseguida a la tarea del usuario. Coste para la sesión principal: 3 llamadas.

1. **Preparar** (idempotente, no toca nada versionado):
   ```bash
   node "$HOME/.claude-kit/kit.mjs" iniciar-repo .
   ```
   Devuelve JSON con `repo`, `modulos` (candidatos detectados en carpetas reales, con
   número de archivos), `hechos` (exclusiones git, `.graphifyignore`, vault, `.htaccess`,
   hook de Graphify, registro en Obsidian), `avisos` y `errores`.
   - Si `ok` es `false`, muestra `errores` al usuario y **no lances nada**. Si el error
     dice que git ve cambios nuevos, enséñale `git diff` de esos archivos y deshaz solo
     eso con su visto bueno.
   - Cada `aviso` se le cuenta en una línea. Los que proponen tocar un archivo
     versionado (p. ej. añadir `vault/` a `.dockerignore`) necesitan su aprobación.
   - Un `vault/` de Obsidian que ya existía se **adopta** tal cual; uno que no es de
     Obsidian ni del kit detiene el proceso.

2. **Preguntar el módulo** con AskUserQuestion: los 3 candidatos con más archivos
   como opciones (descripción = ruta y nº de archivos) y la opción automática "Otro"
   para escribirlo. Si el usuario ya nombró el módulo en su mensaje, no preguntes:
   úsalo. Si responde "ninguno" / "no usar kit aquí", ejecuta
   `node "$HOME/.claude-kit/kit.mjs" omitir .` y sigue sin vault.

3. **Lanzar la sesión paralela**:
   ```bash
   node "$HOME/.claude-kit/kit.mjs" lanzar . --modulo "<módulo>"
   ```
   Abre una sesión `claude --bg` con Sonnet y permisos exactos: leer dentro del repo
   (nunca `.env`), los subcomandos de consulta de `graphify`, `git branch
   --show-current`, `git ls-files` y escribir **solo** en `vault/`. Trabaja sobre la
   copia real (sin worktree) para que el vault quede en su sitio. Construye el grafo
   (local, sin LLM) y después documenta el módulo. Si pide un permiso que no tiene,
   queda en pausa visible en `claude agents`: no ejecuta nada por su cuenta.
   Devuelve `id` de la sesión.

4. **Decirle al usuario en dos líneas** qué quedó corriendo y cómo verlo:
   `claude agents` (lista) · `claude logs <id>` (salida) · `claude attach <id>`.

5. **Seguir con su tarea** sin esperar. Mientras el grafo no exista, analiza con
   Grep + lectura. Cuando `vault/_kit.json` diga `"primer_inicio": "completado"`,
   lee `vault/_INDICE.md` y las notas del módulo antes de investigar el código.

## 2. Lectura en cada tarea (el orden ahorra tokens)

1. `vault/_INDICE.md` → abre **solo** las notas del módulo afectado.
2. `graphify query "<pregunta concreta>" --budget 1500` (`--dfs` para seguir un camino;
   `graphify affected "<nodo>"` para impacto entrante; `graphify path "A" "B"`).
3. Código real de los archivos señalados. **Si difiere del vault o del grafo, manda el
   código** y corrige la nota al cerrar.
4. Tablas: el grafo no tiene aristas SQL → cruza con `grep` de
   `INSERT|UPDATE|DELETE|SELECT … <tabla>`.

Si el módulo de la tarea figura como no documentado en el índice, documéntalo al
cerrar la tarea (sección 3), con lo que ya leíste: no repitas lectura para eso.

## 3. Mantenimiento (al cerrar una tarea)

### ¿Es significativo?

| Sí → actualizar vault | No → solo bitácora (o nada) |
|---|---|
| Módulo, pantalla, endpoint o archivo nuevo | Textos, traducciones, typos |
| Tabla, columna o migración nueva o cambiada | Ajuste de estilo puntual |
| Cambio de flujo, permiso o regla de negocio | Cambio sin efecto fuera del archivo |
| Decisión de arquitectura o de diseño tomada | Refactor interno sin cambio de contrato |
| Bug con causa raíz no obvia | |
| Trampa de entorno, despliegue o medición descubierta | |

### Cómo (sin frenar la sesión)

Invoca la skill **`actualizar-vault`** pasándole como argumento **lo que ya sabes**
(resumen de 3–6 líneas con `archivos:línea`, tablas, decisión, porqué y commit). Corre
en un subagente Sonnet aparte (`context: fork`): no relee el repo y su trabajo no ocupa
la conversación principal.

Cambios no significativos: una línea en `vault/11 - Cambios/<fecha>.md`, directamente.

### Grafo

- En cada `git commit` se rehace solo (hook `post-commit` de Graphify, AST, sin LLM).
- Tras `git pull`/cambio de rama grande o si el hook de inicio dice "grafo
  desfasado": `graphify update .` (incremental, sin LLM).
- Tras un refactor que borra mucho código: `graphify update . --force`.

## 4. Reglas de escritura del vault

- **Una nota por concepto**, título que se entienda solo. Enlaza con `[[nota]]`.
- Explica **por qué**; el qué ya lo dice el código. Cita `archivo:línea` y commits.
- Fechas absolutas (`2026-09-16`), nunca "ayer" ni "la semana pasada".
- **Edita la nota existente** en lugar de crear otra parecida; si una decisión cambia,
  corrígela y deja una línea con la fecha del cambio.
- Varias sesiones pueden escribir a la vez: usa Edit (no reescribas archivos
  enteros) y añade al final en bitácoras y pendientes.
- Nunca: secretos, contraseñas, tokens, cadenas de conexión, datos personales.
- La bitácora `11 - Cambios/<fecha>.md` es la **memoria de sesión**: al cerrar la
  jornada, 3–8 líneas con lo hecho, lo pendiente y lo que la siguiente sesión debe
  saber.

## 5. Problemas conocidos

| Síntoma | Causa | Solución |
|---|---|---|
| Las tablas no salen en el grafo | Falta `tree-sitter-sql` | `uv tool install --reinstall --with tree-sitter-sql graphifyy` y `graphify update . --force` |
| Grafo enorme y lento | Librerías de terceros dentro del repo | Añadir sus rutas a `.graphifyignore` y `graphify update . --force` |
| `graphify-out/` aparece en `git status` | Exclusión no aplicada | `node "$HOME/.claude-kit/kit.mjs" iniciar-repo .` (repara) |
| El vault no aparece en Obsidian | Obsidian estaba abierto al registrar | Cerrar Obsidian y `node "$HOME/.claude-kit/kit.mjs" registrar-obsidian .` |
| La sesión paralela no avanza | Espera un permiso | `claude agents` → `claude attach <id>`: aprobar solo si es lectura; si no, `claude stop <id>` |
| El hook dice "más de 3 h en curso" | La sesión paralela se detuvo | `claude agents`; si no está, `kit.mjs lanzar . --modulo "<módulo>"` |
| Repo que es raíz web (Apache) | `vault/` quedaría servido | El kit pone `.htaccess` de denegación; en nginx, bloquear `/vault/` y `/graphify-out/` en su configuración |
| Se despliega copiando la carpeta (FTP, rsync, `COPY . .`) | Fuera de git no basta | Excluir `vault/` y `graphify-out/` en ese proceso (`.dockerignore`, reglas de rsync/FTP), con aprobación |
| El repo usa `core.hooksPath` (husky, .githooks) | El hook iría a una carpeta compartida | El kit no lo instala: `graphify update .` tras los commits |

---

## 27. OBSIDIAN — MEMORIA VIVA DEL REPOSITORIO

Cada repositorio tiene **su propio vault en `vault/`**, dentro del repo y **excluido de
git** (en `.git/info/exclude`, no en `.gitignore`). No mezcles documentación de
proyectos distintos. El kit lo crea con esta estructura:

`00 - Proyecto` · `01 - Arquitectura` · `02 - Base de Datos` · `03 - Backend` ·
`04 - Frontend` · `05 - APIs` · `06 - Docker` · `07 - UI-UX` · `08 - Decisiones` ·
`09 - Bugs y soluciones` · `10 - Tareas` · `11 - Cambios` (bitácora de sesiones) ·
`12 - Testing` · y `_INDICE.md` en la raíz.

### Qué documentar

Arquitectura · estructura de módulos · decisiones técnicas · reglas de negocio ·
entidades y relaciones importantes de base de datos · endpoints/APIs ·
configuraciones importantes · procesos y flujos complejos · soluciones a bugs
difíciles · decisiones de UI/UX · convenciones · problemas conocidos · deuda técnica ·
dependencias · cambios arquitectónicos · procedimientos que se repetirán.

**No documentes trivialidades.** Documenta lo que tenga valor futuro. Nunca escribas
secretos, contraseñas, tokens ni datos personales de clientes en el vault.

> La documentación explica **POR QUÉ** existe algo, no solo QUÉ hace.

Cuando descubras algo importante no documentado, o cuando cambie una decisión,
actualiza la nota relacionada. El cómo y el cuándo están en la skill `memoria-repo`.
