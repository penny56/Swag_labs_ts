import { chromium } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const context = page.context()

    await page.goto("https://www.saucedemo.com/")
    await page.locator('#user-name').fill('standard_user')
    await page.locator('#password').fill('secret_sauce')
    await page.locator('#login-button').click()
    await context.storageState({path: './state.json'})
    await browser.close()
}

export default globalSetup;
