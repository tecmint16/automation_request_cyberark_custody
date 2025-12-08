// connection_selenium.js
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import fs from "fs";
import path from "path";


// ================= CONFIG ==================
export const Config = {
    URL: "https://pam.bni.co.id/PasswordVault/v10/logon/ldap",
    USERNAME: ["username_cyberark", "username_cyberark2", "username_cyberark3"],
    PASSWORD: ["password_cyberark", "password_cyberark2", "password_cyberark3"],

    CHROME_BINARY: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    ORIGINAL_USER_DATA: "C:\\Users\\901146\\AppData\\Local\\Google\\Chrome\\User Data\\Default",
    SELENIUM_PROFILE_ROOT: "C:\\SeleniumProfile",
    USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0 Safari/537.36",
    TARGETS: ["APP1", "APP2", "APP3", "APP4"],

    IMPLICIT_WAIT: 8000
};


// ================= SELECTORS ==================
export const Selectors = {
    //=============================================================================
    USERNAME: [
        By.id("user_pass_form_username_field"),
        By.name("username"),
    ],
    //=============================================================================
    PASSWORD: [
        By.id("user_pass_form_password_field"),
        By.name("password"),
    ],
    //=============================================================================
    LOGIN_BUTTON: [
        By.css("button[type='submit']"),
        By.xpath("//button[contains(., 'Login') or contains(., 'Sign in')]")
    ],
    //=============================================================================
    SEARCH_BOX: [
        By.css("input[data-testid='accountsKeywordsSearchInput']")
    ],
    //=============================================================================
    SEARCH_BUTTON: [
        By.css("button[data-testid='accountsSearchButton']")
    ],
    //=============================================================================
    SELECT_ALL_CHECKBOX: By.css("#selectAllInHeader"),
    //=============================================================================
    REQUEST_BUTTON: [
        By.css("#openRequestAccessModal"),
        By.css("button[data-testid='requestAccessButton']")
    ],
    //=============================================================================
    REASON_TEXTAREA: [
        By.xpath("//*[@id='clipboardenabled']//textarea")
    ],
    //=============================================================================
    SUBMIT_REQUEST_BUTTON: [
        By.css("button.p-button-primary:nth-child(1)"),
        By.xpath("//button[contains(., 'Submit Request')]")
    ],
    //=============================================================================
    FRAME_EPV: By.id("frame-epv"),
};


// ================= DRIVER CREATION ==================
export async function createDriver() {
    const options = new chrome.Options()
        .addArguments(`--user-agent=${Config.USER_AGENT}`)
        .addArguments("--disable-blink-features=AutomationControlled")
        .addArguments("--no-sandbox")
        .addArguments("--disable-dev-shm-usage")
        .addArguments("--ignore-certificate-errors")
        .addArguments("--disable-notifications")
        .addArguments("--disable-gpu")
        .addArguments("--disable-sync")
        .addArguments("--allow-running-insecure-content")
        .addArguments("--disable-background-networking")
        .addArguments("--disable-default-apps")
        .addArguments("--disable-component-update")
        .addArguments("--disable-background-timer-throttling")
        .addArguments("--disable-backgrounding-occluded-windows")
        .addArguments("--disable-renderer-backgrounding")
        .addArguments("--disable-features=PushMessaging,UseChromeTrackingForPushMessaging,NetworkService")
        .addArguments("--disable-domain-reliability")
        .addArguments("--disable-features=TrustTokenAPI")
        .addArguments("--disable-breakpad")
        .addArguments("--metrics-recording-only")
        .addArguments("--mute-audio")
        .addArguments("--log-level=3")
        .addArguments("--disable-logging")
        .addArguments("--no-first-run")
        .addArguments("--no-service-autorun")
        .addArguments("--password-store=basic");

    options.setChromeBinaryPath(Config.CHROME_BINARY);

    // Copy original user data to selenium profile if not exists
    if (!fs.existsSync(Config.SELENIUM_PROFILE_ROOT)) {
        fs.mkdirSync(Config.SELENIUM_PROFILE_ROOT, { recursive: true });
        fs.cpSync(Config.ORIGINAL_USER_DATA, Config.SELENIUM_PROFILE_ROOT, { recursive: true });
    }

    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
    
    await driver.manage().setTimeouts({ 
        implicit: Config.IMPLICIT_WAIT 
    });

    return driver;
}

// ================= FIND ELEMENT HELPER ==================
export async function findElement(driver, selectors, clickable = false) {
    for (const by of selectors) {
        try {
            const element = await driver.findElement(by);
            if (clickable) {
                await driver.wait(until.elementIsEnabled(element), 15000);
            }

            return element;;
        } catch (err) {
            continue;
        }
    }
    throw new Error("Element not found using any selector");
}