#!/usr/bin/env node
/**
 * Runs Next.js with isolated output dirs and guards against concurrent dev/build.
 * - dev  → .next-dev + Turbopack (avoids webpack HMR cache corruption)
 * - build/start → .next
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");
const lockPath = path.join(root, ".next-process.lock");
const mode = process.argv[2]; // "dev" | "build" | "start"

if (!mode || !["dev", "build", "start"].includes(mode)) {
  console.error("Usage: node scripts/run-next.js <dev|build|start> [...args]");
  process.exit(1);
}

function readLock() {
  try {
    const raw = fs.readFileSync(lockPath, "utf8").trim();
    const [pidStr, lockedMode] = raw.split(":");
    const pid = Number(pidStr);
    if (!Number.isFinite(pid)) return null;
    try {
      process.kill(pid, 0);
      return { pid, mode: lockedMode || "unknown" };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

const existing = readLock();
if (existing) {
  const conflict =
    (mode === "build" && existing.mode === "dev") ||
    (mode === "dev" && existing.mode === "build") ||
    (mode === existing.mode && mode !== "start");

  if (conflict) {
    console.error(
      `\n[next-guard] Refusing to run \`next ${mode}\` while \`next ${existing.mode}\` is already running (pid ${existing.pid}).\n` +
        `Stop the other process first, or run: npm run clean\n`
    );
    process.exit(1);
  }
}

fs.writeFileSync(lockPath, `${process.pid}:${mode}`);

function clearLock() {
  try {
    if (fs.existsSync(lockPath)) {
      const raw = fs.readFileSync(lockPath, "utf8").trim();
      if (raw.startsWith(`${process.pid}:`)) fs.unlinkSync(lockPath);
    }
  } catch {
    /* ignore */
  }
}

for (const signal of ["exit", "SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    clearLock();
    if (signal !== "exit") process.exit(signal === "SIGINT" ? 130 : 1);
  });
}

const extraArgs = process.argv.slice(3);
const env = {
  ...process.env,
  NEXT_DIST_DIR: mode === "dev" ? ".next-dev" : ".next",
};

const nextArgs = ["next", mode];
if (mode === "dev" && !extraArgs.includes("--turbo") && !extraArgs.includes("--webpack")) {
  nextArgs.push("--turbo");
}
nextArgs.push(...extraArgs);

const child = spawn("npx", nextArgs, {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});

child.on("exit", (code, signal) => {
  clearLock();
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
