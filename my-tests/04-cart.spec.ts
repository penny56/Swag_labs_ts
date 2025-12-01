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
        await expect(page).toHaveTitle(/Swag Labs/)

        // 加入2个商品作为cart test cases的 prerequisite
        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        await addButtons.nth(0).click()
        await addButtons.nth(1).click()

        // 此时的cart应该显示2个商品
        const badgeIcon = page.locator('[data-test="shopping-cart-badge"]')
        await expect(badgeIcon).toBeVisible()
        const cartCount = parseInt(await badgeIcon.textContent() || '0', 10)
        expect(cartCount).toBe(2)

        // 进入cart
        await page.locator('.shopping_cart_link').click()
        await expect(page).toHaveURL(/.*cart\.html/)
    });

    test('4.1 cart shows correctly', async({ page }) => {

        // 1. 显示所有加入购物车的商品

        // 列表商品数
        const inventoryItems = page.locator('[data-test="inventory-item"]')
        const itemCount = await inventoryItems.count()

        // cart商品数
        const badgeIcon = page.locator('[data-test="shopping-cart-badge"]')
        await expect(badgeIcon).toBeVisible()
        const cartCount = parseInt(await badgeIcon.textContent() || '0', 10)

        // 要相等
        expect(itemCount == cartCount)

        // 2. 显示商品名称、价格、数量等信息
        for (let i = 0; i < itemCount; i++) {
            let item = inventoryItems.nth(i)
            let productName = await item.locator('.inventory_item_name').textContent()
            let productPrice = await item.locator('.inventory_item_price').textContent()
            console.log(`product name: ${productName}, the price is ${productPrice}`)
        }

        // 3. Remove 按钮正常
        // 点击remove
        await inventoryItems.nth(0).getByRole('button', {name: 'Remove'}).click()

        // list数量-1
        const afterRemoveCount = await page.locator('[data-test="inventory-item"]').count()
        expect(afterRemoveCount == itemCount-1)
    });

    test('4.2 cart actions correctly', async({ page }) => {

        // 1. 点击 Continue Shopping 返回商品列表
        await page.getByRole('button', {name: 'Continue Shopping'}).click()
        await expect(page).toHaveURL(/.*inventory\.html/)
        await page.goBack()

        // 2. 点击 Checkout 进入结账流程
        await page.getByRole('button', {name: 'Checkout'}).click()
        await expect(page).toHaveURL(/.*checkout-step-one\.html/)
    });
});