import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { init, logMessage } from "./lib/logger.js";

const WATCH_DIR = path.resolve('./assets/chat');
const MESSAGE_FILE = path.join(WATCH_DIR, 'Response_CyberArk.txt');
const AUTH_FOLDER = './auth_info';
const TARGET_GROUP_JID = '';

let socketReady = false;

init(path.join(process.cwd(), "logs"));

// ============= INITIALIZE BAILEYS SOCKET ==================
async function initializeSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: state,
    syncFullHistory: false,
  });

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) qrcode.generate(qr, { small: true });

    if (connection === "open") {
      logMessage("wa_bot", "Connected to WhatsApp");
      socketReady = true;
    }

    if (connection === "close") {
      const status = lastDisconnect?.error?.output?.statusCode;

      if (status !== DisconnectReason.loggedOut) {
        logMessage("wa_bot", "Disconnected, attempting reconnect...");
        initializeSocket();
      } else {
        logMessage("wa_bot", "Logged out. Rescan QR.");
      }
    }
  });

  return socket;
}

// ============= SEND MESSAGE IF SOCKET READY ==================
async function sendMessage(text) {
  if (!socketReady || !global.socket) {
    logMessage("wa_bot", "Socket not ready. Giving up.");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return sendMessage(text);
  }

  try {
    await global.socket.sendMessage(TARGET_GROUP_JID, { text });
    logMessage("wa_bot", `Sent: ${text}`);

    await fsExtra.remove(MESSAGE_FILE);
    logMessage("wa_bot", "Message file deleted");

  } catch (err) {
    logMessage("wa_bot", `Send failed: ${err.message}`);
  }
}

// ============= FILE WATCHER – NATIVE FS.WATCH ==================
function startListener() {
  logMessage("wa_bot", "Watching for Response_CyberArk.txt...");

  fs.watch(WATCH_DIR, (event, filename) => {
    if (filename === "Response_CyberArk.txt" && event === "rename") {

      if (fs.existsSync(MESSAGE_FILE)) {
        logMessage('wa_bot', "📄 File terdeteksi, membaca...");

        const content = fs.readFileSync(MESSAGE_FILE, 'utf8').trim();

        if (content.length > 0) {
          sendMessage(content);
        } else {
          logMessage("wa_bot", "File empty. Skipped.");
        }
      }
    }
  });
}

// ============= MAIN PROGRAM ==================
async function main() {
  global.socket = await initializeSocket();
  startListener();
}

main();
