import {test, expect } from '@playwright/test'

enum userType {
    normalUser = 'standard_user', 
    lockUser = 'locked_out_user',
    problemUser = 'problem_user',
}

const password: string = "secret_sauce"

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

    test('11.1 product name and details name do not match', async({ page }) => {
        const productNames = page.locator('[data-test="inventory-item-name"]')
        await expect(productNames).toHaveCount(6)
        const nameCount = await productNames.count()
        for (let i=0; i<nameCount; i++) {
            const productName = productNames.nth(i)
            const nameString = await productName.textContent() ?? ''

            // 进入某商品详情页
            await productName.click()
            const detailsNameString = await page.locator('[data-test="inventory-item-name"]').textContent() ?? ''
            
            // 确保商品名相同
            expect(detailsNameString).toEqual(nameString)

            // 退出当前 details 页面，才能进入下一个 details 页面。
            await page.goBack()
        }
        
    });

    test('11.2 click "add to cart" but not added', async({ page }) => {
        const cartIcon = page.locator('span[data-test="shopping-cart-badge"]')
        let initCart: number
        let currCart: number

        // await page.pause()
        if (await cartIcon.isVisible()) {
            initCart = parseInt(await cartIcon.textContent() || '0', 10)
        }
        else {
            initCart = 0
        }

        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        const addCount = await addButtons.count()
        for (let i=0; i<addCount; i++) {
            const addButton = addButtons.first()
            await addButton.click()
            currCart = parseInt(await cartIcon.textContent() || '0', 10)
            
            // 点击一次 'add to cart' ，badge 就加1
            expect(currCart).toEqual(initCart+i+1)

        }
    });

});