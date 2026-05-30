#!/usr/bin/env node

/**
 * PrescriptionApp Startup Script
 * Initializes database and starts both backend and frontend servers
 */

const { spawn, execSync } = require("child_process");
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

async function checkDependencies() {
  log.info("Checking dependencies...");

  const backendModules = path.join(backendDir, "node_modules");
  const frontendModules = path.join(frontendDir, "node_modules");

  if (!fs.existsSync(backendModules)) {
    log.warn("Backend dependencies not installed. Installing...");
    execSync("npm install", { cwd: backendDir, stdio: "inherit" });
    log.success("Backend dependencies installed");
  }

  if (!fs.existsSync(frontendModules)) {
    log.warn("Frontend dependencies not installed. Installing...");
    execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
    log.success("Frontend dependencies installed");
  }

  log.success("All dependencies ready");
}

async function initDatabase() {
  log.info("Checking database...");

  if (!fs.existsSync(dbPath)) {
    log.warn("Database not found. Initializing...");
    execSync("npm run init-db", { cwd: backendDir, stdio: "inherit" });
    log.success("Database initialized with sample data");
  } else {
    log.success("Database already exists");
  }
}

function startBackend() {
  return new Promise((resolve) => {
    log.info("Starting backend server...");

    const backend = spawn("node", ["server.js"], {
      cwd: backendDir,
      env: { ...process.env, PORT: "9000" },
    });

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
║   💊 PrescriptionApp - Medicine Reminder System          ║
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
  │  Doctor:  doctor@example.com  / doctor123      │
  │  Patient: patient@example.com / patient123     │
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

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Main startup sequence
async function main() {
  printBanner();

  try {
    await checkDependencies();
    await initDatabase();

    backendProcess = await startBackend();
    frontendProcess = await startFrontend();

    printReadyMessage();
  } catch (error) {
    log.error(`Startup failed: ${error.message}`);
    shutdown();
  }
}

main();
