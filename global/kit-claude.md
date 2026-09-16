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
