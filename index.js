import { spawn } from 'child_process';
import path from 'path';
import cron from "node-cron";
import { init, logMessage } from "./lib/logger.js";

init(path.join(process.cwd(), 'logs'));

const processes = [];

function runScript(scriptPath) {
  const scriptName = path.basename(scriptPath, '.js');

  const proc = spawn('node', [scriptPath], {
    cwd: process.cwd(),
    stdio: ['ignore', 'ignore', 'ignore'],
    detached: true
  });

  processes.push({ proc, scriptName });
  logMessage(scriptName, `Started (PID: ${proc.pid})`);

  proc.on('exit', (code, signal) => {
    if (code && code !== 0) logMessage(scriptName, `Exited with code ${code}`);
    else if (signal) logMessage(scriptName, `Killed by signal ${signal}`);
    else logMessage(scriptName, `Exited normally`);
  });

  return proc;
}

// 1. Start WhatsApp Bot
console.log('Starting automation services...');
runScript(path.join(process.cwd(), 'wa_bot.js'));

// 2. Schedule automation_CyberArk
cron.schedule("0 7 * * 1", () => {
    logMessage("scheduler", "Running automation_Request_Cyberark.js (Monday 07:00)");
    runScript(path.join(process.cwd(), "automation_Request_Cyberark.js"));
});

logMessage("system", "Automation service started. Logs saved to /logs");

// Keep process alive
process.stdin.resume();

// Graceful shutdown
function shutdown() {
    logMessage("system", "Shutting down all services...");
    processes.forEach(({ proc, scriptName }) => {
        try {
            process.kill(-proc.pid);
            logMessage(scriptName, "Stopped");
        } catch {}
    });
    process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);