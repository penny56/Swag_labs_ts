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
        expect(cartCount == 2)

        // 进入cart
        await page.locator('.shopping_cart_link').click()
        await expect(page).toHaveURL(/.*cart\.html/)

        // 点击 Checkout 进入结账流程
        await page.getByRole('button', {name: 'Checkout'}).click()
        await expect(page).toHaveURL(/.*checkout-step-one\.html/)
    });

    // checkout 流程是串行的，就放在一个 test case 里就好
    test('5.0 checkout flow', async({ page }) => {

        // 5.1 Step One：填写用户信息

        // 正常填写（First Name、Last Name、Zip）→ 进入 Step Two
        await page.getByPlaceholder('First Name').fill('Matt')
        await page.getByPlaceholder('Last Name').fill('Phinix')
        await page.getByPlaceholder('Zip/Postal Code').fill('100000')
        await page.locator('#continue').click()
        await expect(page).toHaveURL(/.*checkout-step-two\.html/)

        // 三项任意一项为空 → 提示相应错误

        // 5.2 Step Two：确认订单信息

        // 展示所有商品，得到列表总价格
        const cartItems = page.locator('.cart_item')
        const cartCount = await cartItems.count()

        // 计算商品价格
        let cartSum = 0
        for (let i=0; i<cartCount; i++) {
            let itemPriceStr = await cartItems.nth(i).locator('.inventory_item_price').textContent()
            let itemPriceFloat = parseFloat((itemPriceStr ?? "0").replace('$', ''))
            cartSum += itemPriceFloat
        }

        // 计算税
        const taxStr = await page.locator('.summary_tax_label').textContent()
        const taxText = taxStr ?? ""
        const taxFloat = parseFloat(taxText.split('$')[1] ?? "0")

        // 计算总额
        const totalStr = await page.locator('.summary_total_label').textContent()
        const totalText = totalStr ?? ""
        const totalFloat = parseFloat(totalText.split('$')[1] ?? "0")      
        
        // 验证
        expect(totalFloat == cartSum+taxFloat)

        // 5.3 Step Three：订单完成页面

        // 点击 Finish → 显示 “Thank you for your order”
        await page.locator('#finish').click()
        await expect(page.getByRole('heading', {name: 'Thank you for your order!'})).toBeVisible()

        // 显示订单成功图片

        // Back Home 跳回首页
        await page.locator('#back-to-products').click()
        await expect(page).toHaveURL(/.*inventory\.html/)
    });
});