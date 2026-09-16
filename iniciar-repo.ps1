# kit-claude — prepara un repositorio (Windows). Equivale a: node kit.mjs iniciar-repo <ruta>
# Uso:  powershell -ExecutionPolicy Bypass -File iniciar-repo.ps1 [ruta] [--sin-obsidian] [--sin-hook]
& node "$PSScriptRoot\kit.mjs" iniciar-repo @args
exit $LASTEXITCODE
