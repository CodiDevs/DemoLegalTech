#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import net from "node:net";

const rootDir = resolve(import.meta.dir, "..");
const backendDir = resolve(rootDir, "backend");
const frontendDir = resolve(rootDir, "frontend");

const colors = {
  reset: "\x1b[0m",
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

// Prefixes
const PREFIX_SYS = colors.yellow(colors.bold("[SYSTEM]  "));
const PREFIX_API = colors.cyan(colors.bold("[BACKEND] "));
const PREFIX_UI = colors.magenta(colors.bold("[FRONTEND]"));

const activeProcesses: any[] = [];
let isShuttingDown = false;

// Helper: Check if a port is in use
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

// Helper: Kill any processes occupying a port
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

// Stream child process output line-by-line with colored prefix
async function streamLines(
  stream: ReadableStream<Uint8Array> | null,
  prefix: string,
  filterEmpty = true
) {
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!filterEmpty || line.trim() !== "") {
          console.log(`${prefix} ${line}`);
        }
      }
    }
    if (buffer.trim() !== "") {
      console.log(`${prefix} ${buffer}`);
    }
  } catch {
    // Stream closed
  }
}

// Poll backend health endpoint
async function waitForBackendReady(maxWaitMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (isShuttingDown) return false;
    try {
      const res = await fetch("http://localhost:8080/api/v1/health");
      if (res.ok) {
        const data = await res.json() as any;
        if (data && data.ok) {
          return true;
        }
      }
    } catch {
      // not ready yet
    }
    await Bun.sleep(400);
  }
  return false;
}

// Clean graceful shutdown
async function cleanup(signal?: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${PREFIX_SYS} ${colors.yellow(`Deteniendo todos los servicios (${signal || "exit"})...`)}`);

  for (const proc of activeProcesses) {
    try {
      proc.kill();
    } catch {}
  }

  // Ensure ports are freed
  await killPort(8080);
  await killPort(4200);

  console.log(`${PREFIX_SYS} ${colors.green("✓ Entorno de desarrollo detenido limpiamente.")}\n`);
  process.exit(0);
}

// Register termination signals
process.on("SIGINT", () => cleanup("SIGINT"));
process.on("SIGTERM", () => cleanup("SIGTERM"));
process.on("SIGHUP", () => cleanup("SIGHUP"));

function printBanner(runBackend: boolean, runFrontend: boolean) {
  console.log(`\n${colors.cyan("╔════════════════════════════════════════════════════════════════════╗")}`);
  console.log(`${colors.cyan("║")}   ${colors.bold(colors.cyan("🏛️  LegalStation — Entorno de Desarrollo (Bun Orchestrator)"))}    ${colors.cyan("║")}`);
  console.log(`${colors.cyan("╚════════════════════════════════════════════════════════════════════╝")}`);

  if (runFrontend) {
    console.log(`  ${colors.bold("🌐 Frontend (Angular 19):")} ${colors.green("http://localhost:4200")}`);
  }
  if (runBackend) {
    console.log(`  ${colors.bold("🔌 Backend API (Go):")}     ${colors.cyan("http://localhost:8080")}`);
    console.log(`  ${colors.bold("🩺 Health Endpoint:")}       ${colors.dim("http://localhost:8080/api/v1/health")}`);
  }

  console.log(`\n  ${colors.bold("👥 Usuarios Demo:")}`);
  console.log(`     • ${colors.bold("Cliente:")} ${colors.cyan("cliente@demo.ec")} / ${colors.cyan("demo1234")}`);
  console.log(`     • ${colors.bold("Abogado:")} ${colors.cyan("abogado@demo.ec")} / ${colors.cyan("demo1234")}`);
  console.log(`     • ${colors.bold("Notario:")} ${colors.cyan("notario@demo.ec")} / ${colors.cyan("demo1234")}`);
  console.log(`${colors.gray("──────────────────────────────────────────────────────────────────────")}`);
  console.log(`  ${colors.dim("💡 Presiona")} ${colors.bold("Ctrl + C")} ${colors.dim("para detener todos los servicios de forma limpia.")}\n`);
}

function printHelp() {
  console.log(`
${colors.bold("LegalStation — Bun Dev Runner")}

Uso:
  bun run dev [opciones]
  bun scripts/dev.ts [opciones]

Opciones:
  -b, --only-backend    Inicia únicamente el servidor Backend (Go API :8080)
  -f, --only-frontend   Inicia únicamente la aplicación Frontend (Angular :4200)
  -c, --clean-db        Reinicia la base de datos SQLite y seed antes de iniciar
  -k, --kill-ports      Fuerza la liberación de los puertos 8080 y 4200 antes de iniciar
  -h, --help            Muestra este mensaje de ayuda

Ejemplos:
  bun run dev                 # Inicia Backend + Frontend simultáneamente
  bun run dev --clean-db      # Resetea DB e inicia todo
  bun run dev:backend         # Inicia solo backend
  bun run dev:frontend        # Inicia solo frontend
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    printHelp();
    return;
  }

  const onlyBackend = args.includes("-b") || args.includes("--only-backend");
  const onlyFrontend = args.includes("-f") || args.includes("--only-frontend");
  const cleanDb = args.includes("-c") || args.includes("--clean-db");
  const forceKillPorts = args.includes("-k") || args.includes("--kill-ports");

  const runBackend = onlyBackend || (!onlyBackend && !onlyFrontend);
  const runFrontend = onlyFrontend || (!onlyBackend && !onlyFrontend);

  // 1. Reset DB if requested
  if (cleanDb) {
    console.log(`${PREFIX_SYS} ${colors.yellow("Limpiando base de datos SQLite antes de iniciar...")}`);
    Bun.spawnSync(["bun", "run", resolve(rootDir, "scripts", "reset-db.ts")], {
      stdout: "inherit",
      stderr: "inherit",
    });
  }

  // 2. Check prerequisites & ports
  if (runBackend) {
    try {
      const goCheck = Bun.spawnSync(["go", "version"]);
      if (goCheck.exitCode !== 0) {
        console.error(`${PREFIX_SYS} ${colors.red("✖ Error: Go no está instalado o no se encuentra en el PATH.")}`);
        process.exit(1);
      }
    } catch {
      console.error(`${PREFIX_SYS} ${colors.red("✖ Error: No se pudo ejecutar 'go'. Verifica tu instalación de Go 1.22+.")}`);
      process.exit(1);
    }

    const port8080Busy = await checkPort(8080);
    if (port8080Busy) {
      if (forceKillPorts) {
        console.log(`${PREFIX_SYS} Liberando puerto 8080 ocupado...`);
        await killPort(8080);
        await Bun.sleep(400);
      } else {
        console.log(`${PREFIX_SYS} ${colors.yellow("Aviso: El puerto 8080 ya está en uso. Intentando liberar proceso previo...")}`);
        await killPort(8080);
        await Bun.sleep(400);
      }
    }
  }

  if (runFrontend) {
    const nodeModulesPath = resolve(frontendDir, "node_modules");
    if (!existsSync(nodeModulesPath)) {
      console.log(`${PREFIX_SYS} ${colors.cyan("Instalando dependencias de frontend con Bun (primera vez)...")}`);
      const installProc = Bun.spawnSync(["bun", "install"], {
        cwd: frontendDir,
        stdout: "inherit",
        stderr: "inherit",
      });
      if (installProc.exitCode !== 0) {
        console.error(`${PREFIX_SYS} ${colors.red("✖ Error instalando dependencias de frontend.")}`);
        process.exit(1);
      }
    }

    const port4200Busy = await checkPort(4200);
    if (port4200Busy) {
      if (forceKillPorts) {
        console.log(`${PREFIX_SYS} Liberando puerto 4200 ocupado...`);
        await killPort(4200);
        await Bun.sleep(400);
      } else {
        console.log(`${PREFIX_SYS} ${colors.yellow("Aviso: El puerto 4200 ya está en uso. Intentando liberar proceso previo...")}`);
        await killPort(4200);
        await Bun.sleep(400);
      }
    }
  }

  printBanner(runBackend, runFrontend);

  // 3. Start Backend
  if (runBackend) {
    console.log(`${PREFIX_SYS} ${colors.cyan("Iniciando Go API en http://localhost:8080...")}`);
    const backendProc = Bun.spawn(["go", "run", "./cmd/api"], {
      cwd: backendDir,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "1",
      },
    });

    activeProcesses.push(backendProc);

    streamLines(backendProc.stdout, PREFIX_API);
    streamLines(backendProc.stderr, PREFIX_API);

    backendProc.exited.then((code) => {
      if (!isShuttingDown) {
        console.log(`${PREFIX_API} ${colors.red(`Proceso backend terminado con código ${code}`)}`);
      }
    });

    // Wait for backend to be healthy before UI starts (or in background)
    waitForBackendReady(10000).then((healthy) => {
      if (healthy && !isShuttingDown) {
        console.log(`${PREFIX_SYS} ${colors.green("✓ Backend API listo y respondiendo en http://localhost:8080")}`);
      }
    });
  }

  // 4. Start Frontend
  if (runFrontend) {
    console.log(`${PREFIX_SYS} ${colors.magenta("Iniciando Frontend Angular en http://localhost:4200...")}`);
    const frontendProc = Bun.spawn(["bun", "run", "start"], {
      cwd: frontendDir,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "1",
      },
    });

    activeProcesses.push(frontendProc);

    streamLines(frontendProc.stdout, PREFIX_UI);
    streamLines(frontendProc.stderr, PREFIX_UI);

    frontendProc.exited.then((code) => {
      if (!isShuttingDown) {
        console.log(`${PREFIX_UI} ${colors.red(`Proceso frontend terminado con código ${code}`)}`);
      }
    });
  }
}

main().catch((err) => {
  console.error(`${PREFIX_SYS} ${colors.red("Error fatal:")}`, err);
  cleanup("error");
});
