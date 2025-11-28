import {test, expect } from '@playwright/test'

enum userType {
    normalUser = 'standard_user', 
    lockUser = 'locked_out_user',
    issueUser = 'problem_user',
}

const password: string = "secret_sauce"

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Start to run -> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of -------> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test.beforeEach(async ({ page }) => {
        // inside 'No session'
        await page.goto("https://www.saucedemo.com/")
        await expect(page).toHaveTitle(/Swag Labs/);
    });


    test('1.1 login success', async ({ page }) => {
        const context = page.context()

        await page.locator('#user-name').fill(userType.normalUser)
        await page.locator('#password').fill(password)
        
        await page.locator('#login-button').click()

        await expect(page).toHaveURL(/.*inventory\.html/)

        // not store state.json here for the session already done in global-setup.ts
        // await context.storageState({path: './state.json'})

    });

    test('1.2 login abnormal - no user name', async ({ page }) => {

        await page.locator('#user-name').fill('')
        await page.locator('#password').fill(password)

        await page.locator('#login-button').click()

        const err = page.locator('[data-test="error"]');
        await expect(err).toBeVisible();
        await expect(err).toContainText('Epic sadface: Username is required');

    });

    test('1.3 login abnormal - no password', async ({ page }) => {

        await page.locator('#user-name').fill(userType.normalUser)
        await page.locator('#password').fill('')

        await page.locator('#login-button').click()

        const err = page.locator('[data-test="error"]');
        await expect(err).toBeVisible();
        await expect(err).toContainText('Epic sadface: Password is required');

    });

    test('1.4 login abnormal - no username and no password', async ({ page }) => {

        await page.locator('#user-name').fill('')
        await page.locator('#password').fill('')

        await page.locator('#login-button').click()

        const err = page.locator('[data-test="error"]');
        await expect(err).toBeVisible();
        await expect(err).toContainText('Epic sadface: Username is required');

    });

    test('1.5 login abnormal - wrong password', async ({ page }) => {

        await page.locator('#user-name').fill(userType.normalUser)
        await page.locator('#password').fill('abcde')

        await page.locator('#login-button').click()

        const err = page.locator('[data-test="error"]')
        await expect(err).toBeVisible();
        await expect(err).toContainText('Epic sadface: Username and password do not match any user in this service');

    });

    test('1.6 login abnormal - lockUser', async ({ page }) => {

        await page.locator('#user-name').fill(userType.lockUser)
        await page.locator('#password').fill(password)

        await page.locator('#login-button').click()

        const err = page.locator('[data-test="error"]');
        await expect(err).toBeVisible();
        await expect(err).toContainText('Epic sadface: Sorry, this user has been locked out');

    });

    // 还有 problem_user / error_user，情况复杂
});



