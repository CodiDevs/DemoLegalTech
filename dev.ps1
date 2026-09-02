# LegalStation — Script de inicio rápido con Bun (PowerShell / Windows)

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Bun no está instalado o no se encuentra en el PATH." -ForegroundColor Red
    Write-Host "    Instálalo con: powershell -c `"irm bun.sh/install.ps1 | iex`"" -ForegroundColor Yellow
    Exit 1
}

bun run dev $args
