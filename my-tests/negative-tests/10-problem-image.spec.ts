import {test, expect } from '@playwright/test'

enum userType {
    normalUser = 'standard_user', 
    lockUser = 'locked_out_user',
    problemUser = 'problem_user',
}

const password: string = "secret_sauce"

const problemImagePrefix: string = "sl-404"

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.use({ storageState: undefined })

    test.beforeEach(async ({ page }) => {
        // inside 'No session'
        await page.goto("https://www.saucedemo.com/")
        await expect(page).toHaveTitle(/Swag Labs/)

        // 登录 problem_user
        await page.locator('#user-name').fill(userType.problemUser)
        await page.locator('#password').fill(password)
        await page.locator('#login-button').click()
        
        // 进入 Products 页面
        await expect(page.locator('span[data-test="title"]')).toHaveText("Products")
    });


    // 验证图片是否正确有多个方法，但是没有一个唯一的办法。一般是利用 alt 属性，但是本例中 alt 属性是正确的。
    // 可以通过不要让图片 src 带 sl-404 的方法。
    // <img alt="Sauce Labs Bolt T-Shirt" class="inventory_item_img" src="/static/media/sl-404.168b1cce10384b857a6f.jpg" data-test="inventory-item-sauce-labs-bolt-t-shirt-img">
    // <img alt="Sauce Labs Bolt T-Shirt" class="inventory_item_img" src="/static/media/bolt-shirt-1200x1500.c2599ac5f0a35ed5931e.jpg" data-test="inventory-item-sauce-labs-bolt-t-shirt-img">
    test('10.1 product page images load failed', async({ page }) => {

        // 定位所有商品图片 <img>
        const images = page.locator('img.inventory_item_img')
        await expect(images).toHaveCount(6)
        const imagesCount = await images.count()
        for (let i=0; i<imagesCount; i++) {
            const src = await images.nth(i).getAttribute('src')
            // 确保没有问题图片
            expect(src).not.toContain(problemImagePrefix)
        }
    });

    test('10.2 detail page images load failed', async({ page }) => {
        const productNames = page.locator('[data-test="inventory-item-name"]')
        await expect(productNames).toHaveCount(6)
        const nameCount = await productNames.count()
        for (let i=0; i<nameCount; i++) {
            const productName = productNames.nth(i)

            // 进入某商品详情页
            await productName.click()
            const detailsImg = page.locator('img.inventory_details_img')
            const src = await detailsImg.getAttribute('src')
            // 确保没有问题图片
            expect(src).not.toContain(problemImagePrefix)
            console.log(`src = ${src}`)

            // 退出当前 details 页面，才能进入下一个 details 页面。
            await page.goBack()
        }
    });

});