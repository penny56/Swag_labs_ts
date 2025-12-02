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

    test('12.1 inventory Z-A sort failed', async({ page }) => {

        // 1. 名称 Z→A
        const sortDropDown = page.locator('[data-test="product-sort-container"]')
        await sortDropDown.selectOption('za')
        const namesZa = await page.locator('[data-test="inventory-item-name"]').allTextContents()
        const sortedZa = [...namesZa].sort((a, b) => b.localeCompare(a))
        expect(namesZa).toEqual(sortedZa)
    });

    test('12.2 inventory Low → High sort failed', async({ page }) => {
        
        // 1. 价格 Low→High
        const sortDropDown = page.locator('[data-test="product-sort-container"]')
        await sortDropDown.selectOption('lohi')
        const pricesLhText = await page.locator('[data-test="inventory-item-price"]').allTextContents()
        const pricesLh = pricesLhText.map(price => parseFloat(price.replace('$', '')))
        const sortedLh = [...pricesLh].sort((a, b) => a - b)
        expect(pricesLh).toEqual(sortedLh)
    });

});