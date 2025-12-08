// automation_Request_CyberArk.js
import fs from "fs";
import path from "path";
import { Config, Selectors, createDriver, findElement } from "./lib/conf_Connection_Request_Cyberark.js";
import { init, logMessage } from "./lib/logger.js";
import { until } from "selenium-webdriver";

init(path.join(process.cwd(), 'logs'));

// ============= OUTPUT ==================
async function writeOutput(success, errorMessage = null, username = null) {
    const outputPath = path.join(process.cwd(), "./assets/chat/Response_CyberArk.txt");
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];

    const content = success
        ? `✅ Request CyberArk berhasil.\n\n- Username: ${username}\n- Timestamp: ${timestamp}\n- Status: Menunggu Approval\n`
        : `⚠️ Gagal memproses request.\n\n- Username: ${username}\n- Timestamp: ${timestamp}\n- Error: ${errorMessage}\n`;

    fs.writeFileSync(outputPath, content, "utf8");
    logMessage('automation_Request_Cyberark', `Output saved: ${outputPath}`);
    return content;
}

// ============= SWITCH TO IFRAME ==================
async function switchToIframe(driver) {
    try {
        const iframe = await driver.findElement(Selectors.FRAME_EPV);
        await driver.switchTo().frame(iframe);
        return true;
    } catch {
        return false;
    }
}

// ============= FLOW EKSEKUSI ==================
async function executeRequest(driver, target) {
    try {
        logMessage('automation_Request_Cyberark', `\n[PROCESS] Target: ${target}`);
        
        const searchBox = await findElement(driver, Selectors.SEARCH_BOX);
        await searchBox.clear();
        await searchBox.sendKeys(target);

        await driver.sleep(8000);
        const searchBtn = await findElement(driver, Selectors.SEARCH_BUTTON, true);
        await searchBtn.click();

        await driver.sleep(8000);
        const checkbox = await driver.findElement(Selectors.SELECT_ALL_CHECKBOX);
        await driver.executeScript("arguments[0].scrollIntoView(true);", checkbox);
        await checkbox.click();

        await driver.sleep(8000);
        const reqBtn = await findElement(driver, Selectors.REQUEST_BUTTON, true);
        await reqBtn.click();

        await driver.sleep(8000);
        const textarea = await findElement(driver, Selectors.REASON_TEXTAREA);
        await textarea.clear();
        await textarea.sendKeys("Operational APS");

        await driver.sleep(8000);
        const submitBtn = await findElement(driver, Selectors.SUBMIT_REQUEST_BUTTON, true);
        await submitBtn.click();

        await driver.sleep(8000);
        await driver.navigate().refresh();

        logMessage('automation_Request_Cyberark', `[SUCCESS] Request untuk ${target} telah diajukan.`);

        await driver.sleep(8000);

        return [true, null];
    } catch (err) {
        return [false, err.message];
    }
}

// ============= LOGIN DAN PROSES ==================
async function loginAndProcess(driver, username, password) {
    try {
        logMessage('automation_Request_Cyberark', `\n[PROCESS] Memulai proses login dan request CyberArk untuk user: ${username}...`);
        await driver.get(Config.URL);
        await driver.sleep(10000);

        const usernameField = await findElement(driver, Selectors.USERNAME);
        await usernameField.clear();
        await usernameField.sendKeys(username);
        
        const passwordField = await findElement(driver, Selectors.PASSWORD);
        await passwordField.clear();
        await passwordField.sendKeys(password);

        const loginBtn = await findElement(driver, Selectors.LOGIN_BUTTON, true);
        await loginBtn.click();

        await driver.sleep(5000);

        for (const target of Config.TARGETS) {
            await driver.switchTo().defaultContent();

            if (!(await switchToIframe(driver))) {
                throw new Error(`Failed to switch iframe for ${target}`);
            }

            await driver.sleep(8000);
            await executeRequest(driver, target);
        }
        return [true, null];
    } catch (err) {
        return [false, err.message];
    }
}

// ============= MAIN ==================
async function main() {
    for (let i = 0; i < 3; i++) {
        const driver = await createDriver();
        try {
            const [success, errorMsg] = await loginAndProcess(driver, Config.USERNAME[i], Config.PASSWORD[i]);

            if (success) {
                logMessage('automation_Request_Cyberark', `[SUCCESS] Request CyberArk berhasil diproses untuk ${Config.USERNAME[i]}`);
                const message = await writeOutput(success, null, Config.USERNAME[i]);
            } else {
                logMessage('automation_Request_Cyberark', `[ERROR] ${errorMsg}`);
                const message = await writeOutput(false, errorMsg, Config.USERNAME[i]);
            }
            await driver.sleep(10000);
        } finally {
            if (driver) await driver.quit();
        }
    }
}

main();