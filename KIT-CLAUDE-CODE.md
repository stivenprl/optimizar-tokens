# Optimizar tokens en Claude Code — kit para jornadas largas

> **Versión 2.0.0 · 16 de septiembre de 2026**
> **Documento autocontenido:** este único archivo lleva dentro las instrucciones y todos
> los archivos del kit. Lo externo (Graphify y Obsidian) se descarga de sus fuentes
> oficiales durante la instalación.
> Sistemas: Windows 10/11 · macOS 13+ · Linux (Ubuntu/Debian/Fedora)

Este documento hace dos cosas:

1. **Explica a una persona** qué ahorra el kit, con cifras medidas (sección 1).
2. **Instruye a Claude Code** para instalarlo y configurarlo solo (sección 2 y
   siguientes). Basta con **entregarle este archivo una vez**.

---

## Índice

1. [Resumen: qué ahorra y cuánto](#1-resumen-qué-ahorra-y-cuánto)
2. [Instrucciones para Claude: instalación](#2-instrucciones-para-claude-instalación)
3. [Primer inicio en cada repositorio](#3-primer-inicio-en-cada-repositorio)
4. [Cómo ahorra tokens: las reglas](#4-cómo-ahorra-tokens-las-reglas)
5. [Jornadas de 8 horas: cómo trabajar para gastar menos](#5-jornadas-de-8-horas-cómo-trabajar-para-gastar-menos)
6. [Mediciones completas](#6-mediciones-completas)
7. [Memoria viva: cómo se mantiene sola](#7-memoria-viva-cómo-se-mantiene-sola)
8. [Seguridad y privacidad](#8-seguridad-y-privacidad)
9. [Actualizar el kit](#9-actualizar-el-kit)
10. [Solución de problemas](#10-solución-de-problemas)
11. [Qué instala exactamente y enlaces oficiales](#11-qué-instala-exactamente-y-enlaces-oficiales)
12. [Anexo: archivos del kit](#anexo--archivos-del-kit-versión-200)

---

## 1. Resumen: qué ahorra y cuánto

### La idea

Un Claude Code recién instalado no conoce el proyecto: para responder «¿cómo funciona
esto?» **lee código a ciegas**, a veces lanzando subagentes que recorren decenas de
archivos. Cada lectura son tokens y minutos. El kit le da a cada repositorio dos memorias
locales para que **consulte antes de leer**:

| Memoria | Qué guarda | Coste de crearla |
|---|---|---|
| **Vault de Obsidian** (`vault/`) | El *porqué*: decisiones, flujos, bugs resueltos, bitácora | Una sesión en segundo plano con el modelo económico, una vez por módulo |
| **Grafo de Graphify** (`graphify-out/`) | El *qué depende de qué*: archivos, funciones, llamadas, tablas | **0 tokens**: análisis estático local (~3,5 min en un repo de 25.000 nodos) |

Las dos quedan **solo en el equipo y nunca en git**. Además, unas reglas breves le dicen a
Claude cuándo usarlas y cuándo no, y cuándo compactar el contexto.

### Resultados medidos (16 sep 2026)

Mismas tres preguntas reales sobre un proyecto PHP + MySQL en producción, dos
veces cada una, con el mismo modelo, en una sesión **sin nada** y otra **con vault + grafo**:

| | Sin nada | Con vault + Graphify | Diferencia |
|---|---|---|---|
| Tokens consumidos (incluidos subagentes) | 6,49 M | **3,92 M** | **−40 %** |
| Coste equivalente en la API | 3,14 USD | **2,11 USD** | **−33 %** |
| Tiempo | 12,5 min | **8,0 min** | **−36 %** |
| Respuestas correctas | 100 % | 100 % | igual |

Por tipo de pregunta:

| Pregunta | Resultado con vault + grafo |
|---|---|
| Entender un flujo entre funciones | **−44 % tokens, −39 % tiempo** |
| Recuperar una decisión ya documentada | **−56 % tokens, −62 % tiempo** |
| Buscar dónde se usa algo (un grep lo resuelve) | +56 % tokens → por eso la regla del kit es **no consultarlos en ese caso** |

**Coste fijo del kit:** ~1.400 tokens más por petición que un Claude recién instalado,
medido (el ~0,5 % de una petición típica de trabajo real, ~300.000 tokens de contexto).

> **Cuánto fiarse:** muestra pequeña (2 repeticiones por pregunta) y un proyecto con
> buena documentación. Es una tendencia clara, no una media garantizada. Detalle y
> limitaciones en la [sección 6](#6-mediciones-completas).

### Qué incluye

- **Vault + Graphify por repositorio**, creados en paralelo la primera vez que se abre
  Claude en el repo, y mantenidos al día solos.
- **Reglas de ahorro** (~1.000 tokens): qué leer primero, cuándo no usar el grafo, cuándo
  delegar y cuándo compactar.
- **Strategic Compact:** avisa del momento de compactar el contexto al cambiar de fase.
- **Guardia de comandos destructivos** (0 tokens): bloquea borrar volúmenes o bases de datos
  y pide confirmación en `git reset --hard` o `push --force`.

### Qué necesitas

- **Claude Code instalado** y con sesión iniciada (plan Pro, Max, Team o Enterprise):
  - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
  - macOS / Linux: `curl -fsSL https://claude.ai/install.sh | bash`
  - [Guía oficial](https://code.claude.com/docs/en/setup)
- En **Windows**, [Git for Windows](https://git-scm.com/downloads/win) antes de abrir
  Claude Code (si falta, el kit lo instala, pero habrá que reiniciar Claude Code una vez).
- **10–20 minutos** la primera vez. Windows puede pedir permisos (UAC): aceptarlos.

### Cómo se usa

1. Guarda este archivo en el equipo (por ejemplo en *Descargas*).
2. Abre una terminal y ejecuta `claude`.
3. Escribe, con la ruta real: **«Lee `C:\Users\<tú>\Downloads\KIT-CLAUDE-CODE.md` y
   ejecuta su sección 2.»** *(Pasa el archivo, no pegues su contenido.)*
4. Claude mostrará el plan y pedirá **una** confirmación; después instala, comprueba y
   entrega un informe. Si pide reiniciar, cierra Claude Code, ábrelo con
   `claude --continue` y escribe «sigue».
5. Al terminar, **reinicia Claude Code** y ábrelo dentro de un repositorio: la primera vez
   preguntará en qué módulo se va a trabajar y preparará su memoria solo.

### Qué NO hace

No sube nada a GitHub · no modifica el código de los proyectos · no sustituye ningún
`CLAUDE.md` · no guarda claves · no instala plugins ni skills con carga fija.

---

## 2. Instrucciones para Claude: instalación

> **Claude: esta sección es para ti.** Ejecútala en orden.

### 2.0 Reglas de ejecución

1. **Responde siempre en español.**
2. **Antes de instalar**, muestra el plan (sistema detectado, lo que instala la
   [sección 11](#11-qué-instala-exactamente-y-enlaces-oficiales), destino `~/.claude-kit`)
   y **pide una sola confirmación**. Con ella ejecuta todo sin volver a preguntar, salvo lo
   que la regla 5 reserva al usuario.
3. **Cada paso se comprueba** con su salida. Si algo falla, **no inventes el resultado**:
   muestra el error, aplica la [sección 10](#10-solución-de-problemas) y déjalo en el informe.
4. **Comandos largos** (instalación, primer grafo): en segundo plano, esperando la
   notificación.
5. **Lo interactivo o con privilegios lo hace el usuario en SU terminal** (no con `!`):
   `sudo`, instalar Homebrew. Dale el comando exacto y espera su confirmación.
6. **Reinicio:** Claude Code conserva el PATH de su arranque. Si se instala git, node o uv
   (el script termina con código **2**), **detente** y pide al usuario que reinicie con
   `claude --continue` y diga «sigue». Retoma en el mismo paso.
7. **Nunca** escribas claves, tokens o contraseñas en archivos ni en la conversación.
8. El kit **no toca** `~/.claude/CLAUDE.md`. En `~/.claude/settings.json` solo añade sus
   tres hooks en grupos propios, con respaldo `settings.json.bak-<fecha>`.

### 2.1 Detectar el sistema operativo

```bash
node -p "process.platform"
```

| Salida | Sistema | Scripts | Shell |
|---|---|---|---|
| `win32` | Windows | `instalar.ps1`, `iniciar-repo.ps1` | PowerShell para `.ps1`; Bash o PowerShell para `node …` |
| `darwin` | macOS | `instalar.sh`, `iniciar-repo.sh` | Bash |
| `linux` | Linux | `instalar.sh`, `iniciar-repo.sh` | Bash |

Si `node` aún no existe: en PowerShell `$env:OS`, en Bash `uname -s`.

> `node "$HOME/.claude-kit/kit.mjs" …` funciona igual en Bash y en PowerShell. **No uses
> `~` como argumento en PowerShell**: no se expande.

### 2.2 Requisitos previos

Comprueba `git --version`, `node --version` (≥ 18), `uv --version` y `claude --version`
(probado con **2.1.273**; si es anterior, `claude update`). Los que falten:

| Requisito | Windows (PowerShell) | macOS (Homebrew) | Linux |
|---|---|---|---|
| Git | `winget install -e --id Git.Git` | `brew install git` | *usuario:* `sudo apt-get install -y git` |
| Node.js LTS | `winget install -e --id OpenJS.NodeJS.LTS` | `brew install node` | *usuario:* `curl -fsSL https://deb.nodesource.com/setup_24.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| uv | `winget install -e --id astral-sh.uv` | `brew install uv` | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |

- **macOS sin Homebrew:** el usuario lo instala desde [brew.sh](https://brew.sh).
- **Windows sin winget:** instalar *App Installer* desde Microsoft Store.
- Si instalaste alguno → **regla 6**.

### 2.3 Extraer el kit de este documento

El kit viaja en el [anexo](#anexo--archivos-del-kit-versión-200). **No lo leas ni lo
transcribas**: lo desempaqueta un extractor que verifica el sha256 de cada archivo.

1. **Ruta de este documento:** la que dio el usuario. Si solo tienes el texto pegado,
   pídele la ruta del archivo.
2. **Crea el extractor** con la herramienta Write en `$HOME/.claude-kit-extraer.mjs`
   (Windows: `C:\Users\<usuario>\.claude-kit-extraer.mjs`), con este contenido exacto:

```js
// Extractor del kit de Claude Code: desempaqueta y verifica el anexo de KIT-CLAUDE-CODE.md.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const [origen, destinoArg] = process.argv.slice(2);
if (!origen) { console.error('Uso: node .claude-kit-extraer.mjs <ruta de KIT-CLAUDE-CODE.md> [destino]'); process.exit(1); }
const destino = path.resolve(destinoArg || path.join(os.homedir(), '.claude-kit'));
const md = fs.readFileSync(origen, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const anexo = md.match(/<!-- kit-anexo version="([^"]+)" archivos="(\d+)" -->/);
if (!anexo) { console.error('No se encontró el anexo: ¿es el KIT-CLAUDE-CODE.md completo?'); process.exit(1); }
const patron = /<!-- kit-archivo ruta="([^"]+)" sha256="([0-9a-f]{64})"((?: \w+)*) -->\n~{8}text\n([\s\S]*?)\n~{8}\n<!-- \/kit-archivo -->/g;
let n = 0;
const errores = [];
for (const [, ruta, sha, attrs, cuerpo] of md.matchAll(patron)) {
  const texto = `${cuerpo}\n`;
  if (path.isAbsolute(ruta) || ruta.split('/').includes('..')) { errores.push(`ruta no permitida: ${ruta}`); continue; }
  if (crypto.createHash('sha256').update(texto, 'utf8').digest('hex') !== sha) { errores.push(`sha256 no coincide: ${ruta}`); continue; }
  let salida = attrs.includes('crlf') ? texto.replace(/\n/g, '\r\n') : texto;
  if (attrs.includes('bom')) salida = `\uFEFF${salida}`;
  const archivo = path.join(destino, ...ruta.split('/'));
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, salida);
  n++;
}
if (n !== Number(anexo[2])) errores.push(`se esperaban ${anexo[2]} archivos y se verificaron ${n}: el documento está incompleto o alterado`);
if (errores.length) { console.error(errores.join('\n')); process.exit(1); }
fs.copyFileSync(origen, path.join(destino, 'KIT-CLAUDE-CODE.md'));
console.log(`Kit ${anexo[1]} extraído y verificado: ${n} archivos en ${destino}`);
```

3. **Ejecútalo** (Bash o PowerShell):

```bash
node "$HOME/.claude-kit-extraer.mjs" "<ruta de este documento>"
```

   Debe terminar con `Kit <versión> extraído y verificado: N archivos`. Si dice
   `sha256 no coincide` o `se esperaban N archivos`, el archivo se alteró o recortó al
   copiarlo: pide al usuario una copia original.
4. Comprueba: `node "$HOME/.claude-kit/kit.mjs"` imprime la ayuda.

### 2.4 Instalar

En segundo plano (5–15 minutos):

*PowerShell (Windows):*

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$HOME\.claude-kit\instalar.ps1"
```

*Bash (macOS / Linux):*

```bash
bash "$HOME/.claude-kit/instalar.sh"
```

Códigos de salida: **0** terminado · **1** algo pendiente (lee la salida) · **2** se
instaló un requisito → **regla 6**.

Qué hace, de forma **idempotente**:

1. Comprueba los requisitos; instala los que falten si puede sin `sudo`.
2. Instala **Graphify** (`uv tool install --with tree-sitter-sql graphifyy` +
   `graphify install`) y **Obsidian**. Lo que ya existe se respeta.
3. Copia las reglas de ahorro a `~/.claude/rules/kit-claude.md`, las skills
   `memoria-repo`, `actualizar-vault` y `strategic-compact`, y los tres hooks.
4. Fusiona `~/.claude/settings.json` (solo los hooks) con respaldo previo.
5. Ejecuta la comprobación final.

### 2.5 Verificar

```bash
node "$HOME/.claude-kit/kit.mjs" comprobar
node "$HOME/.claude-kit/kit.mjs" coste
```

- `comprobar`: todas las filas de **requisitos, obligatorios y kit** en **`OK`** (código 0).
  `AVISO` (p. ej. `gh`) no bloquea.
- `coste`: muestra los tokens fijos que carga cada sesión; con el kit recién instalado,
  alrededor de **1.000–1.500**.

Si algo sale `FALTA`, repite 2.4 una vez y, si persiste, aplica la sección 10. Después borra
el extractor temporal (`$HOME/.claude-kit-extraer.mjs`).

### 2.6 Pasos que quedan en manos del usuario

| Qué | Cuándo | Cómo |
|---|---|---|
| **Reiniciar Claude Code** | Siempre | Reglas y hooks se cargan al iniciar sesión |
| Obsidian en Linux sin flatpak | Si el informe lo marca | En su terminal: `sudo snap install obsidian --classic` o el AppImage de [obsidian.md/download](https://obsidian.md/download) |

### 2.7 Informe de instalación

```text
✅ KIT DE AHORRO DE TOKENS — INSTALACIÓN
Sistema:            <windows|macos|linux> · Claude Code <versión>
Kit:                <versión> en <ruta>
Componentes:        <n> OK / <n> FALTA  (cuáles y por qué)
Carga fija:         <tokens según `kit.mjs coste`>
Respaldos creados:  <archivos .bak o "ninguno">
Pendiente usuario:  <pasos de 2.6 que apliquen>
Siguiente paso:     reiniciar Claude Code y abrirlo dentro de un repositorio
📊 RESULTADO:       🟢 completo / 🟡 con avisos / 🔴 requiere atención
```

---

## 3. Primer inicio en cada repositorio

Ocurre **automáticamente** la primera vez que se abre Claude Code dentro de un repositorio.

```text
Abrir `claude` en un repo
        │
        ▼
Hook de inicio ─── ¿existe vault/_kit.json? ── sí ──► "Vault y grafo listos" (o "grafo desfasado")
        │ no
        ▼
Skill `memoria-repo`
        ├─ 1. kit.mjs iniciar-repo .    → exclusiones git, vault 00–12, .graphifyignore,
        │                                  hook de Graphify, registro en Obsidian, módulos detectados
        ├─ 2. Pregunta: «¿En qué módulo vamos a trabajar?»
        ├─ 3. kit.mjs lanzar . --modulo X
        │         └──► SESIÓN EN SEGUNDO PLANO (Sonnet · permisos mínimos · sin worktree)
        │                  1. construye el grafo (local, 0 tokens)
        │                  2. documenta el proyecto y el módulo X en el vault
        │                  3. actualiza el índice y marca "completado"
        └─ 4. Sigue con lo que pidió el usuario, sin esperar
```

### Qué queda en el repositorio

| Ruta | Contenido | ¿En git? |
|---|---|---|
| `vault/` | `_INDICE.md`, carpetas `00 - Proyecto` … `12 - Testing`, `_kit.json` | **No** |
| `graphify-out/` | `graph.json` y metadatos | **No** |
| `.graphifyignore` | Librerías de terceros que el grafo ignora | **No** |
| `.git/info/exclude` | Bloque `kit-claude` que excluye lo anterior | Local de git |
| `.git/info/attributes` | Driver de fusión del grafo (Graphify lo pone en `.gitattributes`; el kit lo mueve aquí) | Local de git |
| `.git/hooks/post-commit` | Rehace el grafo tras cada commit | Local de git |

El kit compara `git status` antes y después: si aparece **cualquier** cambio nuevo, lo
reporta como error.

### Seguimiento de la sesión en segundo plano

`claude agents` (estado) · `claude logs <id>` (salida) · `claude attach <id>` (entrar, p. ej.
para aprobar un permiso) · `claude stop <id>` (detener).

Solo puede leer dentro del repo (nunca `.env`), ejecutar consultas de `graphify`,
`git branch --show-current` y `git ls-files`, y escribir en `vault/`. Cualquier otra cosa
la deja **en pausa esperando al usuario**.

### Casos especiales

- **Otro módulo más adelante:** al cerrar un cambio en un módulo sin documentar, Claude lo
  documenta con `actualizar-vault` usando lo que ya leyó.
- **Repo donde no se quiere:** responder «no usar kit aquí» → `kit.mjs omitir .`.
- **Ya existe `vault/`:** si es de Obsidian se adopta; si es de otra herramienta, el kit se
  detiene sin tocarlo.
- **Raíz web / despliegue copiando carpetas:** hay `.htaccess` de denegación (Apache); con
  nginx, FTP, rsync o `COPY . .` en Docker hay que excluir `vault/` y `graphify-out/` en ese
  proceso (el kit avisa si ve un Dockerfile sin `.dockerignore` que los excluya).
- **`core.hooksPath`** (husky, `.githooks`): el hook de Graphify no se instala; tras los
  commits, `graphify update .`.
- **Repositorio en la carpeta personal** (dotfiles): el kit no se aplica.

---

## 4. Cómo ahorra tokens: las reglas

Todo lo que carga siempre son las reglas de `~/.claude/rules/kit-claude.md` (~1.000
tokens), los nombres de tres skills y una línea del hook de inicio. Las reglas:

| Situación | Qué hace Claude | Por qué (medido) |
|---|---|---|
| La pregunta se resuelve con un **grep o glob directo** | Lo hace directamente, **sin vault ni grafo** | Consultarlos ahí costó **+56 %** |
| Hay que **entender** un flujo, una dependencia, un impacto o una decisión | `vault/_INDICE.md` → notas del módulo → `graphify query --budget 1500` → código | **−44 %** y **−56 %** de tokens |
| Quién lee o escribe una **tabla** | grep (el grafo no modela SQL) | Evita respuestas incompletas |
| Archivos grandes | Localiza con Grep y lee solo el rango; no relee | Menos tokens por lectura |
| Búsqueda **realmente ancha** | Subagente Sonnet, se queda con la conclusión | Modelo económico, contexto limpio |
| Pregunta **acotada** | **No** lanza subagentes | Lanzarlos multiplicó el consumo (2,4 M frente a 1,3 M) |
| Cambio de fase (investigar → implementar → verificar) | **Compacta** el contexto | Lo leído se queda hasta compactar; el hook avisa |
| Cierre de un cambio significativo | `actualizar-vault` en un subagente aparte | Documenta sin ocupar la conversación |

### Qué se carga y cuándo

| Pieza | Cuándo ocupa contexto |
|---|---|
| Reglas de ahorro | **Siempre** (~1.000 tokens) |
| Skills `memoria-repo`, `actualizar-vault`, `strategic-compact` | **Solo su nombre y descripción corta**; el cuerpo, solo al usarlas |
| Hook de inicio | **Una línea** al abrir sesión |
| Guardia de comandos | **Nunca** (es un hook, no ocupa contexto) |
| `actualizar-vault` al usarse | **Nunca en la conversación**: corre en un subagente |

**Sobre la compactación:** Claude Code ya compacta solo cuando la ventana se llena. El kit
añade **Strategic Compact**, que avisa antes (a los 250.000 tokens y cada +60.000 con
ventana de 1M) para compactar **al cambiar de fase** y no a mitad de una tarea. No compacta
por su cuenta: sugiere el momento.

---

## 5. Jornadas de 8 horas: cómo trabajar para gastar menos

En una sesión larga, cada petición al modelo reenvía **todo** lo que hay en la
conversación. Lo que se leyó a las 9:00 sigue viajando a las 16:00 si nadie lo retira. Por
eso, en jornadas largas, **cómo** se trabaja pesa tanto como el kit.

### Las siete reglas de la jornada larga

| # | Regla | Por qué ahorra |
|---|---|---|
| 1 | **Una tarea, un contexto.** Al terminar una tarea independiente, `/clear` o sesión nueva | Lo de la tarea anterior deja de reenviarse en cada petición |
| 2 | **Compacta al cambiar de fase** (investigar → implementar → verificar) con `/compact` y una instrucción: *«conserva decisiones, archivos tocados y pendientes»* | Retira lo leído que ya no hace falta sin perder lo importante. Strategic Compact avisa del momento |
| 3 | **Lo que importa, al vault, no a la conversación.** Al cerrar un cambio significativo, `actualizar-vault` | Mañana se recupera leyendo una nota, no releyendo la conversación ni el código |
| 4 | **Explora con subagentes solo lo ancho** | Su lectura masiva no vuelve a tu contexto; solo la conclusión |
| 5 | **Trabajo largo y aislado, en segundo plano** (`claude --bg`) | No infla la sesión principal mientras sigues con otra cosa |
| 6 | **Tras una pausa larga, empieza limpio.** Si la sesión estuvo inactiva mucho rato, la caché de prompts puede haber caducado y la siguiente petición vuelve a escribir todo el contexto a precio completo | Una sesión nueva con el vault cuesta menos que reactivar un contexto enorme |
| 7 | **Mira qué ocupa el contexto** con `/context` y la carga fija con `node "$HOME/.claude-kit/kit.mjs" coste` | Lo que no se mide no se recorta |

### Una jornada tipo

```text
09:00  Abrir `claude` en el repo ─► el hook dice "Vault y grafo listos"
       Tarea 1
         investigar   vault/_INDICE.md → notas del módulo → graphify query → código por tramos
         /compact     "conserva decisiones, archivos tocados y pendientes"
         implementar
         verificar
         actualizar-vault "<resumen del cambio>"   (subagente aparte)
       /clear
11:30  Tarea 2 (independiente) ─► mismo ciclo, contexto limpio
13:00  Pausa larga ─► al volver, sesión nueva: el hook y el vault retoman el hilo
       Tarea 3 …
17:00  Cierre: bitácora de la jornada en vault/11 - Cambios/<fecha>.md
       (qué se hizo, qué queda, qué debe saber la sesión de mañana)
Día siguiente: sesión nueva + bitácora, en lugar de `claude --continue` sobre la conversación de ayer
```

### `--continue` o sesión nueva

| Situación | Mejor opción |
|---|---|
| Reinicio breve (actualizar, reabrir la terminal) en mitad de una tarea | `claude --continue` |
| Día siguiente, o tarea distinta | **Sesión nueva**: el vault y la bitácora dan el contexto por una fracción de los tokens |
| Conversación enorme que hay que retomar sí o sí | `claude --continue` y **`/compact` nada más entrar** |

---

## 6. Mediciones completas

Todas del 16 sep 2026 con la API de Anthropic (tokens de entrada, incluidos los
subagentes, y coste equivalente de la API).

### Experimento: sin nada frente a vault + Graphify

- **Proyecto:** aplicación web PHP + MySQL en producción (~25.800 nodos de grafo, vault de 290 notas).
- **Sesiones:** copia limpia del repo sin reglas, skills ni plugins de usuario
  (`--setting-sources project --strict-mcp-config`, `claudeMdExcludes`). A = sin nada;
  B = mismo repo + `vault/` + grafo recién construido + una nota de 5 líneas que dice que
  existen. Mismo modelo (Sonnet), mismas herramientas de solo lectura.
- **3 preguntas × 2 repeticiones × 2 sesiones = 12 corridas.** Calidad comprobada contra la
  verdad extraída del código.

| Pregunta | Sin nada | Con vault + Graphify |
|---|---|---|
| T1 · ¿Qué archivos escriben en la tabla de clientes? | 228 k tok · 0,14 USD · 39 s | 356 k · 0,21 USD · 62 s |
| T2 · ¿Cómo se decide quién recibe un aviso? | 2.366 k tok · 1,03 USD · 218 s | 1.315 k · 0,65 USD · 134 s |
| T3 · ¿Qué hace falta para que una migración quede registrada? | 650 k tok · 0,41 USD · 118 s | 287 k · 0,19 USD · 45 s |
| **Total** | **6,49 M · 3,14 USD · 12,5 min** | **3,92 M · 2,11 USD · 8,0 min** |
| Aciertos | 12/12 archivos · 5/5 · 6/6 | 12/12 · 5/5 · 6/6 |

**Limitaciones:** 2 repeticiones con mucha variación (la misma pregunta dio 204 k y 509 k);
un solo proyecto, con buena documentación (en un repo donde casi todo son librerías de
terceros el grafo aporta menos); solo preguntas de análisis, no de implementación.

### Carga fija frente a un Claude recién instalado

| Configuración (sesión vacía) | Tokens por petición | Diferencia |
|---|---|---|
| Claude recién instalado | 29.178 | — |
| **Este kit (v2)** | 30.582 | **+1.404** |
| Kit de reglas completas (v1, descartado) | — | +2.777 fijos y hasta +18.000 en tareas |
| Primer diseño (todo cargado siempre) | — | +15.200 |

---

## 7. Memoria viva: cómo se mantiene sola

| Momento | Qué se actualiza | Cómo | Coste |
|---|---|---|---|
| Cada `git commit` | Grafo | Hook `post-commit` de Graphify (análisis estático) | 0 tokens |
| `git pull` o cambio de rama grande | Grafo | El hook de inicio avisa «grafo desfasado» → `graphify update .` | 0 tokens |
| Cierre de un cambio **significativo** | Nota del vault + índice + bitácora | `actualizar-vault` en subagente Sonnet, con el resumen que Claude ya tiene | Bajo, fuera de la conversación |
| Módulo sin documentar | Notas del módulo | Al cerrar el cambio, con lo ya leído | Bajo |

**Significativo** = archivo, endpoint o tabla nuevos · cambio de flujo, permiso o regla de
negocio · decisión de diseño · bug con causa raíz no obvia · trampa de entorno descubierta.
**No lo es:** textos, typos, estilos puntuales, refactor interno.

Reglas del vault: una nota por concepto, explica el **porqué**, cita `archivo:línea` y
commit, fechas absolutas, edita la nota existente antes de crear otra, **nunca** secretos
ni datos personales.

---

## 8. Seguridad y privacidad

- **Vault y grafo no salen del equipo por el kit:** excluidos de git, con `.htaccess` de
  denegación; el grafo se construye en local. Claude sí los lee en las sesiones, como lee
  el código.
- **Sesión en segundo plano con permisos exactos** (lectura en el repo sin `.env`,
  consultas de Graphify, escritura solo en `vault/`).
- **Guardia de comandos:** *bloquea* `docker system/volume prune`, `docker volume rm`,
  `docker compose down -v`, `DROP`/`TRUNCATE` por consola y escribir en `.env`; *pide
  confirmación* en `rm -rf`, `git reset --hard`, `git push --force`, `git clean -f` y
  descartar el árbol. Si bloquea algo legítimo, lo ejecuta el usuario.
- **Integridad:** el extractor verifica el sha256 de cada archivo del anexo.

---

## 9. Actualizar el kit

1. **Con una versión nueva de este documento:** entregarlo igual que la primera vez
   (2.3 → 2.4 → 2.5). Es idempotente.
2. **Desde el repositorio** ([github.com/stivenprl/optimizar-tokens](https://github.com/stivenprl/optimizar-tokens)):
   `git -C "$HOME/.claude-kit" pull --ff-only` y `node "$HOME/.claude-kit/kit.mjs" instalar`.

Para cambiar el kit: editar sus archivos (el texto de este documento está en
`docs/KIT-CLAUDE-CODE.fuente.md`), regenerar con `node kit.mjs empaquetar` y **volver a
medir** (`kit.mjs coste` y, para cambios de reglas, repetir el experimento de la sección 6).
No edites `~/.claude/rules/kit-claude.md` a mano: se reemplaza en cada actualización.

---

## 10. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `winget` no existe | Falta *App Installer* | Instalarlo desde Microsoft Store |
| Instalado pero «no encontrado» | PATH del arranque de Claude Code | Reiniciar con `claude --continue` y repetir |
| `instalar.*` termina con código 2 | Se instaló un requisito | Igual que la fila anterior |
| Extractor: `sha256 no coincide` / `se esperaban N archivos` | Documento alterado o recortado | Usar el archivo original |
| `Cannot find module` en PowerShell | `~` en la ruta | Usar `"$HOME/.claude-kit/kit.mjs"` |
| `graphify` «no reconocido» | `~/.local/bin` fuera del PATH | `uv tool update-shell` y reiniciar |
| Las tablas SQL no aparecen en el grafo | Falta `tree-sitter-sql` | `uv tool install --reinstall --with tree-sitter-sql graphifyy` y `graphify update . --force` |
| Grafo enorme o lento | Librerías de terceros en el repo | Añadirlas a `.graphifyignore` y `graphify update . --force` |
| `.gitattributes` modificado | `graphify hook install` a mano | `node "$HOME/.claude-kit/kit.mjs" iniciar-repo .` lo restaura |
| Sesión en segundo plano `idle` sin hacer nada | No recibió el prompt | `claude stop <id>` y repetir `kit.mjs lanzar` |
| Sesión en segundo plano esperando | Pidió un permiso fuera de su lista | `claude attach <id>`: aprobar solo si es lectura |
| Hook: «más de 3 h en curso» | La sesión se detuvo | `claude agents`; si no está, repetir `kit.mjs lanzar` |
| El vault no aparece en Obsidian | Obsidian estaba abierto | Cerrarlo y `node "$HOME/.claude-kit/kit.mjs" registrar-obsidian .` |
| `vault/ no es un vault de Obsidian ni del kit` | Carpeta de otra herramienta | No se toca; decidir con el usuario |
| La guardia bloquea algo necesario | Comando destructivo | Lo ejecuta el usuario |
| `settings.json no es JSON válido` | Edición manual rota | Corregirlo (hay `.bak-*`) y repetir 2.4 |

Diagnóstico: `claude doctor` y `node "$HOME/.claude-kit/kit.mjs" comprobar`.

---

## 11. Qué instala exactamente y enlaces oficiales

Enlaces verificados el 16 de septiembre de 2026.

### Requisitos

| Componente | Para qué | Enlace |
|---|---|---|
| Claude Code (≥ 2.1.273 probado) | El agente | [code.claude.com/docs/en/setup](https://code.claude.com/docs/en/setup) |
| Git (en Windows, Git for Windows) | Control de versiones y Bash | [git-scm.com/downloads](https://git-scm.com/downloads) |
| Node.js LTS (≥ 18) | Ejecuta el kit y los hooks | [nodejs.org/en/download](https://nodejs.org/en/download) |
| uv | Instala Graphify | [docs.astral.sh/uv](https://docs.astral.sh/uv/getting-started/installation/) |

### Externos

| Componente | Para qué | Instalación | Enlace |
|---|---|---|---|
| **Graphify** (`graphifyy`) | Grafo del código, sin IA | `uv tool install --upgrade --with tree-sitter-sql graphifyy` + `graphify install` | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) (rama `v8`) · [PyPI](https://pypi.org/project/graphifyy/) |
| **Obsidian** | Visor y editor del vault | Win `winget install -e --id Obsidian.Obsidian` · mac `brew install --cask obsidian` · Linux `flatpak install --user -y flathub md.obsidian.Obsidian` | [obsidian.md/download](https://obsidian.md/download) |

### Piezas propias (incluidas en el anexo)

| Pieza | Destino | Para qué |
|---|---|---|
| `global/kit-claude.md` | `~/.claude/rules/` | Reglas de ahorro (siempre cargadas, ~1.000 tokens) |
| `skills/memoria-repo` | `~/.claude/skills/` | Primer inicio y orden de lectura de vault + grafo |
| `skills/actualizar-vault` | `~/.claude/skills/` | Mantenimiento del vault en subagente Sonnet (`context: fork`) |
| `skills/strategic-compact` | `~/.claude/skills/` | Cuándo compactar (origen: [affaan-m/ECC](https://github.com/affaan-m/ECC)) |
| `hooks/inicio-repo.js` | `~/.claude/hooks/` | Estado del vault y del grafo al abrir sesión |
| `hooks/strategic-compact/` | `~/.claude/hooks/` | Aviso de compactación por tamaño de contexto |
| `hooks/guardia-destructiva.js` | `~/.claude/hooks/` | Bloqueo y confirmación de comandos destructivos |
| `plantillas/` | Cada repositorio | Vault 00–12, `.graphifyignore`, `.htaccess`, prompt del primer inicio |
| `kit.mjs`, `instalar.*`, `iniciar-repo.*` | `~/.claude-kit/` | CLI multiplataforma y scripts de arranque |

### Referencia del CLI

```text
node "$HOME/.claude-kit/kit.mjs" comprobar [--json]          estado de todo
node "$HOME/.claude-kit/kit.mjs" coste                       tokens fijos por sesión
node "$HOME/.claude-kit/kit.mjs" instalar                    instala / repara (idempotente)
node "$HOME/.claude-kit/kit.mjs" iniciar-repo [ruta]         prepara un repo (idempotente)
node "$HOME/.claude-kit/kit.mjs" modulos [ruta]              módulos detectados
node "$HOME/.claude-kit/kit.mjs" lanzar [ruta] --modulo X    sesión de primer inicio en segundo plano
node "$HOME/.claude-kit/kit.mjs" registrar-obsidian [ruta]   registra el vault en Obsidian
node "$HOME/.claude-kit/kit.mjs" omitir [ruta]               no usar el kit en ese repo
node "$HOME/.claude-kit/kit.mjs" empaquetar                  regenera este documento (mantenedores)
```

---

## Anexo — Archivos del kit (versión 2.0.0)

> **Claude: no leas este anexo.** Lo desempaqueta y verifica el extractor del paso 2.3.
> 24 archivos. Cada bloque lleva su ruta y su sha256.

<!-- kit-anexo version="2.0.0" archivos="24" -->

<!-- kit-archivo ruta=".gitattributes" sha256="91c171a7f4e295966f6e40aba83b0a11a56b4c99b59b9c55fcf54f15df207bc0" -->
~~~~~~~~text
* text=auto eol=lf
*.ps1 text eol=crlf
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta=".gitignore" sha256="aadbde158302be4edc76224e5c7e082b6498e12a423b4459e24a469c46adf17d" -->
~~~~~~~~text
node_modules/
*.bak-*
.DS_Store
Thumbs.db
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="NOTICE.md" sha256="92170b1655b46ec88a7f0781a4d401ceb629c2d17ee57f93b58d1962e4ab17c1" -->
~~~~~~~~text
# Avisos de terceros

## Strategic Compact

`hooks/strategic-compact/hooks/suggest-compact.js`, `hooks/strategic-compact/lib/transcript-context.js`
y `skills/strategic-compact/SKILL.md` proceden de
[affaan-m/ECC](https://github.com/affaan-m/ECC) (antes *everything-claude-code*).
`hooks/strategic-compact/lib/utils.js` es una versión reducida escrita para este kit a partir
del original. Se distribuyen bajo su licencia:

```text
MIT License

Copyright (c) 2026 Affaan Mustafa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Herramientas que el kit instala (no se redistribuyen aquí)

| Herramienta | Licencia | Fuente |
|---|---|---|
| Graphify (`graphifyy`) | Apache-2.0 | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) |
| Obsidian | Propietaria (consultar sus términos de uso) | [obsidian.md](https://obsidian.md) |
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="README.md" sha256="2218ae47cd5d8b6b059fb48eefee1c3de553337fef9b58f6363e508654804add" -->
~~~~~~~~text
# Optimizar tokens en Claude Code

**Un kit para gastar menos tokens y menos tiempo en jornadas largas con
[Claude Code](https://code.claude.com)**: memoria local por repositorio (vault de Obsidian +
grafo de Graphify), reglas de lectura medidas y compactación por fases.

Se instala entregándole **un solo archivo** a Claude Code:
[`KIT-CLAUDE-CODE.md`](KIT-CLAUDE-CODE.md).

---

## Resultados medidos

Mismas tres preguntas reales sobre una aplicación PHP + MySQL en producción, dos veces cada
una, con el mismo modelo (Claude Sonnet), en una sesión **sin nada** y otra **con vault +
Graphify**:

| | Sin nada | Con vault + Graphify | Diferencia |
|---|---:|---:|---:|
| Tokens consumidos (incluidos subagentes) | 6,49 M | **3,92 M** | **−40 %** |
| Coste equivalente en la API | 3,14 USD | **2,11 USD** | **−33 %** |
| Tiempo | 12,5 min | **8,0 min** | **−36 %** |
| Respuestas correctas | 100 % | 100 % | igual |

| Tipo de pregunta | Con vault + Graphify |
|---|---|
| Entender un flujo entre funciones | **−44 % tokens · −39 % tiempo** |
| Recuperar una decisión ya documentada | **−56 % tokens · −62 % tiempo** |
| Buscar dónde se usa algo (lo resuelve un grep) | +56 % tokens → **el kit ordena no usarlos en ese caso** |

**Coste fijo del kit:** +1.404 tokens por petición frente a un Claude Code recién instalado.

> Muestra pequeña (2 repeticiones por pregunta, un proyecto bien documentado): tendencia
> clara, no media garantizada. Metodología y limitaciones completas en la sección 6 del
> documento.

---

## Cómo funciona

```text
                       ┌─────────────────────────────────────────────┐
  Abrir `claude`  ───► │ Hook de inicio: ¿vault y grafo listos?      │
  en un repo           └──────────────┬──────────────────────────────┘
                                      │ primera vez
                                      ▼
                  «¿En qué módulo vamos a trabajar?»
                                      │
            ┌─────────────────────────┴────────────────────────┐
            ▼                                                  ▼
  Sesión en segundo plano (Sonnet)                  Tú sigues trabajando
   1. grafo con Graphify (0 tokens, local)
   2. documenta el módulo en vault/
                                      │
                                      ▼
  Cada pregunta:  ¿la resuelve un grep? ── sí ──► grep directo
                        │ no
                        ▼
                  vault/_INDICE.md → notas del módulo → graphify query → código por tramos
                                      │
  Al cerrar un cambio:  actualizar-vault (subagente aparte, no ocupa tu contexto)
  Al cambiar de fase:   /compact (Strategic Compact avisa del momento)
  Cada commit:          el grafo se rehace solo (sin IA)
```

| Memoria | Qué guarda | Coste de crearla | ¿En git? |
|---|---|---|---|
| `vault/` (Obsidian) | El **porqué**: decisiones, flujos, bugs, bitácora | Una sesión Sonnet en segundo plano | **No** |
| `graphify-out/` (Graphify) | El **qué depende de qué**: archivos, funciones, llamadas, tablas | **0 tokens** (análisis estático) | **No** |

Ambas se excluyen en `.git/info/exclude`: el repositorio compartido no cambia en nada.

---

## Instalación

**Requisitos:** Claude Code (probado con 2.1.273) con sesión iniciada. En Windows, además,
[Git for Windows](https://git-scm.com/downloads/win). Git, Node.js y uv los instala el kit
si faltan.

1. Descarga [`KIT-CLAUDE-CODE.md`](KIT-CLAUDE-CODE.md) (botón *Download raw file*).
2. Abre una terminal y ejecuta `claude`.
3. Escribe:

   > Lee `<ruta>/KIT-CLAUDE-CODE.md` y ejecuta su sección 2.

4. Claude muestra el plan, pide **una** confirmación, instala, verifica y entrega un informe.
5. Reinicia Claude Code y ábrelo dentro de un repositorio.

El documento lleva dentro todos los archivos del kit: un extractor los desempaqueta y
**verifica el sha256 de cada uno**. Lo externo (Graphify y Obsidian) se descarga de sus
fuentes oficiales. Funciona en **Windows, macOS y Linux**.

---

## Qué instala

| Pieza | Destino | Carga en cada sesión |
|---|---|---|
| Reglas de ahorro | `~/.claude/rules/kit-claude.md` | ~1.000 tokens |
| Skill `memoria-repo` (primer inicio) | `~/.claude/skills/` | solo nombre y descripción |
| Skill `actualizar-vault` (subagente aparte) | `~/.claude/skills/` | solo nombre y descripción |
| Skill + hook `strategic-compact` | `~/.claude/skills/`, `~/.claude/hooks/` | solo nombre y descripción |
| Hook de inicio de sesión | `~/.claude/hooks/inicio-repo.js` | una línea |
| Guardia de comandos destructivos | `~/.claude/hooks/guardia-destructiva.js` | 0 (no ocupa contexto) |
| [Graphify](https://github.com/Graphify-Labs/graphify) con soporte SQL | `uv tool` | 0 |
| [Obsidian](https://obsidian.md) | aplicación | 0 |
| CLI del kit | `~/.claude-kit/kit.mjs` | 0 |

**No toca** tu `~/.claude/CLAUDE.md`. En `~/.claude/settings.json` solo añade sus tres hooks
en grupos propios, con copia de seguridad.

---

## Las reglas que ahorran

| Situación | Qué hace Claude |
|---|---|
| La pregunta se resuelve con un grep o un glob | Lo hace directamente, **sin vault ni grafo** |
| Hay que entender un flujo, un impacto o una decisión | Vault → `graphify query --budget 1500` → código |
| Quién lee o escribe una tabla | grep (el grafo no modela SQL) |
| Archivos grandes | Grep y lectura solo del rango; nunca relee |
| Búsqueda realmente ancha | Subagente Sonnet; se queda con la conclusión |
| Pregunta acotada | **No** lanza subagentes (medido: multiplicaban el consumo) |
| Cambio de fase | `/compact` |
| Cambio significativo cerrado | `actualizar-vault` en un subagente aparte |

### Jornadas de 8 horas

1. **Una tarea, un contexto:** `/clear` o sesión nueva al pasar a una tarea independiente.
2. **Compacta al cambiar de fase** con `/compact` y una instrucción: *«conserva decisiones,
   archivos tocados y pendientes»*.
3. **Lo importante al vault**, no a la conversación.
4. **Subagentes solo para lo ancho.**
5. **Trabajo largo y aislado en segundo plano** (`claude --bg`).
6. **Tras una pausa larga, sesión nueva**: la caché de prompts puede haber caducado y
   reactivar un contexto enorme sale caro.
7. **Mide:** `/context` y `node "$HOME/.claude-kit/kit.mjs" coste`.

Detalle, jornada tipo y cuándo usar `--continue`: sección 5 del documento.

---

## Comandos del kit

```text
node "$HOME/.claude-kit/kit.mjs" comprobar          estado de la instalación
node "$HOME/.claude-kit/kit.mjs" coste              tokens fijos por sesión
node "$HOME/.claude-kit/kit.mjs" iniciar-repo .     prepara un repo (idempotente)
node "$HOME/.claude-kit/kit.mjs" lanzar . --modulo X   primer inicio en segundo plano
node "$HOME/.claude-kit/kit.mjs" omitir .           no usar el kit en ese repo
```

---

## Estructura del repositorio

| Archivo | Para qué |
|---|---|
| [`KIT-CLAUDE-CODE.md`](KIT-CLAUDE-CODE.md) | **Documento maestro autocontenido.** Es lo único que hay que entregar |
| [`docs/KIT-CLAUDE-CODE.fuente.md`](docs/KIT-CLAUDE-CODE.fuente.md) | Texto del documento sin el anexo de archivos: **se edita este** |
| [`kit.mjs`](kit.mjs) | CLI multiplataforma (Node ≥ 18, sin dependencias) |
| `instalar.ps1` · `instalar.sh` | Arranque: requisitos + instalación |
| `iniciar-repo.ps1` · `iniciar-repo.sh` | Preparar un repositorio |
| [`global/kit-claude.md`](global/kit-claude.md) | Reglas de ahorro |
| `skills/` | `memoria-repo`, `actualizar-vault`, `strategic-compact` |
| `hooks/` | Inicio de sesión, aviso de compactación, guardia |
| `plantillas/` | Vault 00–12, `.graphifyignore`, `.htaccess`, prompt del primer inicio |
| [`NOTICE.md`](NOTICE.md) | Licencias de terceros |

### Modificar el kit

```bash
# 1. Edita los archivos (y el texto en docs/KIT-CLAUDE-CODE.fuente.md)
# 2. Regenera el documento autocontenido
node kit.mjs empaquetar
# 3. Vuelve a medir
node kit.mjs coste
```

---

## Desinstalar

1. Borra `~/.claude/rules/kit-claude.md`, las carpetas `memoria-repo`, `actualizar-vault` y
   `strategic-compact` de `~/.claude/skills/`, y `~/.claude/hooks/{inicio-repo.js,guardia-destructiva.js,strategic-compact}`.
2. Quita de `~/.claude/settings.json` los tres hooks que apuntan a esos archivos (hay copia
   `settings.json.bak-*` de antes de instalar).
3. Borra `~/.claude-kit`.
4. En cada repositorio, si quieres: `vault/`, `graphify-out/`, `.graphifyignore`, el bloque
   `kit-claude` de `.git/info/exclude` y `graphify hook uninstall`.

---

## Créditos

- [Graphify](https://github.com/Graphify-Labs/graphify) — grafo de conocimiento del código.
- [Obsidian](https://obsidian.md) — visor y editor del vault.
- Strategic Compact de [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT) — ver [`NOTICE.md`](NOTICE.md).
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="global/kit-claude.md" sha256="46e4929bef6c475aa0cb3c5238e93ebe94e85b59b5ad1d8837540849ef93dc8f" -->
~~~~~~~~text
# Kit de ahorro de tokens — reglas siempre cargadas

Responde siempre en español. No edites este archivo (lo reemplaza cada actualización del
kit); lo personal va en `~/.claude/CLAUDE.md`. Cada regla sale de una medición real.

## Memoria del repositorio: vault + grafo

- Cada repo tiene, **solo en local y fuera de git**, `vault/` (Obsidian: por qué existe
  cada cosa, decisiones, bugs) y `graphify-out/` (grafo del código, sin IA).
- Si el hook de inicio dice **SIN INICIAR** → skill `memoria-repo` antes de nada.
- **El código real manda** sobre el vault y el grafo; si difieren, corrige la nota.

## Qué leer y en qué orden

1. **¿Se resuelve con un grep o un glob directo?** (dónde se usa X, qué archivos tocan Y)
   → hazlo **directamente**, sin vault ni grafo. Medido: consultarlos ahí costó +56 %.
2. **¿Hay que entender un flujo, una dependencia, un impacto o una decisión?**
   → `vault/_INDICE.md` y solo las notas del módulo → `graphify query "…" --budget 1500`
   (`affected` para impacto, `path` para caminos) → código. Medido: −44 % y −56 % de tokens.
3. El grafo **no modela SQL**: para saber quién lee o escribe una tabla, grep.
4. Lee **por tramos** (Grep y luego el rango), no releas lo ya leído y lanza en paralelo
   las lecturas independientes.

## Subagentes y modelos

- Delega en un subagente **Sonnet** solo las búsquedas realmente anchas, y quédate con la
  conclusión. **No delegues lo que resuelves en 2–3 llamadas**: medido, lanzar
  subagentes para una pregunta acotada multiplicó el consumo (2,4 M frente a 1,3 M).
- Opus para decidir; Sonnet para lo mecánico y para mantener el vault.

## Contexto

- Lo leído se queda en el contexto: **compacta al cambiar de fase** (investigar →
  implementar → verificar). El hook de Strategic Compact avisa del momento.
- Al cerrar un cambio **significativo** (archivo, endpoint o tabla nuevos, cambio de flujo o
  permiso, decisión, bug con causa no obvia) → skill `actualizar-vault` con el resumen como
  argumento: corre en un subagente aparte y no ocupa esta conversación.
- No enciendas plugins ni skills con carga fija sin medirla (`claude plugin details <id>`,
  `node "$HOME/.claude-kit/kit.mjs" coste`).

## Seguridad

La guardia de comandos destructivos no se esquiva: si bloquea algo legítimo, lo ejecuta
el usuario.
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="hooks/guardia-destructiva.js" sha256="1070658f52e748cc823c880def3d8f8f8a38ccd0f119f6d534dd50bc7c743e72" -->
~~~~~~~~text
#!/usr/bin/env node
// Guardia global (PreToolUse) contra acciones destructivas o irreversibles.
//   deny -> se bloquea; si hace falta de verdad, que lo ejecute el usuario con `!`.
//   ask  -> Claude Code pide confirmación antes de ejecutar.
// Ante una entrada ilegible deja pasar: una guardia rota no puede paralizar la sesión.
'use strict';

const path = require('path');

const ENV_PROTEGIDO = /^\.env(\.[\w-]+)*$/i;
// Plantillas y copias: no son el .env que lee la aplicación.
const ENV_NO_VIVO = /\.(example|sample|dist|template|tpl|bak|backup|old|orig)$/i;
const CLIENTE_SQL = /\b(mysql|mariadb|psql|sqlite3?)(\.exe)?\s|\bphp(\.exe)?\s+-r\b/i;
// Bases desechables de ensayo (p. ej. un gate de migraciones que hace DROP DATABASE IF EXISTS ensayo_gate).
const BASE_DESECHABLE = /^[`"]?ensayo_\w+[`"]?$/i;

const BLOQUEAR = [
  [/\bdocker(\.exe)?\s+(system|volume)\s+prune\b/i,
    'borra recursos de Docker en bloque, volúmenes incluidos: con ellos se van las bases de datos locales'],
  [/\bdocker(\.exe)?\s+volume\s+(rm|remove)\b/i,
    'borra un volumen de Docker; si es el de MySQL, la base desaparece'],
  [/\bdocker(\.exe)?[\s-]+compose\b[^|;&\n]*\bdown\b[^|;&\n]*\s(-v|--volumes)\b/i,
    '`down -v` borra los volúmenes del proyecto, es decir, la base de datos'],
];

const BORRADO = /\b(rm|remove-item|ri|del|rmdir|rd)\b/i;

const CONFIRMAR = [
  [/\brm\s+([^|;&\n]*\s)?-(?!-)(?!force\b|recurse\b)(?=[a-z]*r)(?=[a-z]*f)[a-z]+\b/i,
    'borrado recursivo forzado'],
  [new RegExp(BORRADO.source + /(?=[^|;&\n]*\s(-r|-recurse|--recursive)\b)(?=[^|;&\n]*\s(-f|-fo|-force|--force)\b)/.source, 'i'),
    'borrado recursivo forzado'],
  [/\b(rd|rmdir|del)\b[^|;&\n]*\s\/s\b/i, 'borrado recursivo'],
  [/\bgit\s+reset\b[^|;&\n]*\s--hard\b/i,
    'descarta los cambios sin commit, también los de otras sesiones en el mismo árbol'],
  [/\bgit\s+push\b[^|;&\n]*\s(--force(-with-lease)?|-f)\b/i, 'reescribe la historia remota'],
  [/\bgit\s+clean\b[^|;&\n]*\s-\w*f/i, 'borra los archivos sin seguimiento'],
  [/\bgit\s+(checkout\s+(--\s+)?|restore\s+)\.(?=\s|$|[;&|])/i, 'descarta todos los cambios del árbol'],
];

function esEnvProtegido(ruta) {
  const base = path.basename(String(ruta).replace(/["'`]/g, ''));
  return ENV_PROTEGIDO.test(base) && !ENV_NO_VIVO.test(base);
}

function revisarSql(cmd) {
  if (!CLIENTE_SQL.test(cmd)) return null;
  for (const m of cmd.matchAll(/\bdrop\s+(database|schema|table)\s+(?:if\s+exists\s+)?([`"\w.$-]+)/gi)) {
    if (/^(database|schema)$/i.test(m[1]) && BASE_DESECHABLE.test(m[2])) continue;
    return `\`DROP ${m[1].toUpperCase()} ${m[2]}\` borra datos sin vuelta atrás`;
  }
  if (/\btruncate\s+(table\s+)?[`"\w]/i.test(cmd)) return '`TRUNCATE` vacía la tabla sin vuelta atrás';
  return null;
}

function escribeEnv(cmd) {
  const destinos = [];
  for (const m of cmd.matchAll(/(?:\d?>>?|\|\s*tee(?:\s+-a)?)\s*([^\s|;&<>]+)/g)) destinos.push(m[1]);
  for (const m of cmd.matchAll(/\b(?:set-content|add-content|out-file|clear-content)\b[^|;&\n]*?\s(?:-(?:path|literalpath|filepath)\s+)?([^\s|;&-][^\s|;&]*)/gi)) {
    destinos.push(m[1]);
  }
  for (const tramo of cmd.split(/[|;&\n]/)) {
    const palabras = tramo.trim().split(/\s+/);
    if (/^(cp|mv|copy|move|copy-item|move-item)$/i.test(palabras[0]) && palabras.length > 2) {
      destinos.push(palabras[palabras.length - 1]);
    }
    if (/^sed$/i.test(palabras[0]) && palabras.some(p => /^-i/.test(p))) destinos.push(...palabras.slice(1));
  }
  return destinos.some(esEnvProtegido);
}

function decidir(evento) {
  const herramienta = evento.tool_name || '';
  const entrada = evento.tool_input || {};

  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(herramienta)) {
    const ruta = entrada.file_path || entrada.notebook_path || '';
    if (esEnvProtegido(ruta)) {
      return ['deny', `\`${path.basename(ruta)}\` guarda secretos y configuración del entorno; no se edita desde Claude`];
    }
    return null;
  }

  if (!/^(Bash|PowerShell)$/.test(herramienta)) return null;
  const cmd = String(entrada.command || '');

  for (const [patron, motivo] of BLOQUEAR) if (patron.test(cmd)) return ['deny', motivo];
  const sql = revisarSql(cmd);
  if (sql) return ['deny', sql];
  if (escribeEnv(cmd)) return ['deny', 'el comando escribe en un `.env`, que guarda secretos y configuración del entorno'];
  for (const [patron, motivo] of CONFIRMAR) if (patron.test(cmd)) return ['ask', motivo];
  return null;
}

let crudo = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', trozo => { crudo += trozo; });
process.stdin.on('end', () => {
  let decision;
  try {
    decision = decidir(JSON.parse(crudo));
  } catch {
    process.exit(0);
  }
  if (!decision) process.exit(0);

  const [permiso, motivo] = decision;
  const razon = permiso === 'deny'
    ? `Guardia global: ${motivo}. Si de verdad hace falta, pide al usuario que lo ejecute él con \`!\`.`
    : `Guardia global: ${motivo}. Confirma solo si es lo que quieres.`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: permiso,
      permissionDecisionReason: razon,
    },
  }));
  process.exit(0);
});
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="hooks/inicio-repo.js" sha256="6f9429b9430d2cb4e5fff62e2edaa3e9dab4f8614200f5b4ef3065144688a629" -->
~~~~~~~~text
#!/usr/bin/env node
// kit-claude · SessionStart: informa del estado del vault y del grafo del repositorio abierto.
// Barato a propósito (sin git ni red): solo lee unos pocos archivos. Ante cualquier error, calla:
// un hook roto no puede estorbar el inicio de la sesión.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function raizRepo(desde) {
  let dir = path.resolve(desde);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const padre = path.dirname(dir);
    if (padre === dir) return null;
    dir = padre;
  }
}

// En un worktree o submódulo `.git` es un archivo "gitdir: <ruta>".
function dirGit(repo) {
  const punto = path.join(repo, '.git');
  try {
    if (fs.statSync(punto).isDirectory()) return punto;
    const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(punto, 'utf8'));
    return m ? path.resolve(repo, m[1].trim()) : null;
  } catch { return null; }
}

function mtime(ruta) {
  try { return fs.statSync(ruta).mtimeMs; } catch { return 0; }
}

function mensaje(cwd) {
  const repo = raizRepo(cwd);
  // Un repositorio de dotfiles en la carpeta personal no es un proyecto.
  if (!repo || path.resolve(repo) === path.resolve(os.homedir())) return null;
  const git = dirGit(repo);
  if (git && fs.existsSync(path.join(git, 'kit-claude-omitir'))) return null;

  const nombre = path.basename(repo);
  const kitJson = path.join(repo, 'vault', '_kit.json');
  if (!fs.existsSync(kitJson)) {
    return `kit-claude: repo "${nombre}" SIN INICIAR. Antes de nada: skill \`memoria-repo\` (Primer inicio).`;
  }

  let kit = {};
  try { kit = JSON.parse(fs.readFileSync(kitJson, 'utf8')); } catch { /* estado ilegible: se informa igual */ }

  // Mensajes mínimos: el orden de lectura ya está en el núcleo de reglas; aquí solo el estado y lo accionable.
  const partes = [`kit-claude: repo "${nombre}".`];
  const modulo = kit.modulo_inicial || '?';
  if (kit.primer_inicio === 'en_curso') {
    const horas = (Date.now() - Date.parse(kit.lanzado || 0)) / 36e5;
    partes.push(horas > 3
      ? `Primer inicio (${modulo}) >3 h "en curso": ¿se detuvo? \`claude agents\`; si no está, repetir \`kit.mjs lanzar\`.`
      : `Primer inicio EN CURSO en segundo plano (${modulo}); si eres esa sesión, ignora esto.`);
  } else if (kit.primer_inicio === 'fallo_al_lanzar') {
    partes.push('El primer inicio falló al lanzarse: repetir `kit.mjs lanzar` (skill `memoria-repo`).');
  }

  const tGrafo = mtime(path.join(repo, 'graphify-out', 'graph.json'));
  if (!tGrafo) {
    partes.push('Sin grafo todavía: usa Grep.');
  } else {
    // HEAD cambia de fecha en cada commit, checkout o pull: si es más nuevo que el grafo, está desfasado.
    const tHead = git ? Math.max(mtime(path.join(git, 'logs', 'HEAD')), mtime(path.join(git, 'HEAD'))) : 0;
    partes.push((tHead - tGrafo) / 36e5 > 1 ? 'Grafo DESFASADO: `graphify update .` antes de usarlo.' : 'Vault y grafo listos.');
  }
  return partes.join(' ');
}

let crudo = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', t => { crudo += t; });
process.stdin.on('end', () => {
  try {
    const evento = crudo ? JSON.parse(crudo) : {};
    const texto = mensaje(evento.cwd || process.cwd());
    if (texto) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: texto },
      }));
    }
  } catch { /* silencio */ }
  process.exit(0);
});
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="hooks/strategic-compact/hooks/suggest-compact.js" sha256="e031a96b7d05b689a457eb4c2c02dd8e1171cd5e68633f30b60a3f0f6ce4471a" -->
~~~~~~~~text
#!/usr/bin/env node
/**
 * Strategic Compact Suggester
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs on PreToolUse or periodically to suggest manual compaction at logical intervals
 *
 * Why manual over auto-compact:
 * - Auto-compact happens at arbitrary points, often mid-task
 * - Strategic compacting preserves context through logical phases
 * - Compact after exploration, before execution
 * - Compact after completing a milestone, before starting next
 *
 * Two signals (#2155):
 * - Tool-call count: first at COMPACT_THRESHOLD (default 50), then every 25.
 * - Context size (primary): the latest assistant `usage` record from the
 *   session transcript, compared against a window-scaled token threshold
 *   (COMPACT_CONTEXT_THRESHOLD; default 160k on a 200k window, 250k on 1M),
 *   re-reminding after every COMPACT_CONTEXT_INTERVAL tokens of growth
 *   (default 60k). Tool count is a weak proxy for window pressure — a few
 *   large reads can fill the window in very few calls, and many tiny calls
 *   can cross 50 while the window is barely used.
 */

const fs = require('fs');
const path = require('path');
const {
  getTempDir,
  writeFile,
  readStdinJson,
  log,
  output
} = require('../lib/utils');
const {
  readLatestContextTokens,
  resolveContextWindow,
  resolveContextThreshold,
  resolveContextInterval,
  computeContextBucket,
  formatWindowLabel
} = require('../lib/transcript-context');

const COUNTER_FILE_PREFIX = 'claude-tool-count-';
const CONTEXT_BUCKET_FILE_PREFIX = 'claude-context-bucket-';
const STATE_FILE_PREFIXES = [COUNTER_FILE_PREFIX, CONTEXT_BUCKET_FILE_PREFIX];
const DEFAULT_COMPACT_STATE_TTL_DAYS = 14;

function getCounterRetentionDays() {
  const raw = process.env.COMPACT_STATE_TTL_DAYS;
  if (!raw) return DEFAULT_COMPACT_STATE_TTL_DAYS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_COMPACT_STATE_TTL_DAYS;
}

/**
 * Sweep stale per-session state files from the temp dir.
 *
 * Each session writes `claude-tool-count-<sessionId>` (and, with the context
 * signal, `claude-context-bucket-<sessionId>`) into the OS temp dir; nothing
 * else removes them. Without a sweep these files accumulate one-per-session
 * forever. This helper removes state files whose mtime is older than
 * `retentionDays`, while preserving the active session's files (which are
 * about to be re-written by the caller).
 *
 * The helper never throws; per the always-exit-0 hook contract any
 * filesystem failure is swallowed and logged to stderr.
 *
 * @param {string} tempDir - The temp directory to sweep.
 * @param {number} retentionDays - Files older than this many days are removed.
 * @param {string[]} currentStateFiles - Absolute paths of the active session's
 *   state files; preserved unconditionally.
 */
function cleanupOldCounters(tempDir, retentionDays, currentStateFiles) {
  let entries;
  try {
    entries = fs.readdirSync(tempDir, { withFileTypes: true });
  } catch (err) {
    log(`[StrategicCompact] Skipping counter sweep; readdir failed: ${err.message}`);
    return;
  }

  const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const currentBasenames = new Set(currentStateFiles.map(filePath => path.basename(filePath)));

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!STATE_FILE_PREFIXES.some(prefix => entry.name.startsWith(prefix))) continue;
    if (currentBasenames.has(entry.name)) continue;

    const fullPath = path.join(tempDir, entry.name);
    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch {
      continue;
    }

    // Strict "older than" semantics per the docstring: a file whose mtime
    // sits exactly on the cutoff boundary has age == retentionDays, which
    // is not *older than* retentionDays, so preserve it. Use >= so only
    // strictly older files (mtimeMs < cutoffMs) fall through to deletion.
    if (stats.mtimeMs >= cutoffMs) continue;

    try {
      fs.rmSync(fullPath, { force: true });
    } catch (err) {
      log(`[StrategicCompact] Warning: failed to prune stale counter ${fullPath}: ${err.message}`);
    }
  }
}

/**
 * Increment and persist the per-session tool-call counter.
 * Uses fd-based read+write to reduce (but not eliminate) the race window
 * between concurrent hook invocations.
 */
function incrementToolCallCount(counterFile) {
  let count = 1;

  try {
    const fd = fs.openSync(counterFile, 'a+');
    try {
      const buf = Buffer.alloc(64);
      const bytesRead = fs.readSync(fd, buf, 0, 64, 0);
      if (bytesRead > 0) {
        const parsed = parseInt(buf.toString('utf8', 0, bytesRead).trim(), 10);
        // Clamp to reasonable range — corrupted files could contain huge values
        // that pass Number.isFinite() (e.g., parseInt('9'.repeat(30)) => 1e+29)
        count = (Number.isFinite(parsed) && parsed > 0 && parsed <= 1000000)
          ? parsed + 1
          : 1;
      }
      // Truncate and write new value
      fs.ftruncateSync(fd, 0);
      fs.writeSync(fd, String(count), 0);
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    // Fallback: just use writeFile if fd operations fail
    writeFile(counterFile, String(count));
  }

  return count;
}

/**
 * Read the last context bucket this session already fired for (-1 when the
 * suggestion has not fired yet or the state file is unreadable/corrupted).
 */
function readLastContextBucket(bucketFile) {
  try {
    const parsed = parseInt(fs.readFileSync(bucketFile, 'utf8').trim(), 10);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 1000000 ? parsed : -1;
  } catch {
    return -1;
  }
}

/**
 * Build the context-size suggestion when the transcript shows the session has
 * crossed into a new context bucket. Returns null when the signal is silent
 * (no transcript, below threshold, disabled, or already fired for the bucket).
 *
 * Never throws — any transcript or state-file failure silently disables the
 * signal so the hook keeps its always-exit-0 contract.
 */
function buildContextSuggestion(transcriptPath, bucketFile, env) {
  try {
    const usage = readLatestContextTokens(transcriptPath);
    if (!usage) return null;

    const { windowTokens, inferred } = resolveContextWindow(usage.tokens, usage.model);
    const threshold = resolveContextThreshold(env, windowTokens);
    if (threshold <= 0) return null; // COMPACT_CONTEXT_THRESHOLD=0 disables

    const interval = resolveContextInterval(env);
    const bucket = computeContextBucket(usage.tokens, threshold, interval);
    if (bucket < 0) return null;

    const lastBucket = readLastContextBucket(bucketFile);
    if (bucket <= lastBucket) return null;

    writeFile(bucketFile, String(bucket));

    const approxTokens = `${Math.round(usage.tokens / 1000)}k`;
    // Only quote a percentage when the window size was actually detected.
    // Against an assumed 200k default the denominator is a guess, and a
    // "97% of 200k window" line on a 1M session triggers needless compaction.
    const scale = inferred
      ? ''
      : ` (${Math.round((usage.tokens / windowTokens) * 100)}% of ${formatWindowLabel(windowTokens)} window)`;
    return `[StrategicCompact] Context ~${approxTokens} tokens${scale} - consider /compact at the next logical boundary`;
  } catch (err) {
    log(`[StrategicCompact] Context signal skipped: ${err.message}`);
    return null;
  }
}

async function main() {
  // Claude Code passes hook input via stdin JSON; session_id is the
  // canonical field (legacy env var, then 'default', as fallbacks) and
  // transcript_path points at the session transcript JSONL used by the
  // context-size signal.
  let input = {};
  try {
    input = await readStdinJson({ timeoutMs: 1000 });
  } catch {
    input = {};
  }

  const rawSessionId = (input && typeof input.session_id === 'string' && input.session_id)
    ? input.session_id
    : (process.env.CLAUDE_SESSION_ID || 'default');
  const sessionId = rawSessionId.replace(/[^a-zA-Z0-9_-]/g, '') || 'default';
  const transcriptPath = (input && typeof input.transcript_path === 'string') ? input.transcript_path : '';

  const tempDir = getTempDir();
  const counterFile = path.join(tempDir, `${COUNTER_FILE_PREFIX}${sessionId}`);
  const bucketFile = path.join(tempDir, `${CONTEXT_BUCKET_FILE_PREFIX}${sessionId}`);

  // Sweep stale state files (concern 1 of #2156). Cheap, swallows errors,
  // skips the active session's files. See cleanupOldCounters for details.
  cleanupOldCounters(tempDir, getCounterRetentionDays(), [counterFile, bucketFile]);

  const rawThreshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);
  const threshold = Number.isFinite(rawThreshold) && rawThreshold > 0 && rawThreshold <= 10000
    ? rawThreshold
    : 50;

  const count = incrementToolCallCount(counterFile);

  const messages = [];

  // Primary signal (#2155): real context size from the transcript's latest
  // usage record. Fires at a window-scaled token threshold and re-fires only
  // after the context grows by another interval step.
  const contextSuggestion = buildContextSuggestion(transcriptPath, bucketFile, process.env);
  if (contextSuggestion) {
    messages.push(contextSuggestion);
  }

  // Secondary signal: tool-call count at threshold, then every 25 calls.
  if (count === threshold) {
    messages.push(`[StrategicCompact] ${threshold} tool calls reached - consider /compact if transitioning phases`);
  } else if (count > threshold && (count - threshold) % 25 === 0) {
    messages.push(`[StrategicCompact] ${count} tool calls - good checkpoint for /compact if context is stale`);
  }

  // log() writes to stderr (debug log). Per the Claude Code hooks guide,
  // non-blocking PreToolUse stderr (exit 0) is only written to the debug log;
  // it does not reach the model. To inject a user-facing suggestion without
  // blocking the tool call, emit structured JSON to stdout with
  // hookSpecificOutput.additionalContext — the documented mechanism for
  // PreToolUse hooks to add context to the next model turn. Hooks must emit
  // at most one stdout JSON payload per run, so both signals share it.
  if (messages.length > 0) {
    for (const msg of messages) {
      log(msg);
    }
    output({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: messages.join('\n')
      }
    });
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[StrategicCompact] Error:', err.message);
  process.exit(0);
});
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="hooks/strategic-compact/lib/transcript-context.js" sha256="38f399260f79904bc8a97448d1dff965aaf0f04596143ce344fdbf64747bf0a2" -->
~~~~~~~~text
/**
 * Transcript context-size helpers for the strategic-compact hook (#2155).
 *
 * Reads the latest assistant `usage` record from a Claude Code session
 * transcript (JSONL) and derives a context-size signal:
 *
 * - `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`
 *   partition the prompt, so their sum is the true context size of the turn.
 * - The context window is detected from the model id (`[1m]` marker) or from
 *   the observed token count (anything above 200k implies a 1M window even
 *   when logs drop the suffix).
 * - Thresholds are window-scaled and env-overridable; re-reminders fire in
 *   fixed token "buckets" above the threshold so the suggestion only repeats
 *   after real context growth.
 *
 * Only the tail of the transcript is read (latest records live at the end),
 * keeping the PreToolUse hook fast even for very large sessions.
 */

const fs = require('fs');

const STANDARD_CONTEXT_WINDOW_TOKENS = 200000;
const LARGE_CONTEXT_WINDOW_TOKENS = 1000000;
const DEFAULT_CONTEXT_THRESHOLD_STANDARD = 160000;
const DEFAULT_CONTEXT_THRESHOLD_LARGE = 250000;
const DEFAULT_CONTEXT_INTERVAL_TOKENS = 60000;
const DEFAULT_TRANSCRIPT_TAIL_BYTES = 256 * 1024;
const MAX_TOKEN_SETTING = 10000000;
const LARGE_WINDOW_MODEL_MARKER = '[1m]';

// Known large-window model families whose ids carry no `[1m]` marker (#2461).
// Matched boundary-aware against the model id — covers dated/region-prefixed
// variants (e.g. `us.anthropic.claude-fable-5-20260115-v1:0`) without matching
// hypothetical smaller tiers sharing the prefix (e.g. `claude-fable-5-mini`).
// Checked in order, first match wins. Best-effort and expected to lag new
// releases; the env override remains the escape hatch for unlisted models.
const KNOWN_MODEL_WINDOW_TOKENS = [
  ['claude-opus-5', LARGE_CONTEXT_WINDOW_TOKENS],
  ['claude-fable-5', LARGE_CONTEXT_WINDOW_TOKENS],
  ['claude-mythos-5', LARGE_CONTEXT_WINDOW_TOKENS]
];

/**
 * True when `model` contains `familyId` ending at a token boundary: end of id,
 * a delimiter (`[`, `:`, `.`), or a dated/versioned suffix (`-20260115`).
 * Alphanumeric continuations and letter suffixes (`-mini`) are different
 * models, possibly with smaller windows, and must not match.
 */
function isKnownModelFamilyMatch(model, familyId) {
  const start = model.indexOf(familyId);
  if (start === -1) {
    return false;
  }
  const rest = model.slice(start + familyId.length);
  return !/^[A-Za-z0-9]/.test(rest) && !/^-[A-Za-z]/.test(rest);
}

/**
 * Read the trailing `tailBytes` of a file as UTF-8.
 * Returns null when the file is missing or unreadable.
 */
function readFileTail(filePath, tailBytes) {
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
  } catch {
    return null;
  }

  try {
    const size = fs.fstatSync(fd).size;
    const start = Math.max(0, size - tailBytes);
    const length = size - start;
    if (length <= 0) {
      return { text: '', truncated: false };
    }

    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, start);
    return {
      text: buffer.toString('utf8', 0, bytesRead),
      truncated: start > 0
    };
  } catch {
    return null;
  } finally {
    try {
      fs.closeSync(fd);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Extract the context token total from a transcript record's usage block.
 * Returns 0 when the record carries no usable usage data.
 */
function extractUsageTokens(record) {
  const usage = record && record.message && record.message.usage;
  if (!usage || typeof usage !== 'object') {
    return 0;
  }

  const total =
    (Number.isFinite(usage.input_tokens) ? usage.input_tokens : 0) +
    (Number.isFinite(usage.cache_read_input_tokens) ? usage.cache_read_input_tokens : 0) +
    (Number.isFinite(usage.cache_creation_input_tokens) ? usage.cache_creation_input_tokens : 0);

  return total > 0 ? total : 0;
}

/**
 * Scan a session transcript (JSONL) backwards for the most recent record with
 * a non-empty `message.usage` block.
 *
 * @param {string} transcriptPath - Absolute path to the transcript JSONL.
 * @param {object} [options]
 * @param {number} [options.tailBytes] - How many trailing bytes to scan.
 * @returns {{ tokens: number, model: string } | null} Latest context size, or
 *   null when the transcript is missing, unreadable, or has no usage records.
 */
function readLatestContextTokens(transcriptPath, options = {}) {
  if (typeof transcriptPath !== 'string' || !transcriptPath) {
    return null;
  }

  const tailBytes = Number.isInteger(options.tailBytes) && options.tailBytes > 0 ? options.tailBytes : DEFAULT_TRANSCRIPT_TAIL_BYTES;

  const tail = readFileTail(transcriptPath, tailBytes);
  if (!tail) {
    return null;
  }

  const lines = tail.text.split('\n');
  // The first line of a truncated tail is almost certainly partial JSON.
  const firstLine = tail.truncated ? 1 : 0;

  for (let i = lines.length - 1; i >= firstLine; i--) {
    const line = lines[i].trim();
    if (!line) continue;

    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }

    const tokens = extractUsageTokens(record);
    if (tokens > 0) {
      const model = record.message && typeof record.message.model === 'string' ? record.message.model : '';
      return { tokens, model };
    }
  }

  return null;
}

/**
 * Detect the context window size for a turn, and report whether that size was
 * positively detected or merely assumed.
 *
 * `inferred: false` means the size came from evidence — an explicit env
 * override, the `[1m]` marker, or a known large-window family. An observed
 * token count above the standard window selects the safer large-window
 * thresholds, but remains inferred because the true denominator could be an
 * unmarked intermediate size such as 400k. Callers must not present inferred
 * windows as fact.
 *
 * @returns {{ windowTokens: number, inferred: boolean }}
 */
function resolveContextWindow(tokens, model) {
  // Explicit window override wins: 400k models (e.g. Opus 4.x) match neither the
  // 200k default nor the 1M marker and would otherwise report ~double usage (#2290).
  // Honor ECC's own knob and Claude Code's native CLAUDE_CODE_AUTO_COMPACT_WINDOW.
  const env = (typeof process !== 'undefined' && process.env) || {};
  const envWindow = Number.parseInt(env.ECC_CONTEXT_WINDOW_TOKENS || env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '', 10);
  if (Number.isInteger(envWindow) && envWindow > 0) {
    return { windowTokens: envWindow, inferred: false };
  }

  if (typeof model === 'string' && model.includes(LARGE_WINDOW_MODEL_MARKER)) {
    return { windowTokens: LARGE_CONTEXT_WINDOW_TOKENS, inferred: false };
  }

  // Large-window model families without a [1m] marker fall through the checks
  // above and would be misreported against the 200k default (#2461).
  if (typeof model === 'string') {
    const known = KNOWN_MODEL_WINDOW_TOKENS.find(([familyId]) => isKnownModelFamilyMatch(model, familyId));
    if (known) {
      return { windowTokens: known[1], inferred: false };
    }
  }

  if (Number.isFinite(tokens) && tokens > STANDARD_CONTEXT_WINDOW_TOKENS) {
    return { windowTokens: LARGE_CONTEXT_WINDOW_TOKENS, inferred: true };
  }

  return { windowTokens: STANDARD_CONTEXT_WINDOW_TOKENS, inferred: true };
}

/**
 * Detect the context window size for a turn.
 * 1M when the model id carries the `[1m]` marker, matches a known large-window
 * model family, or when the observed token count already exceeds the standard
 * 200k window (covers logs that drop the suffix); otherwise the standard 200k
 * window.
 */
function resolveContextWindowTokens(tokens, model) {
  return resolveContextWindow(tokens, model).windowTokens;
}

/**
 * True when the resolved window is the assumed 200k default rather than a
 * detected size. Opt-in large-window models that ship no `[1m]` marker in the
 * transcript (e.g. a 1M-context Opus tier, where the base tier is 200k and the
 * two are indistinguishable by model id) land here, so a percentage computed
 * against 200k can be wildly wrong while usage sits below that mark.
 */
function isContextWindowInferred(tokens, model) {
  return resolveContextWindow(tokens, model).inferred;
}

/**
 * Resolve the context-size suggestion threshold (tokens).
 * `COMPACT_CONTEXT_THRESHOLD=0` disables the context signal entirely;
 * other invalid values fall back to the window-scaled default.
 */
function resolveContextThreshold(env, windowTokens) {
  const raw = env && env.COMPACT_CONTEXT_THRESHOLD;
  if (raw !== undefined && raw !== null && raw !== '') {
    const parsed = Number.parseInt(raw, 10);
    if (parsed === 0) {
      return 0;
    }
    if (Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_TOKEN_SETTING) {
      return parsed;
    }
  }

  return windowTokens >= LARGE_CONTEXT_WINDOW_TOKENS ? DEFAULT_CONTEXT_THRESHOLD_LARGE : DEFAULT_CONTEXT_THRESHOLD_STANDARD;
}

/**
 * Resolve the re-reminder step (tokens of additional context growth before
 * the suggestion repeats). Invalid values fall back to the default.
 */
function resolveContextInterval(env) {
  const raw = env && env.COMPACT_CONTEXT_INTERVAL;
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_TOKEN_SETTING ? parsed : DEFAULT_CONTEXT_INTERVAL_TOKENS;
}

/**
 * Map a context size onto a suggestion bucket.
 * Returns -1 below the threshold; bucket 0 at the threshold; +1 for every
 * `interval` tokens of growth beyond it. The hook fires only when the bucket
 * rises above the last bucket it already fired for.
 */
function computeContextBucket(tokens, threshold, interval) {
  if (!Number.isFinite(tokens) || threshold <= 0 || tokens < threshold) {
    return -1;
  }

  const step = Number.isInteger(interval) && interval > 0 ? interval : DEFAULT_CONTEXT_INTERVAL_TOKENS;
  return Math.floor((tokens - threshold) / step);
}

/**
 * Human-readable label for a context window size (e.g. "200k", "1M").
 */
function formatWindowLabel(windowTokens) {
  return windowTokens >= LARGE_CONTEXT_WINDOW_TOKENS ? '1M' : `${Math.round(windowTokens / 1000)}k`;
}

module.exports = {
  STANDARD_CONTEXT_WINDOW_TOKENS,
  LARGE_CONTEXT_WINDOW_TOKENS,
  DEFAULT_CONTEXT_THRESHOLD_STANDARD,
  DEFAULT_CONTEXT_THRESHOLD_LARGE,
  DEFAULT_CONTEXT_INTERVAL_TOKENS,
  DEFAULT_TRANSCRIPT_TAIL_BYTES,
  readLatestContextTokens,
  resolveContextWindow,
  resolveContextWindowTokens,
  isContextWindowInferred,
  resolveContextThreshold,
  resolveContextInterval,
  computeContextBucket,
  formatWindowLabel
};
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="hooks/strategic-compact/lib/utils.js" sha256="c9ea4adf5b3ad59f64c1350521011d287b090a2a2953c0975e740c14f6aa1a1e" -->
~~~~~~~~text
// Sustituto reducido de scripts/lib/utils.js de everything-claude-code (affaan-m).
// suggest-compact.js solo usa estas cinco funciones; el original arrastra
// agent-data-home, path-safety y utilidades con execSync que este hook no necesita.
// Lógica copiada tal cual del original (15 sep 2026).
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function getTempDir() {
  return os.tmpdir();
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function readStdinJson(options = {}) {
  const { timeoutMs = 5000, maxSize = 1024 * 1024 } = options;

  return new Promise(resolve => {
    let data = '';
    let settled = false;
    let overflowed = false;

    const terminar = () => {
      if (overflowed) return {};
      try {
        return data.trim() ? JSON.parse(data) : {};
      } catch {
        return {};
      }
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      process.stdin.removeAllListeners('data');
      process.stdin.removeAllListeners('end');
      process.stdin.removeAllListeners('error');
      if (process.stdin.unref) process.stdin.unref();
      resolve(terminar());
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (settled || overflowed) return;
      if (data.length + chunk.length > maxSize) {
        overflowed = true;
        data = '';
        return;
      }
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      resolve(terminar());
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      resolve({});
    });
  });
}

function log(message) {
  console.error(message);
}

function output(data) {
  console.log(typeof data === 'object' ? JSON.stringify(data) : data);
}

module.exports = { getTempDir, writeFile, readStdinJson, log, output };
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="iniciar-repo.ps1" sha256="7cf12c30ae97369f5f3723db956a997dfe3daa8935de03b8310210f9b3951816" bom crlf -->
~~~~~~~~text
# kit-claude — prepara un repositorio (Windows). Equivale a: node kit.mjs iniciar-repo <ruta>
# Uso:  powershell -ExecutionPolicy Bypass -File iniciar-repo.ps1 [ruta] [--sin-obsidian] [--sin-hook]
& node "$PSScriptRoot\kit.mjs" iniciar-repo @args
exit $LASTEXITCODE
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="iniciar-repo.sh" sha256="4e565bfef4051e43f99600eb9942b7a11bf8e3ff77fbb2064ebb17d2542e036c" -->
~~~~~~~~text
#!/usr/bin/env bash
# kit-claude — prepara un repositorio (macOS/Linux). Equivale a: node kit.mjs iniciar-repo <ruta>
# Uso:  bash iniciar-repo.sh [ruta] [--sin-obsidian] [--sin-hook]
exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/kit.mjs" iniciar-repo "$@"
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="instalar.ps1" sha256="19e4166407ad4eb64dba957cb89aa587c853b127af0a45ce2fcc880d6b6c5c9e" bom crlf -->
~~~~~~~~text
# kit-claude — arranque en Windows (PowerShell 5.1 o 7+).
# Comprueba e instala los requisitos (Git for Windows, Node.js LTS, uv) con winget y delega el resto en kit.mjs.
# Idempotente: se puede repetir. Uso:
#   powershell -NoProfile -ExecutionPolicy Bypass -File instalar.ps1 [-SoloComprobar] [-SinOpcionales]
# Git y Node se instalan para toda la máquina: Windows mostrará la ventana de permisos (UAC) y hay que aceptarla.
param(
    [switch]$SoloComprobar,
    [switch]$SinOpcionales
)
# 'Continue' a propósito: con 'Stop', PowerShell 5.1 aborta cuando un programa externo escribe en stderr.
$ErrorActionPreference = 'Continue'
$kit = $PSScriptRoot

function Test-Comando($nombre) { [bool](Get-Command $nombre -ErrorAction SilentlyContinue) }

function Update-RutaSesion {
    # winget añade al PATH del sistema, no al de esta sesión.
    $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}

$requisitos = @(
    @{ Comando = 'git';  Id = 'Git.Git' },
    @{ Comando = 'node'; Id = 'OpenJS.NodeJS.LTS' },
    @{ Comando = 'uv';   Id = 'astral-sh.uv' }
)

$instalados = @()
$faltan = @($requisitos | Where-Object { -not (Test-Comando $_.Comando) })
if ($faltan.Count -and -not $SoloComprobar) {
    if (-not (Test-Comando 'winget')) {
        Write-Host "FALTA winget (App Installer de Microsoft Store). Instálalo y repite." -ForegroundColor Red
        exit 1
    }
    foreach ($r in $faltan) {
        Write-Host "Instalando $($r.Comando) ($($r.Id)). Si Windows pide permiso, acéptalo..."
        winget install -e --id $r.Id --silent --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -ne 0) { Write-Host "winget no pudo instalar $($r.Id) (código $LASTEXITCODE)." -ForegroundColor Red; exit 1 }
        $instalados += $r.Comando
    }
    Update-RutaSesion
}

$sigueFaltando = @($requisitos | Where-Object { -not (Test-Comando $_.Comando) } | ForEach-Object { $_.Comando })
if (-not (Test-Comando 'claude')) { $sigueFaltando += 'claude' }
if ($sigueFaltando.Count) {
    Write-Host "Faltan: $($sigueFaltando -join ', '). Si se acaban de instalar, cierra y vuelve a abrir la terminal (y Claude Code) y repite." -ForegroundColor Yellow
    exit 1
}
if ($instalados.Count) {
    Write-Host "Instalados ahora: $($instalados -join ', '). Claude Code no los verá hasta reiniciarlo: ciérralo, ábrelo con 'claude --continue' y repite este paso." -ForegroundColor Yellow
    exit 2
}

if ($SoloComprobar) { & node "$kit\kit.mjs" comprobar; exit $LASTEXITCODE }

$argumentos = @('instalar')
if ($SinOpcionales) { $argumentos += '--sin-opcionales' }
& node "$kit\kit.mjs" @argumentos
exit $LASTEXITCODE
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="instalar.sh" sha256="978a74d6fe7efbeb16d1aea4e4aed2f9e423fc6f7166a32f97b4960d3b9eec25" -->
~~~~~~~~text
#!/usr/bin/env bash
# kit-claude — arranque en macOS y Linux.
# Comprueba e instala los requisitos (git, node, uv) y delega el resto en kit.mjs.
# Idempotente. Uso:  bash instalar.sh [--solo-comprobar] [--sin-opcionales]
# Lo que exige sudo NO se ejecuta aquí: se imprime para que el usuario lo lance en su propia terminal.
set -uo pipefail

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOLO=0; OPC=""
for a in "$@"; do
  case "$a" in
    --solo-comprobar) SOLO=1 ;;
    --sin-opcionales) OPC="--sin-opcionales" ;;
  esac
done

tiene() { command -v "$1" >/dev/null 2>&1; }
SO="$(uname -s)"
PENDIENTE_USUARIO=()
INSTALADOS=()

instalar_requisito() {
  local cmd="$1"
  tiene "$cmd" && return 0
  [ "$SOLO" = 1 ] && return 0
  if [ "$SO" = "Darwin" ]; then
    if ! tiene brew; then
      echo "FALTA Homebrew. Instálalo desde https://brew.sh en tu terminal y repite."; exit 1
    fi
    brew install "$cmd" && INSTALADOS+=("$cmd")
  else
    case "$cmd" in
      uv) curl -LsSf https://astral.sh/uv/install.sh | sh && export PATH="$HOME/.local/bin:$PATH" && INSTALADOS+=("uv") ;;
      git) PENDIENTE_USUARIO+=("sudo apt-get install -y git        # Fedora: sudo dnf install -y git") ;;
      node) PENDIENTE_USUARIO+=("curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && sudo apt-get install -y nodejs   # Debian/Ubuntu") ;;
    esac
  fi
}

for r in git node uv; do instalar_requisito "$r"; done

if [ "${#PENDIENTE_USUARIO[@]}" -gt 0 ]; then
  echo "Estos requisitos necesitan sudo. Ejecútalos en TU terminal (no desde Claude) y repite:"
  printf '  %s\n' "${PENDIENTE_USUARIO[@]}"
  exit 1
fi

FALTAN=()
for r in git node uv claude; do tiene "$r" || FALTAN+=("$r"); done
if [ "${#FALTAN[@]}" -gt 0 ]; then
  echo "Faltan: ${FALTAN[*]}. Si se acaban de instalar, abre una terminal nueva y repite."
  exit 1
fi
if [ "${#INSTALADOS[@]}" -gt 0 ]; then
  echo "Instalados ahora: ${INSTALADOS[*]}. Claude Code no los verá hasta reiniciarlo: ciérralo, ábrelo con 'claude --continue' y repite este paso."
  exit 2
fi

if [ "$SOLO" = 1 ]; then
  exec node "$KIT/kit.mjs" comprobar
fi
exec node "$KIT/kit.mjs" instalar $OPC
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="kit.mjs" sha256="55d8dc6436e9a8460dd96745de15b6b50a96c16b241898e9b608f42c06f4434d" -->
~~~~~~~~text
#!/usr/bin/env node
// kit-claude — instalación y memoria local por repositorio para Claude Code.
// Multiplataforma (Windows, macOS, Linux). Solo módulos de Node ≥ 18; sin dependencias.
//
//   node kit.mjs comprobar            [--json]
//   node kit.mjs coste                (tokens fijos que carga cada sesión)
//   node kit.mjs instalar             [--sin-externos]
//   node kit.mjs iniciar-repo  [ruta] [--sin-obsidian] [--sin-hook]
//   node kit.mjs modulos       [ruta]
//   node kit.mjs lanzar        [ruta] --modulo <nombre> [--dry-run] [--forzar]
//   node kit.mjs registrar-obsidian [ruta]
//   node kit.mjs omitir        [ruta]
//   node kit.mjs empaquetar           (genera KIT-CLAUDE-CODE.md autocontenido)
//
// Variables: KIT_CLAUDE_HOME sustituye a ~/.claude (pruebas en seco sin tocar la instalación real).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KIT = path.dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(fs.readFileSync(path.join(KIT, 'version.json'), 'utf8')).version;
const SO = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'macos' : 'linux';
const HOME = os.homedir();
const CLAUDE_HOME = process.env.KIT_CLAUDE_HOME || path.join(HOME, '.claude');
const HOY = new Date().toISOString().slice(0, 10);
const CLAUDE_MINIMO = '2.1.273'; // versión con la que se probó --bg, `claude agents` y hooks con `args`

const CARPETAS_VAULT = [
  '00 - Proyecto', '01 - Arquitectura', '02 - Base de Datos', '03 - Backend', '04 - Frontend',
  '05 - APIs', '06 - Docker', '07 - UI-UX', '08 - Decisiones', '09 - Bugs y soluciones',
  '10 - Tareas', '11 - Cambios', '12 - Testing',
];
const EXCLUSIONES = ['/vault/', '/graphify-out/', '/.graphifyignore'];
const MARCA_INI = '# >>> kit-claude (local, no versionado)';
const MARCA_FIN = '# <<< kit-claude';
const MARCA_DIR = '.kit-claude'; // presente en carpetas que el kit instala y puede reemplazar

// ───────────────────────── utilidades ─────────────────────────

function sh(cmd, { cwd, timeout = 60_000 } = {}) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', windowsHide: true, timeout });
  const salida = `${r.stdout || ''}${r.stderr || ''}`.trim();
  if (r.error && r.error.code === 'ETIMEDOUT') return { ok: false, codigo: 'timeout', salida: `superó ${timeout / 1000} s` };
  return { ok: r.status === 0, codigo: r.status, salida };
}

function existeComando(nombre) {
  return sh(SO === 'windows' ? `where ${nombre}` : `command -v ${nombre}`, { timeout: 15_000 }).ok;
}

function version(cmd) {
  const r = sh(cmd, { timeout: 30_000 });
  return r.ok ? (r.salida.split(/\r?\n/)[0] || 'ok') : null;
}

function compararVersion(a, b) {
  const pa = String(a).match(/\d+(\.\d+)*/)?.[0].split('.').map(Number) || [];
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

function leerJson(ruta, porDefecto) {
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch { return porDefecto; }
}

function escribirJson(ruta, datos) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, `${JSON.stringify(datos, null, 2)}\n`);
}

function sello() { return new Date().toISOString().replace(/[-:.TZ]/g, ''); }

function respaldar(ruta) {
  if (!fs.existsSync(ruta)) return null;
  const destino = `${ruta}.bak-${sello()}`;
  fs.copyFileSync(ruta, destino);
  return destino;
}

function copiarDir(origen, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const e of fs.readdirSync(origen, { withFileTypes: true })) {
    const o = path.join(origen, e.name);
    const d = path.join(destino, e.name);
    if (e.isDirectory()) copiarDir(o, d); else fs.copyFileSync(o, d);
  }
}

// Reemplaza por completo una carpeta del kit. Si ya existía y NO la puso el kit (sin marca),
// se mueve a ~/.claude/kit-respaldos/ en lugar de pisarla.
function instalarDirKit(origen, destino) {
  let respaldo = null;
  if (fs.existsSync(destino)) {
    if (!fs.existsSync(path.join(destino, MARCA_DIR))) {
      respaldo = path.join(CLAUDE_HOME, 'kit-respaldos', `${path.basename(destino)}-${sello()}`);
      fs.mkdirSync(path.dirname(respaldo), { recursive: true });
      fs.renameSync(destino, respaldo);
    } else {
      fs.rmSync(destino, { recursive: true, force: true });
    }
  }
  copiarDir(origen, destino);
  fs.writeFileSync(path.join(destino, MARCA_DIR), `kit-claude ${VERSION}\n`);
  return respaldo;
}

function iguales(a, b) {
  try { return fs.readFileSync(a).equals(fs.readFileSync(b)); } catch { return false; }
}

function barra(ruta) { return ruta.split(path.sep).join('/'); }

function args(lista) {
  const pos = [];
  const op = {};
  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) op[k] = v;
      else if (lista[i + 1] !== undefined && !lista[i + 1].startsWith('--') && ['modulo'].includes(k)) op[k] = lista[++i];
      else op[k] = true;
    } else pos.push(a);
  }
  return { pos, op };
}

// Los ejecutables de `uv tool install` van a un directorio que en una máquina limpia no está en el PATH.
// Se añade al PATH de este proceso (y de sus hijos) para no depender de reiniciar la terminal.
function anadirBinUv() {
  const candidatos = [path.join(HOME, '.local', 'bin')];
  const r = sh('uv tool dir --bin', { timeout: 15_000 });
  if (r.ok && r.salida) candidatos.unshift(r.salida.split(/\r?\n/).pop().trim());
  const clave = Object.keys(process.env).find(k => k.toUpperCase() === 'PATH') || 'PATH';
  const actual = (process.env[clave] || '').split(path.delimiter);
  for (const c of candidatos.reverse()) if (c && !actual.includes(c)) actual.unshift(c);
  process.env[clave] = actual.join(path.delimiter);
}

// ───────────────────────── componentes ─────────────────────────

function obsidianInstalado() {
  if (SO === 'windows') {
    return [process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Obsidian', 'Obsidian.exe'),
      process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Obsidian', 'Obsidian.exe')]
      .some(p => p && fs.existsSync(p));
  }
  if (SO === 'macos') return fs.existsSync('/Applications/Obsidian.app') || fs.existsSync(path.join(HOME, 'Applications', 'Obsidian.app'));
  return existeComando('obsidian') || flatpakObsidian() || sh('snap list obsidian').ok;
}

function flatpakObsidian() {
  return existeComando('flatpak') && sh('flatpak info md.obsidian.Obsidian').ok;
}

function dirConfigObsidian() {
  if (SO === 'windows') return path.join(process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming'), 'obsidian');
  if (SO === 'macos') return path.join(HOME, 'Library', 'Application Support', 'obsidian');
  // Con flatpak la configuración vive en su sandbox aunque aún no exista (Obsidian nunca abierto).
  if (flatpakObsidian()) return path.join(HOME, '.var', 'app', 'md.obsidian.Obsidian', 'config', 'obsidian');
  const snap = path.join(HOME, 'snap', 'obsidian', 'current', '.config', 'obsidian');
  if (fs.existsSync(snap)) return snap;
  return path.join(process.env.XDG_CONFIG_HOME || path.join(HOME, '.config'), 'obsidian');
}

function obsidianAbierto() {
  // -x: nombre exacto del proceso. Con -f el propio `node kit.mjs registrar-obsidian` daría positivo.
  if (SO === 'windows') return /obsidian\.exe/i.test(sh('tasklist /FI "IMAGENAME eq Obsidian.exe" /NH').salida);
  return sh('pgrep -ix obsidian').ok;
}

function ejecutarOFallar(cmd, opciones = {}) {
  const r = sh(cmd, { timeout: 20 * 60_000, ...opciones });
  if (!r.ok) throw new Error(`\`${cmd}\` terminó con código ${r.codigo}: ${r.salida.split(/\r?\n/).slice(-3).join(' | ')}`);
  return cmd;
}

const COMPONENTES = [
  // Requisitos: los instala el script de arranque (instalar.ps1 / instalar.sh); aquí solo se comprueban.
  { id: 'git', grupo: 'requisito', comprobar: () => version('git --version') },
  {
    id: 'node', grupo: 'requisito',
    comprobar: () => (compararVersion(process.versions.node, '18') >= 0 ? `v${process.versions.node}` : { aviso: `v${process.versions.node}: se necesita 18 o superior` }),
  },
  { id: 'uv', grupo: 'requisito', comprobar: () => version('uv --version') },
  {
    id: 'claude', grupo: 'requisito',
    comprobar: () => {
      const v = version('claude --version');
      if (!v) return null;
      return compararVersion(v, CLAUDE_MINIMO) >= 0 ? v : { aviso: `${v}: actualiza con \`claude update\` (probado desde ${CLAUDE_MINIMO})` };
    },
  },
  { id: 'gh', grupo: 'aviso', nota: 'Solo para actualizar el kit desde github.com/stivenprl/optimizar-tokens.', comprobar: () => version('gh --version') },
  {
    id: 'graphify', grupo: 'obligatorio',
    comprobar: () => {
      const v = version('graphify --version');
      if (!v) return null;
      if (!fs.existsSync(path.join(CLAUDE_HOME, 'skills', 'graphify', 'SKILL.md'))) return { aviso: `${v}, pero falta la skill (\`graphify install\`)` };
      return v;
    },
    instalar: () => {
      // tree-sitter-sql: sin él los .sql no aportan nodos y el aviso pasa desapercibido.
      const hechos = [ejecutarOFallar('uv tool install --upgrade --with tree-sitter-sql graphifyy')];
      sh('uv tool update-shell', { timeout: 30_000 }); // deja ~/.local/bin en el PATH de las próximas terminales
      anadirBinUv();
      hechos.push(ejecutarOFallar('graphify install'));
      return hechos.join(' && ');
    },
  },
  {
    id: 'obsidian', grupo: 'obligatorio',
    comprobar: () => (obsidianInstalado() ? 'instalado' : null),
    instalar: () => {
      if (SO === 'windows') return ejecutarOFallar('winget install -e --id Obsidian.Obsidian --silent --accept-source-agreements --accept-package-agreements');
      if (SO === 'macos') return ejecutarOFallar('brew install --cask obsidian');
      if (existeComando('flatpak')) {
        // --user: sin sudo ni polkit.
        ejecutarOFallar('flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo');
        return ejecutarOFallar('flatpak install --user -y flathub md.obsidian.Obsidian');
      }
      throw new Error('sin flatpak: el usuario debe instalarlo con `sudo snap install obsidian --classic` o el AppImage de https://obsidian.md/download');
    },
  },
];

// ───────────────────────── archivos del kit en ~/.claude ─────────────────────────

// La regla va a ~/.claude/rules/: Claude Code la carga en todas las sesiones, así el CLAUDE.md que ya
// tenga el usuario se respeta intacto y las reglas de ahorro del kit se suman a él.
const REGLAS_KIT = ['kit-claude.md'];
const SKILLS_KIT = ['memoria-repo', 'actualizar-vault', 'strategic-compact'];

function copiarArchivosKit() {
  const hechos = [];
  for (const nombre of REGLAS_KIT) {
    const destino = path.join(CLAUDE_HOME, 'rules', nombre);
    if (iguales(path.join(KIT, 'global', nombre), destino)) continue;
    const copia = fs.existsSync(destino) ? respaldar(destino) : null;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(path.join(KIT, 'global', nombre), destino);
    hechos.push(`regla rules/${nombre}${copia ? ` (anterior en ${path.basename(copia)})` : ''}`);
  }
  if (hechos.length) hechos.push('tu CLAUDE.md no se toca');

  for (const skill of SKILLS_KIT) {
    const r = instalarDirKit(path.join(KIT, 'skills', skill), path.join(CLAUDE_HOME, 'skills', skill));
    if (r) hechos.push(`skill "${skill}" que ya tenías movida a ${barra(path.relative(CLAUDE_HOME, r))}`);
  }
  hechos.push(`skills ${SKILLS_KIT.join(', ')} instaladas`);

  const hooks = path.join(CLAUDE_HOME, 'hooks');
  fs.mkdirSync(hooks, { recursive: true });
  for (const f of ['guardia-destructiva.js', 'inicio-repo.js']) fs.copyFileSync(path.join(KIT, 'hooks', f), path.join(hooks, f));
  const r = instalarDirKit(path.join(KIT, 'hooks', 'strategic-compact'), path.join(hooks, 'strategic-compact'));
  hechos.push(`hooks copiados${r ? ` (strategic-compact previo movido a ${barra(path.relative(CLAUDE_HOME, r))})` : ''}`);

  hechos.push(fusionarSettings());
  return hechos;
}

function fusionarSettings() {
  const ruta = path.join(CLAUDE_HOME, 'settings.json');
  const antes = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : null;
  let s = {};
  if (antes !== null) {
    try { s = JSON.parse(antes); } catch { throw new Error(`${ruta} no es JSON válido: corrígelo (hay respaldos .bak-*) y repite`); }
  }
  const hook = script => ({ type: 'command', command: 'node', args: [barra(path.join(CLAUDE_HOME, 'hooks', script))], timeout: 10 });
  const deseados = [
    ['PreToolUse', 'Bash|PowerShell|Edit|Write|MultiEdit|NotebookEdit', { ...hook('guardia-destructiva.js'), statusMessage: 'Guardia de comandos destructivos' }],
    ['PreToolUse', 'Edit|Write', hook('strategic-compact/hooks/suggest-compact.js')],
    ['SessionStart', 'startup|resume|clear|compact', hook('inicio-repo.js')],
  ];
  const nombres = ['guardia-destructiva.js', 'suggest-compact.js', 'inicio-repo.js'];
  const esDelKit = h => nombres.some(n => JSON.stringify(h).includes(n));

  // Nunca se reescribe el matcher de un grupo ajeno: se quitan los hooks del kit de donde estén
  // (y los grupos que queden vacíos) y se añaden en grupos propios.
  s.hooks = s.hooks || {};
  for (const evento of Object.keys(s.hooks)) {
    s.hooks[evento] = (s.hooks[evento] || [])
      .map(g => ({ ...g, hooks: (g.hooks || []).filter(h => !esDelKit(h)) }))
      .filter(g => g.hooks.length);
    if (!s.hooks[evento].length) delete s.hooks[evento];
  }
  for (const [evento, matcher, h] of deseados) (s.hooks[evento] = s.hooks[evento] || []).push({ matcher, hooks: [h] });

  const despues = `${JSON.stringify(s, null, 2)}\n`;
  if (despues === antes) return 'settings.json ya estaba al día';
  const copia = respaldar(ruta);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, despues);
  return `settings.json fusionado (hooks)${copia ? `; respaldo ${path.basename(copia)}` : ''}`;
}

// ───────────────────────── comandos globales ─────────────────────────

function estadoComponentes() {
  return COMPONENTES.map(c => {
    let r;
    try { r = c.comprobar(); } catch { r = null; }
    const aviso = r && typeof r === 'object' ? r.aviso : null;
    return { id: c.id, grupo: c.grupo, ok: Boolean(r) && !aviso, detalle: aviso || (typeof r === 'string' ? r : 'no encontrado'), nota: c.nota };
  });
}

function estadoArchivosKit() {
  const f = rel => fs.existsSync(path.join(CLAUDE_HOME, rel));
  const texto = JSON.stringify(leerJson(path.join(CLAUDE_HOME, 'settings.json'), {}).hooks || {});
  return [
    ...REGLAS_KIT.map(n => ({ id: `regla rules/${n}`, ok: iguales(path.join(KIT, 'global', n), path.join(CLAUDE_HOME, 'rules', n)) })),
    ...SKILLS_KIT.map(s => ({ id: `skill ${s}`, ok: iguales(path.join(KIT, 'skills', s, 'SKILL.md'), path.join(CLAUDE_HOME, 'skills', s, 'SKILL.md')) })),
    { id: 'hook guardia-destructiva', ok: iguales(path.join(KIT, 'hooks', 'guardia-destructiva.js'), path.join(CLAUDE_HOME, 'hooks', 'guardia-destructiva.js')) && texto.includes('guardia-destructiva.js') },
    { id: 'hook strategic-compact', ok: f('hooks/strategic-compact/hooks/suggest-compact.js') && texto.includes('suggest-compact.js') },
    { id: 'hook inicio-repo', ok: iguales(path.join(KIT, 'hooks', 'inicio-repo.js'), path.join(CLAUDE_HOME, 'hooks', 'inicio-repo.js')) && texto.includes('inicio-repo.js') },
  ].map(x => ({ ...x, grupo: 'kit', detalle: x.ok ? 'ok' : 'falta o desactualizado' }));
}

function imprimirEstado(filas) {
  for (const f of filas) {
    const marca = f.ok ? 'OK   ' : ['opcional', 'aviso'].includes(f.grupo) ? 'AVISO' : 'FALTA';
    console.log(`${marca}  ${f.id.padEnd(28)} ${f.detalle}${f.nota && !f.ok ? `  — ${f.nota}` : ''}`);
  }
}

function cmdComprobar({ op }) {
  const filas = [...estadoComponentes(), ...estadoArchivosKit()];
  const fallos = filas.filter(f => !f.ok && ['requisito', 'obligatorio', 'kit'].includes(f.grupo));
  if (op.json) console.log(JSON.stringify({ so: SO, kit: VERSION, claudeHome: CLAUDE_HOME, filas, ok: fallos.length === 0 }, null, 2));
  else {
    console.log(`kit-claude ${VERSION} · sistema: ${SO} · configuración: ${CLAUDE_HOME}\n`);
    imprimirEstado(filas);
    console.log(fallos.length ? `\n${fallos.length} elemento(s) obligatorio(s) sin resolver.` : '\nTodo lo obligatorio está en orden.');
  }
  process.exitCode = fallos.length ? 1 : 0;
}

// Estimación de lo que se carga en CADA sesión (reglas + listado de skills). Aproximada:
// 2,2 caracteres por token, medido con la API sobre estas mismas reglas en español.
function cmdCoste() {
  const tok = chars => Math.round(chars / 2.2);
  const filas = [];
  const condicionales = [];
  const dirReglas = path.join(CLAUDE_HOME, 'rules');
  if (fs.existsSync(dirReglas)) {
    for (const f of fs.readdirSync(dirReglas).filter(n => n.endsWith('.md'))) {
      const texto = fs.readFileSync(path.join(dirReglas, f), 'utf8');
      // Con `paths:` solo entra al tocar archivos que coinciden: no es carga fija.
      if (/^---\r?\n[\s\S]*?^paths:/m.test(texto)) condicionales.push([`rules/${f}`, tok(texto.length)]);
      else filas.push([`rules/${f}`, tok(texto.length)]);
    }
  }
  const personal = path.join(CLAUDE_HOME, 'CLAUDE.md');
  if (fs.existsSync(personal)) filas.push(['CLAUDE.md personal', tok(fs.readFileSync(personal, 'utf8').length)]);

  const overrides = leerJson(path.join(CLAUDE_HOME, 'settings.json'), {}).skillOverrides || {};
  let listado = 0;
  const dirSkills = path.join(CLAUDE_HOME, 'skills');
  for (const n of fs.existsSync(dirSkills) ? fs.readdirSync(dirSkills) : []) {
    const archivo = path.join(dirSkills, n, 'SKILL.md');
    if (!fs.existsSync(archivo)) continue;
    const modo = overrides[n] || 'on';
    if (modo === 'off' || modo === 'user-invocable-only') continue;
    const fm = (fs.readFileSync(archivo, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    const campo = k => ((fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) || [])[1] || '').replace(/^["']|["']$/g, '');
    const texto = modo === 'name-only' ? n : `${n}: ${`${campo('description')} ${campo('when_to_use')}`.trim().slice(0, 1536)}`;
    listado += texto.length;
  }
  filas.push(['listado de skills (con skillOverrides)', tok(listado)]);
  const total = filas.reduce((a, [, t]) => a + t, 0);
  console.log(`Carga fija por sesión en ${CLAUDE_HOME} (aproximada):\n`);
  for (const [q, t] of filas) console.log(`  ${String(t).padStart(6)} tok  ${q}`);
  console.log(`  ${String(total).padStart(6)} tok  TOTAL (sin prompt de sistema ni plugins; plugins: \`claude plugin details <id>\`)`);
  if (condicionales.length) {
    console.log('\nSolo al tocar archivos que coinciden (reglas con paths):');
    for (const [q, t] of condicionales) console.log(`  ${String(t).padStart(6)} tok  ${q}`);
  }
}

function cmdInstalar({ op }) {
  console.log(`kit-claude ${VERSION} · instalando en ${SO} · configuración: ${CLAUDE_HOME}\n`);
  const faltanReq = estadoComponentes().filter(f => f.grupo === 'requisito' && !f.ok);
  if (faltanReq.length && !op['sin-externos']) {
    console.log(`Requisitos sin resolver: ${faltanReq.map(f => `${f.id} (${f.detalle})`).join(', ')}. Resuélvelos (instalar.ps1 / instalar.sh) y repite.`);
    process.exitCode = 1;
    return;
  }

  const informe = [];
  if (!op['sin-externos']) {
    for (const c of COMPONENTES) {
      if (!c.instalar) continue;
      if (c.grupo === 'opcional' && op['sin-opcionales']) { informe.push(`- ${c.id}: omitido (--sin-opcionales)`); continue; }
      const previo = estadoComponentes().find(f => f.id === c.id);
      if (previo.ok) { informe.push(`= ${c.id}: ya estaba (${previo.detalle})`); continue; }
      try {
        informe.push(`+ ${c.id}: ${c.instalar()}`);
      } catch (e) {
        // Algunos instaladores devuelven error cuando el paquete ya existía: manda la re-comprobación.
        const ahora = estadoComponentes().find(f => f.id === c.id);
        informe.push(ahora.ok ? `= ${c.id}: presente tras reintento (${ahora.detalle})` : `! ${c.id}: ${e.message}`);
      }
    }
  }
  try {
    for (const h of copiarArchivosKit()) informe.push(`+ ${h}`);
  } catch (e) {
    informe.push(`! archivos del kit: ${e.message}`);
  }
  console.log(informe.join('\n'));
  console.log('\n── Comprobación final ──');
  cmdComprobar({ op: {} });
}

// ───────────────────────── repositorio ─────────────────────────

function git(repo, argsGit) {
  const r = spawnSync('git', argsGit, { cwd: repo, encoding: 'utf8', windowsHide: true, timeout: 60_000 });
  return { ok: r.status === 0, salida: (r.stdout || '').trim(), error: (r.stderr || '').trim() };
}

function resolverRepo(ruta) {
  const r = git(path.resolve(ruta || '.'), ['rev-parse', '--show-toplevel']);
  if (!r.ok) throw new Error(`"${path.resolve(ruta || '.')}" no es un repositorio git`);
  const repo = path.resolve(r.salida);
  if (path.resolve(repo) === path.resolve(HOME)) throw new Error('la carpeta personal es un repositorio git (dotfiles): el kit no se aplica ahí');
  return repo;
}

function rutaGit(repo, rel) {
  return path.resolve(repo, git(repo, ['rev-parse', '--git-path', rel]).salida);
}

function aplicarExclusiones(repo) {
  const ruta = rutaGit(repo, 'info/exclude');
  const actual = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
  const bloque = [MARCA_INI, ...EXCLUSIONES, MARCA_FIN].join('\n');
  const patron = new RegExp(`${MARCA_INI.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARCA_FIN}`);
  const nuevo = patron.test(actual) ? actual.replace(patron, bloque) : `${actual.replace(/\s*$/, '')}${actual.trim() ? '\n\n' : ''}${bloque}\n`;
  if (nuevo === actual) return 'exclusiones git ya presentes';
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, nuevo);
  return `exclusiones añadidas a ${barra(path.relative(repo, ruta))}`;
}

function versionadosProblematicos(repo) {
  const r = git(repo, ['ls-files', '--', 'vault', 'graphify-out', '.graphifyignore']);
  return r.ok && r.salida ? r.salida.split(/\r?\n/).slice(0, 5) : [];
}

// Devuelve 'nuevo' | 'kit' | 'obsidian'; lanza error si `vault/` es otra cosa (p. ej. HashiCorp Vault).
function tipoVault(vault) {
  if (!fs.existsSync(vault)) return 'nuevo';
  if (fs.existsSync(path.join(vault, '_kit.json'))) return 'kit';
  try { if (/kit-claude/.test(fs.readFileSync(path.join(vault, '_INDICE.md'), 'utf8'))) return 'kit'; } catch { /* sin índice */ }
  if (fs.existsSync(path.join(vault, '.obsidian'))) return 'obsidian';
  throw new Error('ya existe una carpeta vault/ que no es un vault de Obsidian ni del kit (¿configuración de otra herramienta?). No se toca: renómbrala o decide con el usuario');
}

function prepararVault(repo, salida) {
  const vault = path.join(repo, 'vault');
  const tipo = tipoVault(vault);
  if (tipo !== 'obsidian') for (const c of CARPETAS_VAULT) fs.mkdirSync(path.join(vault, c), { recursive: true });
  const indice = path.join(vault, '_INDICE.md');
  if (!fs.existsSync(indice)) {
    fs.writeFileSync(indice, fs.readFileSync(path.join(KIT, 'plantillas', 'vault', '_INDICE.md'), 'utf8')
      .replaceAll('{{REPO}}', path.basename(repo)).replaceAll('{{FECHA}}', HOY));
  }
  const pendiente = path.join(vault, '10 - Tareas', 'Pendiente.md');
  if (!fs.existsSync(pendiente)) {
    fs.mkdirSync(path.dirname(pendiente), { recursive: true });
    fs.copyFileSync(path.join(KIT, 'plantillas', 'vault', '10 - Tareas', 'Pendiente.md'), pendiente);
  }
  for (const dir of [vault, path.join(repo, 'graphify-out')]) {
    fs.mkdirSync(dir, { recursive: true });
    const ht = path.join(dir, '.htaccess');
    if (!fs.existsSync(ht)) fs.copyFileSync(path.join(KIT, 'plantillas', 'htaccess'), ht);
  }
  salida.hechos.push({
    nuevo: 'vault creado (00–12 + _INDICE.md + .htaccess)',
    kit: 'vault del kit ya existente: respetado',
    obsidian: 'vault de Obsidian existente adoptado (solo se añadieron _INDICE.md y 10 - Tareas/Pendiente.md si faltaban)',
  }[tipo]);
}

// Estar fuera de git no protege si se despliega copiando la carpeta o con `COPY . .` en Docker.
function avisosDespliegue(repo) {
  const avisos = [];
  const dockerfiles = fs.readdirSync(repo).filter(n => /^Dockerfile/i.test(n));
  if (dockerfiles.length) {
    const di = path.join(repo, '.dockerignore');
    const txt = fs.existsSync(di) ? fs.readFileSync(di, 'utf8') : '';
    if (!/^\/?vault\/?\s*$/m.test(txt) || !/^\/?graphify-out\/?\s*$/m.test(txt)) {
      avisos.push(`hay ${dockerfiles.join(', ')} y .dockerignore no excluye vault/ y graphify-out/: si la imagen copia el repo, se incluirían. Proponer al usuario añadirlos a .dockerignore (es un archivo versionado: requiere su aprobación)`);
    }
  }
  return avisos;
}

function contarCodigo(dir, limite = { n: 0 }) {
  const EXT = /\.(php|js|mjs|cjs|ts|tsx|jsx|vue|svelte|py|go|java|cs|rb|kt|swift|sql)$/i;
  let total = 0;
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entradas) {
    if (limite.n++ > 60000) break;
    if (e.isDirectory()) {
      if (IGNORAR_DIR.has(e.name.toLowerCase()) || e.name.startsWith('.')) continue;
      total += contarCodigo(path.join(dir, e.name), limite);
    } else if (EXT.test(e.name) && !/\.min\./i.test(e.name)) total++;
  }
  return total;
}

const IGNORAR_DIR = new Set([
  'vendor', 'node_modules', 'bower_components', 'libraries', 'library', 'lib', 'libs', 'assets', 'css', 'scss',
  'img', 'images', 'fonts', 'icons', 'uploads', 'vault', 'graphify-out', 'storage', 'cache', 'dist', 'build',
  'coverage', 'test-results', 'playwright-report', 'tmp', 'temp', 'logs', 'phpmailer', 'dompdf', 'tcpdf', 'fpdf',
]);
const NO_MODULO = new Set([...IGNORAR_DIR, 'tests', 'test', 'docs', 'database', 'migrations', 'config', 'includes',
  'include', 'public', 'resources', 'scripts', 'bin', 'general', 'shared', 'common', 'layouts', 'partials', 'pwa', 'legal',
  'modules', 'modulos', 'pages', 'src', 'app']);

function detectarModulos(repo) {
  const raices = ['pages', 'modules', 'modulos', 'app/Modules', 'src/modules', 'src/pages', 'app/Http/Controllers', 'src/app', 'src', 'app', 'api'];
  for (const r of raices) {
    const abs = path.join(repo, r);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;
    const candidatos = [];
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.') || NO_MODULO.has(e.name.toLowerCase())) continue;
      const n = contarCodigo(path.join(abs, e.name));
      if (n > 0) candidatos.push({ modulo: e.name, ruta: `${r}/${e.name}`, archivos: n });
    }
    if (candidatos.length) return candidatos.sort((a, b) => b.archivos - a.archivos).slice(0, 12);
  }
  const candidatos = [];
  for (const e of fs.readdirSync(repo, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('.') || NO_MODULO.has(e.name.toLowerCase())) continue;
    const n = contarCodigo(path.join(repo, e.name));
    if (n > 0) candidatos.push({ modulo: e.name, ruta: e.name, archivos: n });
  }
  return candidatos.sort((a, b) => b.archivos - a.archivos).slice(0, 12);
}

const LINEA_MERGE = /^graphify-out\/graph\.json[ \t]+merge=graphify[ \t]*$/m;
const LINEA_MERGE_BORRAR = /^graphify-out\/graph\.json[ \t]+merge=graphify[ \t]*\r?\n?/m;

function instalarHookGraphify(repo) {
  if (!existeComando('graphify')) return { aviso: 'graphify no está instalado: hook post-commit sin instalar' };
  // Con core.hooksPath (husky, .githooks…) el hook iría a una carpeta que suele estar versionada.
  const hooksPath = git(repo, ['config', '--get', 'core.hooksPath']);
  if (hooksPath.ok && hooksPath.salida) {
    return { aviso: `el repo usa core.hooksPath=${hooksPath.salida}: no se instala el hook de Graphify (iría a una carpeta compartida). Tras cada commit, \`graphify update .\`` };
  }
  const estado = sh('graphify hook status', { cwd: repo });
  if (estado.ok && /post-commit:\s*installed/i.test(estado.salida)) return `hook post-commit de Graphify ya instalado${devolverGitattributes(repo, undefined)}`;
  // `graphify hook install` añade `graphify-out/graph.json merge=graphify` al .gitattributes VERSIONADO.
  // graph.json nunca se sube: se restaura el archivo y la línea pasa a .git/info/attributes (local).
  const attrs = path.join(repo, '.gitattributes');
  const previo = fs.existsSync(attrs) ? fs.readFileSync(attrs) : null;
  const r = sh('graphify hook install', { cwd: repo });
  const limpieza = devolverGitattributes(repo, previo);
  return r.ok
    ? `hook post-commit de Graphify instalado (rehace el grafo en cada commit)${limpieza}`
    : { aviso: `graphify hook install falló: ${r.salida.split(/\r?\n/).pop()}` };
}

// previo: Buffer (existía) · null (no existía) · undefined (se desconoce: solo quitar la línea)
function devolverGitattributes(repo, previo) {
  const attrs = path.join(repo, '.gitattributes');
  if (!fs.existsSync(attrs)) return '';
  const actual = fs.readFileSync(attrs);
  if (!LINEA_MERGE.test(actual.toString('utf8'))) return '';
  if (Buffer.isBuffer(previo) && !LINEA_MERGE.test(previo.toString('utf8'))) {
    fs.writeFileSync(attrs, previo); // restauración byte a byte
  } else {
    const resto = actual.toString('utf8').replace(LINEA_MERGE_BORRAR, '');
    const versionado = git(repo, ['ls-files', '--error-unmatch', '.gitattributes']).ok;
    if (!resto.trim() && !versionado) fs.rmSync(attrs); else fs.writeFileSync(attrs, resto);
  }
  const local = rutaGit(repo, 'info/attributes');
  const contenido = fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : '';
  if (!LINEA_MERGE.test(contenido)) {
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.writeFileSync(local, `${contenido.replace(/\s*$/, '')}${contenido.trim() ? '\n' : ''}graphify-out/graph.json merge=graphify\n`);
  }
  return '; línea de merge movida de .gitattributes a .git/info/attributes';
}

function registrarObsidian(repo) {
  const vault = path.join(repo, 'vault');
  if (!obsidianInstalado()) return { aviso: 'Obsidian no está instalado: vault sin registrar' };
  const cfg = path.join(dirConfigObsidian(), 'obsidian.json');
  let datos = { vaults: {} };
  if (fs.existsSync(cfg)) {
    // Si el registro existe pero no se entiende, NO se reescribe: se perderían los vaults del usuario.
    try { datos = JSON.parse(fs.readFileSync(cfg, 'utf8')); } catch {
      return { aviso: `${cfg} no es JSON válido; no se toca. En Obsidian: "Abrir carpeta como vault" → ${vault}` };
    }
  }
  datos.vaults = datos.vaults || {};
  const norm = p => (SO === 'windows' ? path.resolve(p).toLowerCase() : path.resolve(p));
  if (Object.values(datos.vaults).some(v => v && v.path && norm(v.path) === norm(vault))) return 'vault ya registrado en Obsidian';
  // Obsidian reescribe obsidian.json al cerrarse: editarlo con la app abierta se perdería.
  if (obsidianAbierto()) {
    return { aviso: `Obsidian está abierto: ciérralo y ejecuta \`node "$HOME/.claude-kit/kit.mjs" registrar-obsidian .\`, o en Obsidian "Abrir carpeta como vault" → ${vault}` };
  }
  datos.vaults[crypto.randomBytes(8).toString('hex')] = { path: vault, ts: Date.now() };
  const dia = `${cfg}.bak-kit-${HOY}`;
  if (fs.existsSync(cfg) && !fs.existsSync(dia)) fs.copyFileSync(cfg, dia); // un respaldo por día, no uno por repo
  escribirJson(cfg, datos);
  return 'vault registrado en Obsidian (aparecerá en su lista de vaults)';
}

function cmdIniciarRepo({ pos, op }) {
  const salida = { ok: true, so: SO, repo: null, hechos: [], avisos: [], errores: [], modulos: [] };
  try {
    const repo = resolverRepo(pos[0]);
    salida.repo = repo;
    const statusAntes = git(repo, ['status', '--porcelain']).salida.split(/\r?\n/).filter(Boolean);
    const omitir = rutaGit(repo, 'kit-claude-omitir');
    if (fs.existsSync(omitir)) fs.rmSync(omitir);

    tipoVault(path.join(repo, 'vault')); // valida antes de tocar nada
    salida.hechos.push(aplicarExclusiones(repo));
    const versionados = versionadosProblematicos(repo);
    if (versionados.length) {
      salida.avisos.push(`ya están en git y la exclusión no los oculta: ${versionados.join(', ')}. Decidir con el usuario: sacarlos del índice los borraría también de la copia de cada compañero al hacer pull`);
    }

    const gi = path.join(repo, '.graphifyignore');
    if (!fs.existsSync(gi)) { fs.copyFileSync(path.join(KIT, 'plantillas', 'graphifyignore'), gi); salida.hechos.push('.graphifyignore creado'); }

    prepararVault(repo, salida);
    salida.avisos.push(...avisosDespliegue(repo));

    for (const paso of [op['sin-hook'] ? null : () => instalarHookGraphify(repo), op['sin-obsidian'] ? null : () => registrarObsidian(repo)]) {
      if (!paso) continue;
      const r = paso();
      if (typeof r === 'string') salida.hechos.push(r); else salida.avisos.push(r.aviso);
    }

    // iniciar-repo no puede dejar NADA nuevo para git (ni lo local ni efectos de herramientas de terceros).
    const nuevos = git(repo, ['status', '--porcelain']).salida.split(/\r?\n/).filter(l => l && !statusAntes.includes(l));
    if (nuevos.length) salida.errores.push(`git ve cambios que no existían antes de iniciar-repo (revisar con \`git diff\` y deshacer solo esos):\n${nuevos.join('\n')}`);

    salida.modulos = detectarModulos(repo);
    salida.primer_inicio = leerJson(path.join(repo, 'vault', '_kit.json'), {}).primer_inicio || 'sin_lanzar';
  } catch (e) {
    salida.errores.push(e.message);
  }
  salida.ok = salida.errores.length === 0;
  console.log(JSON.stringify(salida, null, 2));
  process.exitCode = salida.ok ? 0 : 1;
}

function cmdModulos({ pos }) {
  console.log(JSON.stringify(detectarModulos(resolverRepo(pos[0])), null, 2));
}

// En Windows `claude` puede ser claude.exe (instalador nativo) o claude.cmd (npm): el .cmd necesita cmd.exe.
function lanzarClaude(argumentos, cwd) {
  if (SO !== 'windows') return spawnSync('claude', argumentos, { cwd, encoding: 'utf8', timeout: 120_000 });
  const donde = sh('where claude').salida.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const exe = donde.find(p => /\.exe$/i.test(p));
  if (exe) return spawnSync(exe, argumentos, { cwd, encoding: 'utf8', windowsHide: true, timeout: 120_000 });
  const cmd = donde.find(p => /\.(cmd|bat)$/i.test(p));
  if (!cmd) return { status: 1, stderr: 'no se encontró claude en el PATH' };
  const citado = [cmd, ...argumentos].map(a => `"${String(a).replace(/"/g, '""')}"`).join(' ');
  return spawnSync('cmd.exe', ['/d', '/s', '/c', `"${citado}"`], { cwd, encoding: 'utf8', windowsHide: true, windowsVerbatimArguments: true, timeout: 120_000 });
}

function cmdLanzar({ pos, op }) {
  const repo = resolverRepo(pos[0]);
  const modulo = typeof op.modulo === 'string' ? op.modulo.trim() : '';
  if (!modulo) throw new Error('falta --modulo "<nombre>"');
  if (!fs.existsSync(path.join(repo, 'vault', '_INDICE.md'))) throw new Error('el repo no está preparado: ejecuta antes `iniciar-repo`');

  const kitJson = path.join(repo, 'vault', '_kit.json');
  const previo = leerJson(kitJson, null);
  if (previo && previo.primer_inicio === 'completado' && !op.forzar) {
    console.log(JSON.stringify({ ok: true, lanzado: false, motivo: 'el primer inicio ya está completado (usa --forzar para repetirlo)' }, null, 2));
    return;
  }

  const nombre = path.basename(repo);
  const dirKit = path.join(repo, 'vault', '.kit');
  const prompt = fs.readFileSync(path.join(KIT, 'plantillas', 'primer-inicio.md'), 'utf8')
    .replaceAll('{{REPO}}', nombre).replaceAll('{{MODULO}}', modulo).replaceAll('{{FECHA}}', HOY);

  // Permisos exactos. Nada de `graphify *` (incluye `graphify claude install`, `add <url>`, `uninstall`),
  // ni `git log` (--output escribe archivos), ni lectura fuera del repo o de .env.
  const graphify = ['graphify --version', 'graphify extract . --code-only', 'graphify god-nodes *', 'graphify query *',
    'graphify affected *', 'graphify path *', 'graphify explain *'];
  const gitLectura = ['git branch --show-current', 'git ls-files *'];
  const permitidas = [
    'Read(./**)', 'Grep', 'Glob', 'Edit(vault/**)',
    ...[...graphify, ...gitLectura].map(c => `Bash(${c})`),
    ...[...graphify, ...gitLectura].map(c => `PowerShell(${c})`),
  ].join(',');
  const prohibidas = ['Read(.env*)', 'Read(**/.env*)', 'Edit(.env*)', 'Edit(**/.env*)'].join(',');

  // Las sesiones --bg se mueven a un git worktree antes de editar; vault/ no está versionado y no existe
  // allí, así que se desactiva el aislamiento SOLO para esta sesión (sus permisos ya limitan la escritura a vault/).
  const ajustes = path.join(dirKit, 'ajustes-sesion.json');
  // Orden importante: --allowedTools/--disallowedTools admiten varios valores y se tragarían el prompt si
  // fueran justo delante. Tras ellos, opciones de un solo valor; el prompt al final.
  const argumentos = [
    '--bg', '--allowedTools', permitidas, '--disallowedTools', prohibidas,
    '--settings', ajustes, '--model', 'sonnet', '--permission-mode', 'default', '--name', `primer-inicio ${nombre}`,
    'Lee vault/.kit/primer-inicio.md y ejecútalo de principio a fin.',
  ];

  if (op['dry-run']) {
    console.log(JSON.stringify({ ok: true, lanzado: false, dryRun: true, cwd: repo, comando: ['claude', ...argumentos] }, null, 2));
    return;
  }

  fs.mkdirSync(dirKit, { recursive: true });
  fs.writeFileSync(path.join(dirKit, 'primer-inicio.md'), prompt);
  escribirJson(ajustes, { worktree: { bgIsolation: 'none' } });
  escribirJson(kitJson, {
    kit: VERSION, creado: previo?.creado || HOY, modulo_inicial: modulo, primer_inicio: 'en_curso',
    lanzado: new Date().toISOString(), modulos_documentados: previo?.modulos_documentados || [],
  });

  const r = lanzarClaude(argumentos, repo);
  const ok = r.status === 0;
  if (!ok) escribirJson(kitJson, { ...leerJson(kitJson, {}), primer_inicio: 'fallo_al_lanzar' });
  const texto = `${r.stdout || ''}${r.stderr || ''}`.trim() || (r.error && r.error.message) || '';
  console.log(JSON.stringify({
    ok, lanzado: ok, id: (texto.match(/backgrounded · ([0-9a-f]+)/) || [])[1] || null, salida: texto,
    seguimiento: ['claude agents', 'claude logs <id>', 'claude attach <id>'],
  }, null, 2));
  process.exitCode = ok ? 0 : 1;
}

function cmdRegistrarObsidian({ pos }) {
  const r = registrarObsidian(resolverRepo(pos[0]));
  console.log(typeof r === 'string' ? r : `AVISO: ${r.aviso}`);
}

function cmdOmitir({ pos }) {
  const repo = resolverRepo(pos[0]);
  fs.writeFileSync(rutaGit(repo, 'kit-claude-omitir'), `${HOY}\n`);
  console.log(`kit-claude no volverá a proponer el primer inicio en ${path.basename(repo)} (se revierte con iniciar-repo).`);
}

// ───────────────────────── empaquetado autocontenido ─────────────────────────
// KIT-CLAUDE-CODE.md = docs/KIT-CLAUDE-CODE.fuente.md + anexo con cada archivo del kit y su sha256.
// Se entrega ese único archivo; el extractor de la sección 2.3 lo desempaqueta y verifica.

const VALLA = '~'.repeat(8);

function archivosDelKit() {
  // El texto del documento ya va en la parte legible: incluirlo en el anexo lo duplicaría.
  const fuera = new Set(['KIT-CLAUDE-CODE.md', 'docs/KIT-CLAUDE-CODE.fuente.md']);
  const lista = git(KIT, ['ls-files', '--cached', '--others', '--exclude-standard']);
  const rutas = lista.ok && lista.salida
    ? lista.salida.split(/\r?\n/)
    : (function recorrer(dir, base = '') {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        if (e.name === '.git') return [];
        const rel = base ? `${base}/${e.name}` : e.name;
        return e.isDirectory() ? recorrer(path.join(dir, e.name), rel) : [rel];
      });
    })(KIT);
  return rutas.filter(r => r && !fuera.has(r) && !/\.bak-/.test(r) && fs.existsSync(path.join(KIT, r))).sort();
}

function cmdEmpaquetar() {
  // En un kit extraído no hay fuente: se recupera cortando el anexo del propio documento.
  const rutaFuente = path.join(KIT, 'docs', 'KIT-CLAUDE-CODE.fuente.md');
  const fuente = fs.existsSync(rutaFuente)
    ? fs.readFileSync(rutaFuente, 'utf8').replace(/\r\n/g, '\n')
    : fs.readFileSync(path.join(KIT, 'KIT-CLAUDE-CODE.md'), 'utf8').replace(/\r\n/g, '\n').split('\n---\n\n## Anexo — Archivos del kit')[0];
  const bloques = [];
  for (const rel of archivosDelKit()) {
    const bruto = fs.readFileSync(path.join(KIT, rel));
    let texto = bruto.toString('utf8');
    if (texto.includes('\u0000') || Buffer.from(texto, 'utf8').compare(bruto) !== 0) throw new Error(`${rel} no es texto UTF-8: no se puede empaquetar`);
    const bom = texto.charCodeAt(0) === 0xfeff;
    if (bom) texto = texto.slice(1);
    const crlf = texto.includes('\r\n');
    texto = texto.replace(/\r\n/g, '\n');
    if (texto.split('\n').some(l => l.startsWith(VALLA))) throw new Error(`${rel} contiene una línea que empieza por ${VALLA}`);
    if (!texto.endsWith('\n')) texto += '\n';
    const sha = crypto.createHash('sha256').update(texto, 'utf8').digest('hex');
    const attrs = `${bom ? ' bom' : ''}${crlf ? ' crlf' : ''}`;
    bloques.push([`<!-- kit-archivo ruta="${rel}" sha256="${sha}"${attrs} -->`, `${VALLA}text`, texto.slice(0, -1), VALLA, '<!-- /kit-archivo -->', ''].join('\n'));
  }
  const salida = [
    fuente.replace(/\s*$/, ''),
    '',
    '---',
    '',
    `## Anexo — Archivos del kit (versión ${VERSION})`,
    '',
    '> **Claude: no leas este anexo.** Lo desempaqueta y verifica el extractor del paso 2.3.',
    `> ${bloques.length} archivos. Cada bloque lleva su ruta y su sha256.`,
    '',
    // El extractor exige encontrar exactamente este número: un documento recortado no pasa.
    `<!-- kit-anexo version="${VERSION}" archivos="${bloques.length}" -->`,
    '',
    ...bloques,
  ].join('\n');
  fs.writeFileSync(path.join(KIT, 'KIT-CLAUDE-CODE.md'), salida);
  console.log(`KIT-CLAUDE-CODE.md generado: ${bloques.length} archivos, ${Math.round(Buffer.byteLength(salida) / 1024)} KB`);
}

// ───────────────────────── entrada ─────────────────────────

const COMANDOS = {
  comprobar: cmdComprobar, coste: cmdCoste, instalar: cmdInstalar, 'iniciar-repo': cmdIniciarRepo, modulos: cmdModulos,
  lanzar: cmdLanzar, 'registrar-obsidian': cmdRegistrarObsidian, omitir: cmdOmitir, empaquetar: cmdEmpaquetar,
};

const [, , nombreCmd, ...resto] = process.argv;
const cmd = COMANDOS[nombreCmd];
if (!cmd) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 15).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exitCode = nombreCmd ? 1 : 0;
} else {
  if (['comprobar', 'instalar', 'iniciar-repo', 'lanzar'].includes(nombreCmd)) anadirBinUv();
  try { cmd(args(resto)); } catch (e) { console.error(`kit-claude: ${e.message}`); process.exitCode = 1; }
}
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="plantillas/graphifyignore" sha256="b9644ef012efb3c1921b9d268b1e94fb18381a63e32c2d9054e75dc4e5bc85a6" -->
~~~~~~~~text
# .graphifyignore — generado por kit-claude. Local, no se versiona.
# Librerías de terceros, compilados y datos: no son código de este proyecto
# y multiplican el grafo sin aportar relaciones (medido: ~28 % de los PHP en un repo real).
vault/
graphify-out/
**/vendor/
**/node_modules/
assets/libraries/
assets/vendor/
**/bower_components/
**/PHPMailer/
**/phpmailer/
**/dompdf*/
**/tcpdf*/
**/fpdf*/
**/PhpSpreadsheet/
**/phpspreadsheet/
dist/
build/
storage/
cache/
uploads/
Uploads/
test-results/
playwright-report/
coverage/
*.min.js
*.min.css
*.map
*.lock
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="plantillas/htaccess" sha256="bfe8173b72ba238817c6329328bc21dfc5be5c12f1659635425dbe31bd75cfb8" -->
~~~~~~~~text
# kit-claude: esta carpeta es local (documentación / grafo). Nunca debe servirse por HTTP.
<IfModule mod_authz_core.c>
    Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
</IfModule>
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="plantillas/primer-inicio.md" sha256="dda81cd29853d13036daee00c74f04fcdddabcc90188eba1d70e69efc5614ad2" -->
~~~~~~~~text
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
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="plantillas/vault/10 - Tareas/Pendiente.md" sha256="b61b99489b47f1f59cb6d523ab652453f1e202e26d81b6a05df6b5f78a73d8eb" -->
~~~~~~~~text
# Pendiente

Mejoras detectadas fuera del alcance (💡), deuda técnica y decisiones abiertas.
Una línea por punto: fecha · módulo · qué · dónde (`archivo:línea`) · por qué importa.

~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="plantillas/vault/_INDICE.md" sha256="8e24a2d15d15e0cc27bfe6c4f68dc60d3e67048a0ad6b7d47b3841f913ce9d7d" -->
~~~~~~~~text
# Índice del vault — {{REPO}}

> Puerta de entrada. **Cada sesión lee esto primero y solo abre las notas del módulo
> en el que trabaja.** Mantenerlo corto: una línea por nota, con qué contiene.
> Local, fuera de git. Creado por kit-claude el {{FECHA}}.

## Estado

| Qué | Valor |
|---|---|
| Primer inicio | pendiente (ver `vault/_kit.json`) |
| Grafo | `graphify-out/graph.json` (se rehace en cada commit) |

## Módulos

| Módulo | Documentado | Notas |
|---|---|---|

## Notas por carpeta

### 00 - Proyecto
### 01 - Arquitectura
### 02 - Base de Datos
### 03 - Backend
### 04 - Frontend
### 05 - APIs
### 06 - Docker
### 07 - UI-UX
### 08 - Decisiones
### 09 - Bugs y soluciones
### 10 - Tareas
- [[Pendiente]] — mejoras fuera de alcance, deuda y decisiones abiertas.
### 11 - Cambios
### 12 - Testing
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="skills/actualizar-vault/SKILL.md" sha256="916855162ba260a70d60bb0476078c2748e8e06480bf8118694a4d5d69d7fd55" -->
~~~~~~~~text
---
name: actualizar-vault
description: "Documenta en vault/ un cambio ya cerrado, en un subagente aparte (no ocupa la conversación). Invocar al cerrar un cambio significativo, pasando como argumento el resumen: archivos:línea, tablas, decisión, porqué y commit."
argument-hint: "<resumen del cambio: archivos:línea, tablas, decisión y porqué, commit>"
context: fork
agent: general-purpose
model: sonnet
---

# Actualizar el vault del repositorio

Eres un subagente sin acceso a la conversación que te lanzó. Tu única tarea es dejar
documentado en `vault/` el cambio descrito aquí:

> $ARGUMENTS

El repositorio es el directorio de trabajo actual. Responde en español.

## Límites

- **Solo escribes dentro de `vault/`.** No tocas código, git, configuración ni `.env`.
- No releas el repositorio entero: parte del resumen. Abre código solo para confirmar un
  `archivo:línea` concreto que vayas a citar.
- Nada inventado: lo que no esté en el resumen ni hayas confirmado, no lo escribas.
- Nunca secretos, contraseñas, tokens, cadenas de conexión ni datos personales.
- Si `vault/` no existe, no lo crees: termina diciendo "repo sin vault".

## Pasos

1. Lee `vault/_INDICE.md` para saber qué notas existen.
2. Elige la carpeta: `01 - Arquitectura` (módulos y flujos) · `02 - Base de Datos` ·
   `03 - Backend` · `04 - Frontend` · `05 - APIs` · `06 - Docker` · `07 - UI-UX` ·
   `08 - Decisiones` (qué se decidió y por qué) · `09 - Bugs y soluciones` (síntoma →
   causa raíz → solución) · `12 - Testing`.
3. **Si ya hay una nota del tema, edítala con Edit** (no crees otra parecida). Si una
   decisión cambió, corrígela y deja una línea con la fecha del cambio. Si no existe,
   créala: una nota por concepto, con un título que se entienda solo.
4. Escribe el **porqué** (el qué ya lo dice el código), con `archivo:línea`, commit y
   fecha absoluta (AAAA-MM-DD). Enlaza notas relacionadas con `[[nota]]`.
5. Ajusta `vault/_INDICE.md`: una línea por nota nueva bajo su carpeta; si el cambio
   documenta un módulo, su fila en **Módulos**.
6. Añade al final de `vault/11 - Cambios/<fecha de hoy>.md` una entrada de 1–3 líneas.
7. Si el resumen trae mejoras fuera de alcance (💡), añádelas al final de
   `vault/10 - Tareas/Pendiente.md`: fecha · módulo · qué · dónde · por qué importa.
8. Devuelve **solo** la lista de notas creadas o editadas.

Otras sesiones pueden escribir a la vez: usa Edit y añade al final, no reescribas
archivos enteros.
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="skills/memoria-repo/SKILL.md" sha256="d7f04c5b113bd303d33926ed31e9c75bf609d7da4bacbf2eef2debd510305db8" -->
~~~~~~~~text
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
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="skills/strategic-compact/SKILL.md" sha256="fa8ae58d131277dd54e0cc2f1b80cb4349567aefbcc6decdd57960f09774bfec" -->
~~~~~~~~text
---
name: strategic-compact
description: "Cuándo compactar el contexto a mano (al cambiar de fase) en vez de esperar a la compactación automática."
metadata:
  origin: ECC
---

# Strategic Compact Skill

Suggests manual `/compact` at strategic points in your workflow rather than relying on arbitrary auto-compaction.

## When to Activate

- Running long sessions that approach context limits (200K+ tokens)
- Working on multi-phase tasks (research → plan → implement → test)
- Switching between unrelated tasks within the same session
- After completing a major milestone and starting new work
- When responses slow down or become less coherent (context pressure)

## Why Strategic Compaction?

Auto-compaction triggers at arbitrary points:
- Often mid-task, losing important context
- No awareness of logical task boundaries
- Can interrupt complex multi-step operations

Strategic compaction at logical boundaries:
- **After exploration, before execution** — Compact research context, keep implementation plan
- **After completing a milestone** — Fresh start for next phase
- **Before major context shifts** — Clear exploration context before different task

## How It Works

The `suggest-compact.js` script runs on PreToolUse (Edit/Write) and combines two signals:

1. **Context size (primary)** — Reads the latest `usage` record from the session transcript (`transcript_path` in the hook payload) and sums `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` (the true context size of the turn). Suggests `/compact` at a window-scaled threshold — 160k tokens on a 200k window, 250k on a 1M window (detected from a `[1m]` model marker, or inferred when observed tokens already exceed 200k) — and re-reminds after every additional 60k tokens of context growth
2. **Tool-call count (secondary)** — Counts tool invocations in session; suggests at a configurable threshold (default: 50 calls), then every 25 calls after

Tool count alone is a weak proxy for window pressure: a few large file reads or MCP responses can fill the window in very few calls, while many tiny calls can cross 50 with a near-empty window. The context-size signal fires when it actually matters.

## Hook Setup

**Installed as a plugin?** No setup is needed. The plugin's `hooks/hooks.json` already registers `suggest-compact.js` (hook id `pre:edit-write:suggest-compact`, active in the `standard` and `strict` hook profiles). Do not copy the block below into `~/.claude/settings.json` — `~/.claude/scripts/` does not exist on plugin installs, and duplicating a plugin hook causes double execution.

**If installed manually** (`./install.sh`), add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "node ~/.claude/scripts/hooks/suggest-compact.js" }]
      },
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "node ~/.claude/scripts/hooks/suggest-compact.js" }]
      }
    ]
  }
}
```

## Configuration

Environment variables:
- `COMPACT_THRESHOLD` — Tool calls before first suggestion (default: 50)
- `COMPACT_CONTEXT_THRESHOLD` — Context tokens before the context-size suggestion (default: 160000 on a 200k window, 250000 on a 1M window; `0` disables the context signal)
- `COMPACT_CONTEXT_INTERVAL` — Additional context tokens before the suggestion repeats (default: 60000)
- `COMPACT_STATE_TTL_DAYS` — Days before stale per-session state files in the temp dir are swept (default: 14)
- `ECC_CONTEXT_WINDOW_TOKENS` — Explicit context-window size, in tokens, overriding auto-detection. Set this for large-window models whose reported id lacks a `[1m]` marker (e.g. 400k Opus 4.x, or a new 1M-window model family) so the threshold scales to the real window instead of defaulting to 200k and overstating context usage.
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` — Claude Code's native window-size override, in tokens; honored as a fallback when `ECC_CONTEXT_WINDOW_TOKENS` is unset.

> The context window is otherwise auto-detected from a `[1m]` model marker or inferred when observed tokens already exceed 200k. On a large-window model that carries neither signal, set one of the overrides above so the `/compact` suggestion fires at the right point.

## Compaction Decision Guide

Use this table to decide when to compact:

| Phase Transition | Compact? | Why |
|-----------------|----------|-----|
| Research → Planning | Yes | Research context is bulky; plan is the distilled output |
| Planning → Implementation | Yes | Plan is written down (a file, or the task list if you have one); free up context for code |
| Implementation → Testing | Maybe | Keep if tests reference recent code; compact if switching focus |
| Debugging → Next feature | Yes | Debug traces pollute context for unrelated work |
| Mid-implementation | No | Losing variable names, file paths, and partial state is costly |
| After a failed approach | Yes | Clear the dead-end reasoning before trying a new approach |

## What Survives Compaction

Understanding what persists helps you compact with confidence:

| Persists | Lost |
|----------|------|
| CLAUDE.md instructions | Intermediate reasoning and analysis |
| Files on disk | File contents you previously read |
| Memory files (`~/.claude/memory/`) | Multi-step conversation context |
| Git state (commits, branches) | Tool call history and counts |
| The task list — **only if you have the todo tools** (see below) | Nuanced user preferences stated verbally |

> ### Don't rely on the task list surviving — it may not exist
>
> Claude Code **2.1.233 removed the todo/task tools by default** on Opus 4.8, Sonnet 5,
> Fable 5, Mythos 5 and newer models (`TodoWrite`, `TaskCreate/Get/Update/List`).
> `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` brings them back, but that is a per-machine
> environment setting — **it does not travel with this skill**, so you cannot assume the
> reader has it.
>
> This matters because "my todo list survives compaction" is a reason people compact
> *instead of* writing state down. If the tools are absent there is no list to survive,
> and the plan is simply gone. **Write the plan to a file before compacting** — a file
> persists on every version and every model. Treat the task list as a convenience that
> may be missing, never as your durable record.

## Best Practices

1. **Compact after planning** — Once the plan is finalized **and written to a file**, compact to start fresh
2. **Compact after debugging** — Clear error-resolution context before continuing
3. **Don't compact mid-implementation** — Preserve context for related changes
4. **Read the suggestion** — The hook tells you *when*, you decide *if*
5. **Write before compacting** — Save important context to files or memory before compacting
6. **Use `/compact` with a summary** — Add a custom message: `/compact Focus on implementing auth middleware next`

## Token Optimization Patterns

### Trigger-Table Lazy Loading
Instead of loading full skill content at session start, use a trigger table that maps keywords to skill paths. Skills load only when triggered, reducing baseline context by 50%+:

| Trigger | Skill | Load When |
|---------|-------|-----------|
| "test", "tdd", "coverage" | tdd-workflow | User mentions testing |
| "security", "auth", "xss" | security-review | Security-related work |
| "deploy", "ci/cd" | deployment-patterns | Deployment context |

### Context Composition Awareness
Monitor what's consuming your context window:
- **CLAUDE.md files** — Always loaded, keep lean
- **Loaded skills** — Each skill adds 1-5K tokens
- **Conversation history** — Grows with each exchange
- **Tool results** — File reads, search results add bulk

### Duplicate Instruction Detection
Common sources of duplicate context:
- Same rules in both `~/.claude/rules/` and project `.claude/rules/`
- Skills that repeat CLAUDE.md instructions
- Multiple skills covering overlapping domains

### Context Optimization Tools
- `token-optimizer` MCP — Automated 95%+ token reduction via content deduplication
- `context-mode` — Context virtualization (315KB to 5.4KB demonstrated)

## Related

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) — Token optimization section
- Memory persistence hooks — For state that survives compaction
- `continuous-learning` skill — Extracts patterns before session ends
~~~~~~~~
<!-- /kit-archivo -->

<!-- kit-archivo ruta="version.json" sha256="fe7ba59a52b6fe7df9bfe6b10dee05419044523d7ab73e8e8de6b0bff69acd18" -->
~~~~~~~~text
{
  "version": "2.0.0",
  "fecha": "2026-09-16"
}
~~~~~~~~
<!-- /kit-archivo -->
