#!/usr/bin/env node
/**
 * Ensures a single Next.js dev server for this repo.
 * Kills any prior `next dev` / next-server for this project, clears the
 * Turbopack lock, then starts a fresh server.
 */
import { spawn, execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = join(root, ".next", "dev", "lock");
const nextBin = join(root, "node_modules", ".bin", "next");
const extraArgs = process.argv.slice(2);

function run(cmd) {
  try {
    return execSync(cmd, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function cwdOf(pid) {
  const out = run(`lsof -a -p ${pid} -d cwd -Fn`);
  const line = out.split("\n").find((l) => l.startsWith("n"));
  return line ? line.slice(1) : "";
}

function pidsForThisRepo() {
  const out = run("ps -axo pid=,command=");
  const pids = new Set();

  for (const line of out.split("\n")) {
    const match = line.trim().match(/^(\d+)\s+(.+)$/);
    if (!match) continue;
    const pid = Number(match[1]);
    const cmd = match[2];
    if (!Number.isFinite(pid) || pid === process.pid) continue;

    const isNext =
      /\bnext\b/.test(cmd) &&
      (cmd.includes("dev") || cmd.includes("next-server"));
    if (!isNext) continue;

    const fromThisRepo =
      cmd.includes(root) ||
      cmd.includes(`${root}/node_modules`) ||
      cwdOf(pid) === root;

    if (fromThisRepo) pids.add(pid);
  }

  return [...pids];
}

async function killPids(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  if (pids.length === 0) return;

  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const alive = pids.filter((pid) => {
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    });
    if (alive.length === 0) return;
    await sleep(100);
  }

  for (const pid of pids) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

const toKill = pidsForThisRepo();

if (toKill.length > 0) {
  console.log(`Stopping previous Next.js process(es): ${toKill.join(", ")}`);
  await killPids(toKill);
}

if (existsSync(lockPath)) {
  try {
    unlinkSync(lockPath);
  } catch {
    /* ignore */
  }
}

const child = spawn(nextBin, ["dev", ...extraArgs], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    try {
      process.kill(process.pid, signal);
    } catch {
      process.exit(1);
    }
    return;
  }
  process.exit(code ?? 1);
});
