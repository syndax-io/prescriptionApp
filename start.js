#!/usr/bin/env node

/**
 * PrescriptionApp Startup Script
 * Initializes database and starts both backend and frontend servers
 */

const { spawn, execSync, execFileSync } = require("child_process");
const net = require("net");
const path = require("path");
const fs = require("fs");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) =>
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  backend: (msg) =>
    console.log(`${colors.cyan}[BACKEND]${colors.reset} ${msg}`),
  frontend: (msg) =>
    console.log(`${colors.magenta}[FRONTEND]${colors.reset} ${msg}`),
};

const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");
const dbPath = path.join(backendDir, "data", "prescription_app.db");
// The API and the Parcel dev server. A leftover process on either port makes the next start fail.
const APP_PORTS = [9000, 3001];

function listeningPids(port) {
  // lsof exits 1 when the port has no listener. That is an empty result, not a startup failure.
  try {
    const output = execFileSync("lsof", ["-nP", `-tiTCP:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return [
      ...new Set(
        output
          .split(/\s+/)
          .map((value) => Number(value))
          .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid)
      ),
    ];
  } catch (error) {
    if (error.status === 1) return [];
    if (error.code === "ENOENT") {
      throw new Error("lsof is required to free ports 9000 and 3001 before startup");
    }
    throw error;
  }
}

async function freeListenPorts(ports) {
  // Drop listeners from an earlier npm start so uvicorn and Parcel can bind.
  for (const port of ports) {
    const pids = listeningPids(port);
    if (pids.length === 0) {
      log.info(`Port ${port} is free`);
      continue;
    }
    log.warn(`Stopping ${pids.join(", ")} on port ${port}`);
    for (const pid of pids) {
      try {
        process.kill(pid, "SIGKILL");
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    }
  }

  const deadline = Date.now() + 2000;
  let busy = ports.filter((port) => listeningPids(port).length > 0);
  while (busy.length > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    busy = ports.filter((port) => listeningPids(port).length > 0);
  }
  if (busy.length > 0) {
    throw new Error(`Could not free port ${busy.join(", ")}`);
  }
}

async function checkDependencies() {
  log.info("Checking dependencies...");

  const backendVenv = path.join(backendDir, ".venv");
  const frontendModules = path.join(frontendDir, "node_modules");

  if (!fs.existsSync(backendVenv)) {
    log.warn("Backend virtualenv not found. Installing Python dependencies...");
    execSync("python3 -m venv .venv && .venv/bin/pip install -r requirements.txt", {
      cwd: backendDir,
      stdio: "inherit",
    });
    log.success("Backend dependencies installed");
  }

  if (!fs.existsSync(frontendModules)) {
    log.warn("Frontend dependencies not installed. Installing...");
    execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
    log.success("Frontend dependencies installed");
  }

  log.success("All dependencies ready");
}

function mongoIsUp() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port: 27017 });
    const done = (up) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(up);
    };
    socket.setTimeout(1000);
    socket.on("connect", () => done(true));
    socket.on("timeout", () => done(false));
    socket.on("error", () => done(false));
  });
}

async function ensureMongo() {
  log.info("Checking MongoDB...");
  if (await mongoIsUp()) {
    log.success("MongoDB is accepting connections on port 27017");
    return;
  }

  try {
    execSync("docker compose version", { stdio: "ignore" });
  } catch {
    throw new Error(
      "MongoDB is not running on localhost:27017. Start it with: docker compose -f backend/docker-compose.yml up -d"
    );
  }

  log.warn("Starting MongoDB with Docker Compose...");
  execSync("docker compose -f docker-compose.yml up -d", {
    cwd: backendDir,
    stdio: "inherit",
  });

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await mongoIsUp()) {
      log.success("MongoDB is accepting connections on port 27017");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(
    "MongoDB did not accept connections on localhost:27017. Start it with: docker compose -f backend/docker-compose.yml up -d"
  );
}

async function initDatabase() {
  log.info("Checking database...");

  if (!fs.existsSync(dbPath)) {
    log.warn("Database not found. Initializing...");
    execSync(".venv/bin/python -m scripts.init_db", { cwd: backendDir, stdio: "inherit" });
    log.success("Database initialized with sample data");
  } else {
    log.success("Database already exists");
  }
}

function startBackend() {
  return new Promise((resolve) => {
    log.info("Starting backend server...");

    const backend = spawn(
      path.join(backendDir, ".venv", "bin", "python"),
      ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "9000", "--log-level", "warning"],
      {
        cwd: backendDir,
        env: { ...process.env, PORT: "9000" },
      }
    );

    backend.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => {
        if (line) log.backend(line);
        if (line.includes("Server running")) {
          resolve(backend);
        }
      });
    });

    backend.stderr.on("data", (data) => {
      log.error(`Backend: ${data.toString().trim()}`);
    });

    backend.on("close", (code) => {
      if (code !== 0) {
        log.error(`Backend exited with code ${code}`);
      }
    });

    // Resolve after timeout if server message not detected
    setTimeout(() => resolve(backend), 3000);
  });
}

function startFrontend() {
  return new Promise((resolve) => {
    log.info("Starting frontend dev server...");

    const frontend = spawn("npm", ["run", "dev"], {
      cwd: frontendDir,
      env: { ...process.env },
      shell: true,
    });

    frontend.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => {
        if (line) log.frontend(line);
        // Detect Parcel's ready message
        if (line.includes("Server running at") || line.includes("Built in")) {
          resolve(frontend);
        }
      });
    });

    frontend.stderr.on("data", (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes("warning")) {
        log.error(`Frontend: ${msg}`);
      }
    });

    frontend.on("close", (code) => {
      if (code !== 0) {
        log.error(`Frontend exited with code ${code}`);
      }
    });

    // Resolve after timeout if server message not detected (Parcel can take longer)
    setTimeout(() => resolve(frontend), 30000);
  });
}

function printBanner() {
  console.log(`
${colors.bright}${colors.blue}╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   PrescriptionApp — Vanguard Clinical Desk               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝${colors.reset}
`);
}

function printReadyMessage() {
  console.log(`
${colors.bright}${colors.green}════════════════════════════════════════════════════════════
  🚀 Application is ready!
════════════════════════════════════════════════════════════${colors.reset}

  ${colors.cyan}Frontend:${colors.reset}  http://localhost:3001
  ${colors.cyan}Backend:${colors.reset}   http://localhost:9000/api

  ${colors.yellow}Demo Credentials:${colors.reset}
  ┌─────────────────────────────────────────────────┐
  │  Physician: doctor@example.com / doctor123     │
  └─────────────────────────────────────────────────┘

  ${colors.bright}Press Ctrl+C to stop all servers${colors.reset}
`);
}

let backendProcess = null;
let frontendProcess = null;

// Handle graceful shutdown
function shutdown() {
  console.log("\n");
  log.info("Shutting down servers...");

  if (backendProcess) {
    backendProcess.kill("SIGTERM");
  }
  if (frontendProcess) {
    frontendProcess.kill("SIGTERM");
  }

  log.success("Servers stopped. Goodbye!");
  process.exit(0);
}

// Main startup sequence
async function main() {
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  printBanner();

  try {
    await freeListenPorts(APP_PORTS);
    await checkDependencies();
    await ensureMongo();
    await initDatabase();

    backendProcess = await startBackend();
    frontendProcess = await startFrontend();

    printReadyMessage();
  } catch (error) {
    log.error(`Startup failed: ${error.message}`);
    shutdown();
  }
}

if (require.main === module) {
  main();
}

module.exports = { freeListenPorts, listeningPids, APP_PORTS };
