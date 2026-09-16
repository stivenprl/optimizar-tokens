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

Se hizo **el mismo trabajo** con cuatro configuraciones de Claude Code: mismo modelo
(Claude Sonnet), misma aplicación PHP + MySQL en producción, **5 tareas reales × 3
repeticiones × 4 configuraciones = 60 sesiones**. Un revisor independiente (Claude Opus)
calificó **a ciegas** el código que escribió cada una, sin saber de qué configuración venía.

| Configuración | Tokens consumidos | Coste (API) | Tiempo | Calidad del código (juez, sobre 10) |
|---|---:|---:|---:|---:|
| **A** · Claude Code sin nada | 4,17 M | 2,08 USD | 10,4 min | 8,2 |
| **B** · **Este kit** (vault + Graphify) | **2,07 M (−50 %)** | **1,03 USD (−50 %)** | **4,0 min (−61 %)** | **9,5** |
| **C** · [Ponytail](https://github.com/DietrichGebert/ponytail) | 3,09 M (−26 %) | 1,57 USD (−25 %) | 6,9 min (−34 %) | 8,3 |
| **D** · Kit + Ponytail | 2,06 M (−51 %) | 0,98 USD (−53 %) | 3,6 min (−65 %) | 8,5 |

*Valores de una pasada por las 5 tareas (media de las 3 repeticiones). Los porcentajes son
frente a A.*

### ¿En qué tipo de tarea ahorra cada uno?

Cómo leer la tabla: **−88 %** significa que la misma respuesta correcta costó unas **8 veces
menos tokens** que Claude sin nada; **+17 %** significa que costó un 17 % **más**.

| Si le pides a Claude… | Ejemplo real de la prueba | Kit | Ponytail | Kit + Ponytail |
|---|---|---:|---:|---:|
| **Encontrar dónde se usa algo** | «¿Qué archivos modifican la tabla de clientes?» | ✅ **−88 %** | ✅ −81 % | ✅ −80 % |
| **Entender cómo funciona algo** (recorre varias funciones) | «¿Quién recibe un aviso y por qué?» | ✅ **−37 %** | ❌ +20 % | ✅ **−43 %** |
| **Recuperar por qué se hizo algo** (está documentado) | «¿Qué hace falta para registrar una migración?» | ✅ **−51 %** | ⚠️ −29 %, pero respuestas incompletas (78 % de aciertos) | ✅ −34 % |
| **Un cambio pequeño en un archivo** | «Limita la longitud de dos campos» | ❌ +17 % | ❌ +11 % | ❌ +24 % |
| **Crear un archivo nuevo siguiendo un patrón** | «Crea un endpoint que cuente clientes, como este otro» | ✅ −29 % | ✅ −23 % | ✅ **−52 %** |

**Qué significa en la práctica:**

- **El kit ahorra sobre todo cuando Claude tendría que leer para entender** el proyecto:
  entre un 37 % y un 88 % menos. Sin memoria, Claude recorre el código a ciegas, a veces con
  subagentes que leen decenas de archivos.
- **Ponytail está pensado para escribir menos código**, no para leer menos. Al leer, su
  efecto es desigual; al crear el endpoint escribió un 13 % menos de líneas (32 frente a 37).
- **Juntos consiguen el menor consumo total**, pero la calidad del kit solo fue mayor
  (9,5 frente a 8,5). La diferencia vino de un detalle: en el cambio de longitudes, las 3
  sesiones del kit contaron **caracteres** (`mb_strlen`, correcto con tildes y ñ) y la
  mayoría de las demás contaron **bytes** (`strlen`), que rechaza textos válidos con acentos.
  Posiblemente influyó que el vault del proyecto documenta un problema previo de acentos
  (sin verificar).
- **En cambios pequeños y localizados ninguno ahorra** (+11 % a +24 %): hay poco que leer y
  pesa más el coste fijo de las reglas.

**Coste fijo del kit:** +1.404 tokens por petición frente a un Claude Code recién instalado
(el ~0,5 % de una petición típica de una jornada real, de ~300.000 tokens de contexto).

> **Cuánto fiarse:** 3 repeticiones por tarea en un solo proyecto, con buena
> documentación. Las diferencias grandes (−50 % en total, −88 % al buscar) son consistentes
> entre repeticiones; las pequeñas (±20 %) pueden ser variación. Detalle completo, rangos e
> historial de mediciones en la [sección 6](#6-mediciones-completas).

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

Todas del 16 sep 2026 con la API de Anthropic: tokens de entrada **incluidos los
subagentes** (`modelUsage` de `claude -p --output-format json`; el campo `usage` solo cuenta
la sesión principal y engaña) y coste equivalente de la API.

### Experimento 2: sin nada · kit · Ponytail · kit + Ponytail

**Montaje**

- **Proyecto:** aplicación web PHP + MySQL en producción (~25.800 nodos de grafo, vault de
  290 notas con índice).
- **Aislamiento:** cada sesión en una copia limpia del repositorio, sin reglas, skills,
  plugins ni memoria del usuario (`--setting-sources project --strict-mcp-config`,
  `claudeMdExcludes`, `skillOverrides: off`, `autoMemoryEnabled: false`). Mismo modelo
  (Sonnet), mismas herramientas.
- **Configuraciones:** A sin nada · B reglas del kit + `vault/` con índice + grafo recién
  construido + skills del kit · C Ponytail 4.10.0 (commit `e3ba2aa`) cargado con
  `--plugin-dir`, con su activación verificada · D = B + C.
- **Tareas:** 3 de análisis (T1 buscar escrituras en una tabla, T2 entender el flujo de
  avisos, T3 recuperar cómo se registra una migración) y 2 de implementación (I1 limitar la
  longitud de dos campos en un guardado existente, I2 crear un endpoint siguiendo un patrón).
- **Calidad:** en análisis, comprobación contra la verdad extraída del código; en
  implementación, `php -l` (24/24 correctos) y juez Opus a ciegas (IDs aleatorios).
- **Independencia:** tras cada implementación se restauraron la copia y el vault.

**Resultados por tarea** (media de 3 repeticiones; entre paréntesis, mínimo–máximo de tokens)

| Tarea | Config. | Tokens | Coste | Tiempo | Turnos | Calidad | Líneas escritas |
|---|---|---:|---:|---:|---:|---:|---:|
| T1 buscar | A | 1.180 k (308–2.219) | 0,61 USD | 196 s | 4 | 100 % | — |
| | B | **145 k** (98–204) | **0,07** | **29 s** | 4 | 100 % | — |
| | C | 225 k (104–396) | 0,13 | 50 s | 13 | 100 % | — |
| | D | 232 k (178–294) | 0,10 | 29 s | 7 | 100 % | — |
| T2 entender | A | 1.276 k (964–1.777) | 0,66 | 189 s | 1 | 100 % | — |
| | B | 798 k (446–1.132) | 0,37 | 89 s | 15 | 100 % | — |
| | C | 1.533 k (1.098–2.298) | 0,73 | 190 s | 1 | 100 % | — |
| | D | **723 k** (691–775) | **0,31** | **79 s** | 16 | 100 % | — |
| T3 recuperar | A | 772 k (425–1.177) | 0,41 | 158 s | 2 | 94 % | — |
| | B | **376 k** (298–475) | **0,23** | **51 s** | 11 | 100 % | — |
| | C | 548 k (378–861) | 0,36 | 98 s | 5 | 78 % | — |
| | D | 510 k (375–639) | 0,27 | 55 s | 15 | 100 % | — |
| I1 cambio pequeño | A | **184 k** (148–235) | **0,09** | **18 s** | 5 | juez 7,0 | 16 |
| | B | 216 k (173–261) | 0,10 | 21 s | 6 | **juez 9,0** | 17 |
| | C | 204 k (178–254) | 0,09 | 18 s | 6 | juez 7,7 | 16 |
| | D | 229 k (200–270) | 0,12 | 19 s | 6 | juez 7,7 | 16 |
| I2 archivo nuevo | A | 758 k (577–883) | 0,32 | 60 s | 15 | juez 9,3 | 37 |
| | B | 537 k (447–628) | 0,25 | 52 s | 11 | **juez 10,0** | 36 |
| | C | 581 k (458–732) | 0,26 | 56 s | 12 | juez 9,0 | **32** |
| | D | **361 k** (315–402) | **0,19** | **33 s** | 9 | juez 9,3 | 34 |

**Por bloque** (una pasada; frente a A)

| Config. | Análisis (T1–T3) | Implementación (I1–I2) | Juez medio |
|---|---|---|---:|
| A | 3,23 M · 1,68 USD · 9,1 min | 0,94 M · 0,41 USD · 1,3 min | 8,2 |
| B | 1,32 M (**−59 %**) · 0,68 USD · 2,8 min | 0,75 M (−20 %) · 0,35 USD · 1,2 min | **9,5** |
| C | 2,31 M (−29 %) · 1,22 USD · 5,6 min | 0,79 M (−17 %) · 0,34 USD · 1,2 min | 8,3 |
| D | 1,47 M (−55 %) · 0,68 USD · 2,7 min | **0,59 M (−37 %)** · 0,30 USD · 0,9 min | 8,5 |

**Qué vio el juez:** en I2 los 12 endpoints fueron correctos y seguros (guardia de sesión,
control de acceso, consulta preparada); solo variaron detalles como el código de error. En
I1, 7 de 12 contaron bytes (`strlen`) en lugar de caracteres, lo que rechaza textos válidos
con tildes: B 0 de 3, A 3 de 3, C 2 de 3 y D 2 de 3.

**Limitaciones:** un solo proyecto, bien documentado; 3 repeticiones con variación alta en
A (T1 osciló entre 308 k y 2,2 M según lanzara o no subagentes); tareas de análisis y cambios
pequeños, no desarrollos largos. Ponytail anuncia su mayor efecto en tareas donde el agente
tiende a construir de más, que aquí no se probaron.

### Experimento 1 (previo): sin nada frente a vault + Graphify

3 tareas de análisis × 2 repeticiones, con una nota de 5 líneas en lugar de las reglas del kit.
Resultado: **−40 % de tokens, −33 % de coste y −36 % de tiempo**, con la misma calidad. La
búsqueda simple salió **+56 %**, lo que llevó a la regla «si un grep lo resuelve, no uses
vault ni grafo». En el experimento 2, con esa regla, esa misma tarea pasó a **−88 %**.

### Carga fija frente a un Claude recién instalado

| Configuración (sesión vacía) | Tokens por petición | Diferencia |
|---|---:|---:|
| Claude Code recién instalado | 29.178 | — |
| **Kit v2 (este)** | 30.582 | **+1.404** |
| Kit v1: reglas completas bajo demanda | — | +2.777 fijos, hasta +18.000 durante una tarea |
| Primer diseño: todo cargado siempre | — | +15.200 |

### Historial de mediciones en un equipo de trabajo real

Mediciones sobre la instalación de un desarrollador a jornada completa, con 4 proyectos
PHP + MySQL (anonimizados).

**1. Consumo diario real** (transcripciones de Claude Code, peticiones al modelo)

| Día | Peticiones | De subagentes | Contexto leído de caché | Contexto medio por petición |
|---|---:|---:|---:|---:|
| 8 sep | 2.193 | 0 | 1.162 M | 533 k |
| 10 sep | 3.863 | 2.064 | 1.565 M | 409 k |
| 11 sep | 5.826 | 2.467 | 1.630 M | 286 k |
| 14 sep | 5.115 | 707 | 1.545 M | 307 k |
| 15 sep | 3.706 | 623 | 1.308 M | 356 k |
| 16 sep¹ | 2.395 | 357 | 908 M | 383 k |

¹ Incluye las sesiones de estas mediciones.

La lección: **cada petición arrastra de media 300.000–530.000 tokens de contexto**. En
jornadas largas, lo que más consume no son las reglas sino la conversación acumulada; de ahí
las reglas de la sección 5.

**2. Coste de cada extensión** (tokens fijos en cada petición)

| Extensión | Coste fijo | Otros efectos | Decisión |
|---|---:|---|---|
| Superpowers (14 skills) | ~690 (`claude plugin details`) + ~900 estimados del texto que inyecta al iniciar | Instrucciones que chocaban con el flujo propio | Apagado |
| `CLAUDE.md` personal completo (29,8 KB) | ~13.500 (estimado a 2,2 caracteres/token, ratio medido en español) | — | Pasado a carga bajo demanda |
| Skill ui-ux-pro-max (descripción de 822 caracteres) | ~370 (estimado) | El instalador añade 6 skills más, una choca con una integrada | Solo nombre |
| Skill clean-code-guard (descripción de 953 caracteres) | ~430 (estimado) | — | Solo nombre |
| frontend-design | ~80 | — | — |
| context7, warp | ~0 | context7: herramientas diferidas | — |
| security-guidance | ~0 | Lanza varios revisores en paralelo en cada commit (~2,5 GB de RAM) | Revisiones desactivadas |
| Hookify | 0 tokens | ~220 ms en **cada** llamada a herramienta, aunque no tenga reglas | No se usa |
| Índice de memoria (`MEMORY.md`, 13,2 KB) | ~5.400 (medido) | — | Reducido a 7,1 KB |
| MCP de LightRAG en 3 proyectos | Herramientas en cada sesión | Índice vacío: el equipo no podía indexar | Retirado |

**3. Evolución de la configuración** (tokens de entrada de una sesión vacía, medidos con la API)

Cambios medidos juntos en la columna central: `CLAUDE.md` bajo demanda, Superpowers apagado y
skills de terceros solo con nombre (−13.926 tokens por petición).

| Dónde | Inicio | Tras esos cambios | + instrucciones de proyecto bajo demanda | Ahorro |
|---|---:|---:|---:|---:|
| Carpeta neutra | 51.170 | 37.244 | — | **−27 %** |
| Carpeta personal (con memoria) | 56.568 | 42.645 | 39.914 | **−29 %** |
| Proyecto 1 (instrucciones de 27,5 KB) | ~63.650 | 49.728 | 40.093 | **−37 %** |
| Proyecto 2 | ~56.300 | 42.385 | 40.506 | −28 % |
| Proyecto 3 | ~54.000 | 40.117 | 39.033 | −28 % |
| Proyecto 4 | ~53.600 | 39.640 | 38.494 | −28 % |

Las cifras con «~» se obtienen sumando al valor medido el ahorro global medido (13.926 tokens).

**4. Evolución del kit**

| Versión | Qué cargaba | Coste fijo por petición |
|---|---|---:|
| Primer diseño | Todas las reglas de ingeniería siempre | +15.200 |
| v1 | Núcleo + reglas por tipo de archivo + skills por fase | +2.777 (hasta +18.000 durante una tarea) |
| **v2 (actual)** | Solo ahorro: reglas de lectura + vault + grafo + compactación | **+1.404** |

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
