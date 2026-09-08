#!/usr/bin/env bash
set -e

# LegalStation — Script de inicio rápido con Bun

if ! command -v bun &> /dev/null; then
    echo "[!] Bun no está instalado o no se encuentra en el PATH."
    echo "    Instálalo ejecutando: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Pasar todos los argumentos al orchestrator de Bun
exec bun run dev "$@"
