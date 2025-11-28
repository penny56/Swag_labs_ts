import {test, expect } from '@playwright/test'

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Start to run -> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of -------> ', testInfo.title)
});

test.describe('With session', () => {

    // use the session information while login
    test.use({ storageState: './state.json'});

    test.beforeEach(async ({ page }) => {
        // inside 'With session'
        await page.goto("https://www.saucedemo.com/inventory.html")
        await expect(page).toHaveTitle(/Swag Labs/);
    });

    test('4.1 shows correctly', async({ page }) => {

        // 1. 显示所有加入购物车的商品
        

        // 2. 显示商品名称、价格、数量等信息

        // 3. Remove 按钮正常
    });
});