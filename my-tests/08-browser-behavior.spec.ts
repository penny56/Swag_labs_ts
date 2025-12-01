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

    test('8.1 browser page refresh', async({ page }) => {

        // 1. 刷新产品页 → 状态保持
        await page.goto("https://www.saucedemo.com/inventory.html")
        await expect(page.locator('span.title')).toHaveText('Products')

        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        const removeButtons = page.getByRole('button', {name: 'Remove'})
        const badgeIcon = page.locator('[data-test="shopping-cart-badge"]')

        let addCount: number
        let removeCount: number
        let badgeIconCount: number
        
        // 加2个product进cart
        await addButtons.nth(0).click()
        await addButtons.nth(1).click()

        // before refresh - check the counts
        addCount = await addButtons.count()
        expect(addCount).toBe(4)
        removeCount = await removeButtons.count()
        expect(removeCount).toBe(2)
        badgeIconCount = parseInt(await badgeIcon.textContent() || '0', 10)
        expect(badgeIconCount).toBe(2)

        // refresh the browser        
        await page.reload()

        // after refresh - check the counts, should not changed.
        addCount = await addButtons.count()
        expect(addCount).toBe(4)
        removeCount = await removeButtons.count()
        expect(removeCount).toBe(2)
        badgeIconCount = parseInt(await badgeIcon.textContent() || '0', 10)
        expect(badgeIconCount).toBe(2)

        // 2. 刷新购物车页面 → 商品不丢失
        await page.locator('.shopping_cart_link').click()
        await expect(page).toHaveURL(/.*cart\.html/)

        // before refresh - check the count of products
        const inventoryItems = page.locator('[data-test="inventory-item"]')
        let itemCount = await inventoryItems.count()
        expect(itemCount).toBe(2)

        // refresh the page
        await page.reload()

        // after refresh - chech the counts
        itemCount = await inventoryItems.count()
        expect(itemCount).toBe(2)

    });

    test('8.2 backword forward', async({ page }) => {

        // 1. 登录后返回 → 不应回到登录页（有 session）
        // 而并没有这样做！

        // 2. 下单完成后点击浏览器后退 → 不应重新创建订单
        // 实在没什么意义
    });


});