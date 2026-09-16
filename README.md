# Optimizar tokens en Claude Code

**Un kit para gastar menos tokens y menos tiempo en jornadas largas con
[Claude Code](https://code.claude.com)**: memoria local por repositorio (vault de Obsidian +
grafo de Graphify), reglas de lectura medidas y compactación por fases.

Se instala entregándole **un solo archivo** a Claude Code:
[`KIT-CLAUDE-CODE.md`](KIT-CLAUDE-CODE.md).

---

## Resultados medidos

**El mismo trabajo, cuatro configuraciones.** Mismo modelo (Claude Sonnet), misma aplicación
PHP + MySQL en producción, **5 tareas reales × 3 repeticiones × 4 configuraciones = 60
sesiones**. Un revisor independiente (Claude Opus) calificó **a ciegas** el código escrito.

| Configuración | Tokens | Coste (API) | Tiempo | Calidad del código (juez /10) |
|---|---:|---:|---:|---:|
| **A** · Claude Code sin nada | 4,17 M | 2,08 USD | 10,4 min | 8,2 |
| **B** · **Este kit** (vault + Graphify) | **2,07 M (−50 %)** | **1,03 USD (−50 %)** | **4,0 min (−61 %)** | **9,5** |
| **C** · [Ponytail](https://github.com/DietrichGebert/ponytail) | 3,09 M (−26 %) | 1,57 USD (−25 %) | 6,9 min (−34 %) | 8,3 |
| **D** · Kit + Ponytail | 2,06 M (−51 %) | 0,98 USD (−53 %) | 3,6 min (−65 %) | 8,5 |

<sub>Una pasada por las 5 tareas, media de 3 repeticiones. Porcentajes frente a A. Tokens
incluyendo subagentes.</sub>

### ¿En qué tipo de tarea ahorra cada uno?

Cómo leerlo: **−88 %** = la misma respuesta correcta costó unas **8 veces menos tokens** que
Claude sin nada. **+17 %** = costó un 17 % **más**.

| Si le pides a Claude… | Ejemplo real de la prueba | Kit | Ponytail | Kit + Ponytail |
|---|---|---:|---:|---:|
| **Encontrar dónde se usa algo** | «¿Qué archivos modifican la tabla de clientes?» | ✅ **−88 %** | ✅ −81 % | ✅ −80 % |
| **Entender cómo funciona algo** | «¿Quién recibe un aviso y por qué?» | ✅ **−37 %** | ❌ +20 % | ✅ **−43 %** |
| **Recuperar por qué se hizo algo** | «¿Qué hace falta para registrar una migración?» | ✅ **−51 %** | ⚠️ −29 % con respuestas incompletas | ✅ −34 % |
| **Un cambio pequeño en un archivo** | «Limita la longitud de dos campos» | ❌ +17 % | ❌ +11 % | ❌ +24 % |
| **Crear un archivo nuevo siguiendo un patrón** | «Crea un endpoint que cuente clientes, como este otro» | ✅ −29 % | ✅ −23 % | ✅ **−52 %** |

**En resumen:**

- **El kit ahorra sobre todo cuando Claude tendría que leer para entender el proyecto**
  (−37 % a −88 %). Sin memoria, Claude recorre el código a ciegas.
- **Ponytail está pensado para escribir menos código**, no para leer menos: creando el
  endpoint escribió un 13 % menos de líneas; leyendo, su efecto fue desigual.
- **Juntos dan el menor consumo total**, pero **el kit solo tuvo la mejor calidad** (9,5). La
  diferencia: al limitar longitudes, las 3 sesiones del kit contaron caracteres
  (`mb_strlen`, correcto con tildes) y casi todas las demás contaron bytes (`strlen`), que
  rechaza textos válidos con acentos.
- **En cambios pequeños ninguno ahorra** (+11 % a +24 %): hay poco que leer y pesa el coste fijo.

**Coste fijo del kit:** +1.404 tokens por petición frente a Claude Code recién instalado.

> **Cuánto fiarse:** un solo proyecto bien documentado y 3 repeticiones. Las diferencias
> grandes son consistentes entre repeticiones; las de ±20 % pueden ser variación.
> Metodología, rangos y juez en la sección 6 de [`KIT-CLAUDE-CODE.md`](KIT-CLAUDE-CODE.md).

---

## Historial de mediciones

Medido en la instalación real de un desarrollador a jornada completa (4 proyectos PHP +
MySQL, anonimizados). Detalle completo en la sección 6 del documento.

### Consumo diario real

| Día | Peticiones al modelo | De subagentes | Contexto medio por petición |
|---|---:|---:|---:|
| 8 sep | 2.193 | 0 | 533 k |
| 10 sep | 3.863 | 2.064 | 409 k |
| 11 sep | 5.826 | 2.467 | 286 k |
| 14 sep | 5.115 | 707 | 307 k |
| 15 sep | 3.706 | 623 | 356 k |

**Cada petición arrastra 300.000–530.000 tokens de contexto.** En jornadas largas lo que más
gasta es la conversación acumulada, no las reglas: por eso importan `/compact`, `/clear` y el vault.

### Lo que costaba cada extensión

| Extensión | Coste | Qué se hizo |
|---|---|---|
| Superpowers | ~690 tokens fijos + ~900 estimados al iniciar cada sesión | Apagado |
| `CLAUDE.md` personal de 29,8 KB | ~13.500 tokens estimados en cada petición | Carga bajo demanda |
| Índice de memoria de 13,2 KB | ~5.400 tokens medidos en cada petición | Reducido a 7,1 KB |
| Skills con descripciones largas (ui-ux-pro-max, clean-code-guard) | ~370 y ~430 estimados | Solo nombre |
| security-guidance | 0 tokens, pero varios revisores en cada commit (~2,5 GB de RAM) | Revisiones desactivadas |
| Hookify | 0 tokens, pero ~220 ms en **cada** llamada a herramienta | No se usa |

### Antes y después (tokens por petición, medidos con la API)

| Dónde | Inicio | Final | Ahorro |
|---|---:|---:|---:|
| Carpeta personal | 56.568 | 39.914 | **−29 %** |
| Proyecto con instrucciones de 27,5 KB | ~63.650 | 40.093 | **−37 %** |
| Otros 3 proyectos | ~53.600–56.300 | 38.494–40.506 | −28 % |

### Evolución de este kit

| Versión | Qué cargaba | Coste fijo por petición |
|---|---|---:|
| Primer diseño | Todas las reglas de ingeniería siempre | +15.200 |
| v1 | Reglas por tipo de archivo y skills por fase | +2.777 (hasta +18.000 en tareas) |
| **v2 (actual)** | Solo ahorro: reglas de lectura + vault + grafo + compactación | **+1.404** |

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
