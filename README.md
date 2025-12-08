<p align="center">
  <img src="https://raw.githubusercontent.com/github/explore/master/topics/nodejs/nodejs.png" width="100">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Cyberark-logo-dark.svg/2560px-Cyberark-logo-dark.svg.png" width="400">
  <img src="https://avatars.githubusercontent.com/u/131354555?v=4" width="100">
</p>

# Automation to Request CyberArk

This project is an automation system designed to automatically request access on CyberArk and notify results through WhatsApp.  
The automation consists of three main components:
1. **WhatsApp Bot (`wa_bot.js`)**
   - Listens for messages and sends the output of CyberArk automation.
   - Watches for output file updates in `./assets/chat/Response_CyberArk.txt`.

2. **CyberArk Automation (`automation_Request_Cyberark.js`)**
   - Logs in to CyberArk using Selenium WebDriver.
   - Requests access for predefined usernames and targets.
   - Generates the output file `Response_CyberArk.txt` after the request is completed.

3. **Scheduler (`index.js`)**
   - Continuously runs the WhatsApp bot.
   - Schedules CyberArk automation to run every **5 minutes** using `node-cron`.
   - Handles process management and logging.

## Requirements
- **Node.js**
- **@whiskeysockets/baileys** – WhatsApp Bot integration
- **qrcode-terminal** – Displays WhatsApp QR Code in terminal
- **fs-extra** – Enhanced file handling
- **selenium-webdriver** – Automates CyberArk web interaction
- **chromedriver / Google Chrome** – Required for Selenium
- **node-cron** – Schedules the automation
- **node-windows** – (Optional) Runs Node.js as a Windows service
- **path** – Directory path handling utilit

## Installation

A. Initialize the project:

Use the [node-js](https://nodejs.org/en) package manager to install foobar.
```bash
npm init -y
```

B. Install the required dependencies:
```bash
npm install @whiskeysockets/baileys qrcode-terminal fs-extra path selenium-webdriver node-cron node-windows
```

C. Delete the auth_info folder if it already exists.

D. Run the following command to generate a QR Code:
```bash
node index.js
```

E. Scan the QR Code using WhatsApp.

F. After the connection is successful, stop the process using CTRL + C, then run the project again to ensure the session is properly saved.

## Usage

A. Service Mode (automatically runs in the background):
```bash
node service.js
```

C. One-time Mode (manual run):
```bash
node index.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.