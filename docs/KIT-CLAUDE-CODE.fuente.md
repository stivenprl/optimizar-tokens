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
