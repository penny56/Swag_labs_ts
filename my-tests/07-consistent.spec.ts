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

    test('7.1 "Add to cart" icon consistent', async({ page }) => {

        // 每个按钮的 css 属性都相同
        
        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        const addCount = await addButtons.count()
        
        expect(addCount).toBeGreaterThan(0)

        // 选择1st按钮作为基准样式
        const first = addButtons.first()

        // 读取first元素的backgroundColor / fontSize / 这些CSS值，作为基准
        const baseBackground = await first.evaluate(el => window.getComputedStyle(el).backgroundColor)
        const baseFontSize = await first.evaluate(el => window.getComputedStyle(el).fontSize)
        const baseRadius = await first.evaluate(el => window.getComputedStyle(el).borderRadius)
        const baseColor = await first.evaluate(el => window.getComputedStyle(el).color)

        // 依次验证这些按钮的这些属性都一致
        for (let i=1; i<0; i++) {
            const button = addButtons.nth(i)
            await expect(button).toHaveCSS('backgroundColor', baseBackground)
            await expect(button).toHaveCSS('fontSize', baseFontSize)
            await expect(button).toHaveCSS('borderRadius', baseRadius)
            await expect(button).toHaveCSS('color', baseColor)
        }
    });

    test('7.2 product pictures loading success', async({ page }) => {

        // 验证图片是否加载成功 = 检查 naturalWidth > 0
        const images = page.locator('img.inventory_item_img')
        const imageCount = await images.count()
        expect(imageCount).toBeGreaterThan(0)

        for(let i=0; i<imageCount; i++) {
            const image = images.nth(i)

            // naturalWidth > 0 代表图片成功加载
            const isLoaded = await image.evaluate(el => (el as HTMLImageElement).naturalWidth > 0)

            expect(isLoaded).toBe(true)
        }

    });

    test('7.3 page titles correction', async({ page }) => {
        
        // 断言各页面的标题（Products / Your Cart / Checkout）
        await expect(page.locator('span.title')).toHaveText('Products')

        // 进入 cart
        await page.locator('.shopping_cart_link').click()
        await expect(page.locator('span.title')).toHaveText('Your Cart')

        // 进入 check out
        await page.getByRole('button', {name: 'Checkout'}).click()
        await expect(page).toHaveURL(/.*checkout-step-one\.html/)
        await expect(page.locator('span.title')).toHaveText('Checkout: Your Information')
    });
});