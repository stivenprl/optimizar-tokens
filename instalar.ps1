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
