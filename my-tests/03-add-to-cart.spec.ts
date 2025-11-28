import {test, expect } from '@playwright/test'
import { count } from 'console';

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

    test('3.1 add products', async({ page }) => {

        // 1. 列表页添加 1 个商品，购物车徽标数量应更新
        let initCount = 0
        let badgeIcon = page.locator('[data-test="shopping-cart-badge"]')

        if (await badgeIcon.isVisible()) {
            // textContent() 返回 "3" 或者 null
            // || '0' => 把 null 替换成 '0'
            // parseInt() => 把 字符串 '3' 替换成数字 3，末尾的10表示10进制
            initCount = parseInt(await badgeIcon.textContent() || '0', 10)
        }

        const addButtons = page.getByRole('button', {name: 'Add to cart'})

        await addButtons.nth(0).click()

        await expect(badgeIcon).toBeVisible()
        let currCount = parseInt(await badgeIcon.textContent() || '0', 10)
        expect(currCount == initCount+1)

        // 2. 添加多个商品，数量正确累加
        // 加2nd
        await addButtons.nth(1).click()

        await expect(badgeIcon).toBeVisible()
        currCount = parseInt(await badgeIcon.textContent() || '0', 10)
        expect(currCount == initCount+1+1)
    

        // 3. 在详情页添加商品
        // 定位还为加入cart的商品description
        const detailsProduct = addButtons.nth(2).locator('xpath=ancestor::div[contains(@class, "inventory_item_description")]')
        
        // click name to enter detail page
        await detailsProduct.locator('[data-test="inventory-item-name"]').click()
        await expect(page).toHaveURL(/id=/)

        await page.getByRole('button', {name: 'Add to cart'}).click()

        await expect(badgeIcon).toBeVisible()
        currCount = parseInt(await badgeIcon.textContent() || '0', 10)
        expect(currCount == initCount+1+1+1)

    });


    test('3.2 remove products', async({ page }) => {

        // 1. 列表页点击 Remove 后商品从购物车中消失
        // add one before remove
        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        await addButtons.nth(0).click()

        // find and remve the product
        let removeButtons = page.getByRole('button', {name: 'Remove'})
        await removeButtons.nth(0).click()

        // 2. 详情页点击 Remove
        await addButtons.nth(1).click()
        removeButtons = page.getByRole('button', {name: 'Remove'})
        const detailsProduct = removeButtons.nth(0).locator('xpath=ancestor::div[contains(@class, "inventory_item_description")]')

        // click name to enter detail page
        await detailsProduct.locator('[data-test="inventory-item-name"]').click()
        await expect(page).toHaveURL(/id=/)

        // click
        await page.getByRole('button', {name: 'Remove'}).click()
        await expect(page.getByRole('button', {name: 'Add to cart'})).toBeVisible()

        // 3. 添加后重新进入详情页按钮变为 Remove
        // 我的理解是与上一步操作很像：在list表面把这个product加入cart，再进入这个产品的details页面，页面上就会显示 remove 按钮。

    });


    test('3.3 cart icon ', async({ page }) => {

        // 1. 购物车数量清零后徽标应消失
        // 向cart添加一个商品
        const addButtons = page.getByRole('button', {name: 'Add to cart'})
        await addButtons.nth(0).click()

        // 遍砘所有product，挑选带 remove 的商品，点击 remove
        const removeButtons = page.getByRole('button', {name: 'Remove'})
        const removeButtonsCount = await removeButtons.count()
        for (let i = 0; i < removeButtonsCount; i++) {
            await removeButtons.nth(i).click()
        }

        // 验证cart图标不存在
        const badgeIcon = page.locator('[data-test="shopping-cart-badge"]')
        await expect(badgeIcon).not.toBeVisible()
    });

});