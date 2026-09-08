#!/usr/bin/env bun
import { existsSync, unlinkSync, rmSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import net from "node:net";

const rootDir = resolve(import.meta.dir, "..");
const dataDir = resolve(rootDir, "backend", "data");
const dbPath = resolve(dataDir, "divorcio360.db");
const walPath = resolve(dataDir, "divorcio360.db-wal");
const shmPath = resolve(dataDir, "divorcio360.db-shm");

const colors = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

function checkPort(port: number): Promise<boolean> {
  return new Promise((res) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" });
    socket.setTimeout(400);
    socket.on("connect", () => {
      socket.destroy();
      res(true);
    });
    socket.on("error", () => res(false));
    socket.on("timeout", () => {
      socket.destroy();
      res(false);
    });
  });
}

async function killPort(port: number) {
  try {
    if (process.platform === "win32") {
      Bun.spawnSync([
        "powershell",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }`
      ]);
    } else {
      Bun.spawnSync(["bash", "-c", `fuser -k ${port}/tcp 2>/dev/null || lsof -ti:${port} | xargs -r kill -9 2>/dev/null || true`]);
    }
  } catch {
    // Ignore errors
  }
}

async function resetDb() {
  console.log(`\n${colors.bold(colors.cyan("🔄 LegalStation — Reinicio de Base de Datos y Seed"))}`);
  console.log(colors.dim("───────────────────────────────────────────────────"));

  // Check if API is running
  const isApiRunning = await checkPort(8080);
  if (isApiRunning) {
    console.log(`${colors.yellow("⚠")} La API Go está corriendo en el puerto 8080. Deteniendo proceso para liberar SQLite...`);
    await killPort(8080);
    // Short delay to let OS release file locks
    await Bun.sleep(500);
  }

  let deletedCount = 0;
  const filesToDelete = [dbPath, walPath, shmPath];

  for (const file of filesToDelete) {
    if (existsSync(file)) {
      try {
        unlinkSync(file);
        deletedCount++;
        console.log(`  ${colors.green("✓")} Eliminado: ${colors.dim(file)}`);
      } catch (err: any) {
        console.log(`  ${colors.red("✖")} Error al eliminar ${file}: ${err.message}`);
      }
    }
  }

  if (deletedCount === 0) {
    console.log(`  ${colors.cyan("ℹ")} No se encontró base de datos previa en: ${colors.dim(dbPath)}`);
  }

  console.log(`\n${colors.green("✔ Base de datos reseteada con éxito.")}`);
  console.log(`Al iniciar el backend con ${colors.bold(colors.cyan("bun run dev"))}, se creará automáticamente el seed demo:`);
  console.log(`  • Caso #1: Divorcio360 en estado ${colors.bold("03 — Revisión jurídica")}`);
  console.log(`  • Usuarios: ${colors.cyan("cliente@demo.ec")}, ${colors.cyan("abogado@demo.ec")}, ${colors.cyan("notario@demo.ec")} (pass: ${colors.cyan("demo1234")})\n`);
}

resetDb();
