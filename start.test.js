const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const test = require("node:test");

const { freeListenPorts, listeningPids } = require("./start");

function holdPort() {
  const child = spawn(
    process.execPath,
    [
      "-e",
      `
        const net = require("net");
        const server = net.createServer();
        server.listen(0, "127.0.0.1", () => {
          console.log(String(server.address().port));
        });
        setInterval(() => {}, 1000);
      `,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
  return new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error("port holder did not listen")), 5000);
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`port holder exited early (${code})`));
    });
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      const port = Number(output.trim().split("\n")[0]);
      if (!Number.isInteger(port) || port <= 0) return;
      clearTimeout(timer);
      child.removeAllListeners("exit");
      resolve({ child, port });
    });
  });
}

function waitForExit(child) {
  if (child.exitCode !== null || child.signalCode) return Promise.resolve();
  return new Promise((resolve) => child.once("exit", () => resolve()));
}

test("freeListenPorts stops another process listening on the port", async () => {
  const first = await holdPort();
  const second = await holdPort();
  try {
    assert.ok(listeningPids(first.port).includes(first.child.pid));
    assert.ok(listeningPids(second.port).includes(second.child.pid));

    await freeListenPorts([first.port, second.port]);
    await Promise.all([waitForExit(first.child), waitForExit(second.child)]);

    assert.deepEqual(listeningPids(first.port), []);
    assert.deepEqual(listeningPids(second.port), []);
    assert.equal(first.child.signalCode, "SIGKILL");
    assert.equal(second.child.signalCode, "SIGKILL");
  } finally {
    for (const holder of [first, second]) {
      if (holder.child.exitCode === null && !holder.child.signalCode) holder.child.kill("SIGKILL");
    }
  }
});

test("freeListenPorts leaves the current process alone", async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    assert.deepEqual(listeningPids(port), []);
    await freeListenPorts([port]);
    assert.equal(process.pid > 0, true);
    assert.equal(server.listening, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
