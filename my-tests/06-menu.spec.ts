import {test, expect } from '@playwright/test'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('With session', () => {

    // use the session information while login
    test.use({ storageState: './state.json'});

    test.beforeEach(async ({ page }) => {
        // inside 'With session'
        await page.goto("https://www.saucedemo.com/inventory.html")
        await expect(page).toHaveTitle(/Swag Labs/);
    });

    test('6.1 menu function', async({ page }) => {

        // 1. 点击打开菜单
        await page.getByRole('button', {name: 'Open Menu'}).click()
        await expect(page.locator('.bm-menu')).toBeVisible()

        // 2. 点击关闭菜单按钮正常
        await page.getByRole('button', {name: 'Close Menu'}).click()
        await expect(page.locator('.bm-menu')).not.toBeVisible()
    });

    test('6.2 menu items', async({ page }) => {

        // 1. Reset App State → 所有购物车状态清空
        // 加2个商品
        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        await addButtons.nth(0).click()
        await addButtons.nth(1).click()

        // cart icon 显示
        const badgeIcon = page.locator('[data-test="shopping-cart-badge"]')
        await expect(badgeIcon).toBeVisible()

        // 打开menu并点击 reset store，cart 消失
        await page.getByRole('button', {name: 'Open Menu'}).click()
        await page.getByRole('link', {name: 'Reset App State'}).click()
        await expect(badgeIcon).not.toBeVisible()

        // 点击关闭菜单
        await page.getByRole('button', {name: 'Close Menu'}).click()
        await expect(page.locator('.bm-menu')).not.toBeVisible()

        // 2. About → 跳转到 Sauce Labs 官网
        // 打开menu并点击 reset store，cart 消失
        await page.getByRole('button', {name: 'Open Menu'}).click()
        await page.getByRole('link', {name: 'About'}).click()
        await expect(page).toHaveURL('https://saucelabs.com/')
        await page.goBack()

        // 3. Logout → 返回登录页
        await page.getByRole('button', {name: 'Open Menu'}).click()
        await page.getByRole('link', {name: 'About'}).click()

        // 为什么这里会返回到这个url，而不是 https://www.saucedemo.com/
        await expect(page).toHaveURL('https://saucelabs.com/')
    });
});