import {test, expect } from '@playwright/test'

const normalUser = 'standard_user'
const password: string = "secret_sauce"

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test('9.1 login success', async ({ page }) => {
        // 1. 未登录直接访问 /inventory.html → 应跳转回登录
        await page.goto("https://www.saucedemo.com/inventory.html")

        // url 精确符合
        await expect(page).toHaveURL("https://www.saucedemo.com/")

        // error massage 符合
        await expect(page.getByText("Epic sadface: You can only access '/inventory.html' when you are logged in.")).toBeVisible()

        // 2. 登录后打开新标签访问 inventory → 自动登录状态应一致
        await page.locator('#user-name').fill(normalUser)
        await page.locator('#password').fill(password)
        
        await page.locator('#login-button').click()

        // 验证登录成功
        await expect(page.locator('span[data-test="title"]')).toHaveText("Products")

        // 3. Logout 后访问任何内部 URL → 应被重定向到登录页
        // logout
        await page.getByRole('button', {name: 'Open Menu'}).click()
        await page.getByRole('link', {name: 'Logout'}).click()

        await expect(page).toHaveURL('https://www.saucedemo.com/')

        // 访问 inventory
        await page.goto("https://www.saucedemo.com/inventory.html")
        await expect(page.getByText("Epic sadface: You can only access '/inventory.html' when you are logged in.")).toBeVisible()

        // 访问 cart
        await page.goto("https://www.saucedemo.com/cart.html")
        await expect(page.getByText("Epic sadface: You can only access '/cart.html' when you are logged in.")).toBeVisible()
    });

});