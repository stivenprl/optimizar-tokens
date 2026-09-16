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
