import fs from 'fs';
import path from 'path';

let LOG_DIR = path.join(process.cwd(), 'logs');

export function init(dir) {
  if (dir) LOG_DIR = dir;
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function getTimestamp() {
  return new Date().toLocaleString();
}

export function logMessage(scriptName, message) {
  try {
    const logFile = path.join(LOG_DIR, `${scriptName}.log`);
    const logEntry = `[${getTimestamp()}] ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
    console.log(`[${scriptName}] ${message}`);
  } catch (e) {
    // fallback to console if logging fails
    console.log(`[${scriptName}] ${message}`);
  }
}
