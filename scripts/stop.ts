#!/usr/bin/env bun
/**
 * Cierra API (:8080), Angular (:4200) y Karma (:9876 / :9877).
 */
import net from "node:net";

const PORTS = [8080, 4200, 9876, 9877];

function checkPort(port: number): Promise<boolean> {
  return new Promise((res) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" });
    socket.setTimeout(300);
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

function killPort(port: number) {
  try {
    if (process.platform === "win32") {
      Bun.spawnSync([
        "powershell",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }`,
      ]);
    } else {
      Bun.spawnSync([
        "bash",
        "-c",
        `fuser -k ${port}/tcp 2>/dev/null || lsof -ti:${port} | xargs -r kill -9 2>/dev/null || true`,
      ]);
    }
  } catch {
    // ignore
  }
}

for (const port of PORTS) {
  if (await checkPort(port)) {
    killPort(port);
    console.log(`Cerrado puerto ${port}`);
  }
}

console.log("Servicios locales detenidos (API, Angular, Karma).");
