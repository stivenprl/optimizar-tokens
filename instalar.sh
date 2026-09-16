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
