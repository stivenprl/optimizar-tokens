#!/usr/bin/env bash
# kit-claude — prepara un repositorio (macOS/Linux). Equivale a: node kit.mjs iniciar-repo <ruta>
# Uso:  bash iniciar-repo.sh [ruta] [--sin-obsidian] [--sin-hook]
exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/kit.mjs" iniciar-repo "$@"
