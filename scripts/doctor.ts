#!/usr/bin/env bun
import net from "node:net";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dir, "..");
const backendDir = resolve(rootDir, "backend");
const frontendDir = resolve(rootDir, "frontend");

const colors = {
  reset: "\x1b[0m",
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
      res(true); // Occupied
    });
    socket.on("error", () => res(false)); // Free
    socket.on("timeout", () => {
      socket.destroy();
      res(false);
    });
  });
}

async function runDoctor() {
  console.log(`\n${colors.bold(colors.cyan("🔍 LegalStation — Diagnóstico del Entorno (Bun)"))}`);
  console.log(colors.dim("───────────────────────────────────────────────────"));

  let hasErrors = false;

  // 1. Check Bun
  console.log(`\n${colors.bold("1. Entorno de Ejecución:")}`);
  console.log(`  ${colors.green("✓")} Bun: ${colors.bold(Bun.version)} (OK)`);

  // 2. Check Go
  try {
    const goCheck = Bun.spawnSync(["go", "version"]);
    if (goCheck.exitCode === 0) {
      const goVer = goCheck.stdout.toString().trim();
      console.log(`  ${colors.green("✓")} Go: ${colors.bold(goVer)} (OK)`);
    } else {
      console.log(`  ${colors.red("✖")} Go no está instalado o no se encuentra en el PATH.`);
      hasErrors = true;
    }
  } catch {
    console.log(`  ${colors.red("✖")} Error al ejecutar 'go'. Asegúrate de tener Go 1.22+ instalado.`);
    hasErrors = true;
  }

  // 3. Check Frontend Dependencies
  console.log(`\n${colors.bold("2. Dependencias del Frontend:")}`);
  const nodeModulesExists = existsSync(resolve(frontendDir, "node_modules"));
  const packageJsonExists = existsSync(resolve(frontendDir, "package.json"));

  if (packageJsonExists && nodeModulesExists) {
    console.log(`  ${colors.green("✓")} node_modules presentes en /frontend.`);
  } else {
    console.log(`  ${colors.yellow("⚠")} Faltan dependencias en /frontend. Ejecuta: ${colors.cyan("bun run setup")}`);
    hasErrors = true;
  }

  // 4. Check Backend Mod
  console.log(`\n${colors.bold("3. Módulos del Backend:")}`);
  const goModExists = existsSync(resolve(backendDir, "go.mod"));
  if (goModExists) {
    console.log(`  ${colors.green("✓")} go.mod encontrado en /backend.`);
  } else {
    console.log(`  ${colors.red("✖")} No se encontró backend/go.mod.`);
    hasErrors = true;
  }

  // 5. Check Ports
  console.log(`\n${colors.bold("4. Disponibilidad de Puertos:")}`);
  const port8080Busy = await checkPort(8080);
  const port4200Busy = await checkPort(4200);

  if (port8080Busy) {
    console.log(`  ${colors.yellow("⚠")} Puerto 8080 (API Go): ${colors.yellow("OCUPADO")} (un proceso ya está escuchando aquí).`);
  } else {
    console.log(`  ${colors.green("✓")} Puerto 8080 (API Go): ${colors.green("LIBRE")}`);
  }

  if (port4200Busy) {
    console.log(`  ${colors.yellow("⚠")} Puerto 4200 (Angular UI): ${colors.yellow("OCUPADO")} (un proceso ya está escuchando aquí).`);
  } else {
    console.log(`  ${colors.green("✓")} Puerto 4200 (Angular UI): ${colors.green("LIBRE")}`);
  }

  // 6. Check Database & Storage
  console.log(`\n${colors.bold("5. Almacenamiento y Base de Datos:")}`);
  const dbExists = existsSync(resolve(backendDir, "data", "divorcio360.db"));
  const uploadsExists = existsSync(resolve(backendDir, "uploads"));

  if (dbExists) {
    console.log(`  ${colors.green("✓")} Base de datos SQLite inicializada en backend/data/divorcio360.db.`);
  } else {
    console.log(`  ${colors.cyan("ℹ")} Base de datos aún no creada (se generará automáticamente con el seed al iniciar).`);
  }

  if (uploadsExists) {
    console.log(`  ${colors.green("✓")} Directorio de uploads existente.`);
  } else {
    console.log(`  ${colors.cyan("ℹ")} Directorio de uploads se creará al iniciar la API.`);
  }

  console.log(colors.dim("\n───────────────────────────────────────────────────"));
  if (!hasErrors) {
    console.log(`${colors.green(colors.bold("🎉 ¡Todo listo para arrancar!"))} Ejecuta: ${colors.bold(colors.cyan("bun run dev"))}\n`);
  } else {
    console.log(`${colors.yellow(colors.bold("⚠ Se detectaron algunos avisos."))} Revisa los pasos indicados arriba.\n`);
  }
}

runDoctor();
