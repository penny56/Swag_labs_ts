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

    test('2.1 inventory page verification', async({ page }) => {

        // 1. total 6 products in this page
        const inventoryList = page.locator('[data-test="inventory-list"]')
        const inventoryItems = inventoryList.locator('[data-test="inventory-item"]')
        await expect(inventoryItems).toHaveCount(6)

        // 2. 每个产品是否显示图片、名称、价格
        // 每个 item 里都应该有这些元素，这就不需要 for 循环了
        await expect(inventoryItems.locator('img.inventory_item_img')).toHaveCount(6)
        await expect(inventoryItems.locator('[data-test="inventory-item-name"]')).toHaveCount(6);
        await expect(inventoryItems.locator('[data-test="inventory-item-price"]')).toHaveCount(6);

        // 3. 产品排序功能下拉框是否显示四个选项
        const sortDropDown = page.locator('[data-test="product-sort-container"]')

        await expect(sortDropDown).toBeVisible()

        const options = sortDropDown.locator('option')
        await expect(options).toHaveCount(4)

    });

    test('2.2 inventory page sort', async({ page }) => {

        const inventoryList = page.locator('[data-test="inventory-list"]')
        const inventoryItems = inventoryList.locator('[data-test="inventory-item"]')

        // 1. 按名称 A→Z
        const sortDropDown = page.locator('[data-test="product-sort-container"]')
        await sortDropDown.selectOption('az')

        // names is a list
        const namesAz = await inventoryItems.locator('[data-test="inventory-item-name"]').allTextContents()

        // 本地排序（复制一个数组，避免修改原始）
        const sortedAz = [...namesAz].sort((a, b) => a.localeCompare(b));

        // 验证排序正确
        expect(namesAz).toEqual(sortedAz);

        // 2. 名称 Z→A
        await sortDropDown.selectOption('za')
        const namesZa = await inventoryItems.locator('[data-test="inventory-item-name"]').allTextContents()
        const sortedZa = [...namesZa].sort((a, b) => b.localeCompare(a))
        expect(namesZa).toEqual(sortedZa)

        // 3. 价格 Low→High
        await sortDropDown.selectOption('lohi')
        const pricesLhText = await inventoryItems.locator('[data-test="inventory-item-price"]').allTextContents()
        const pricesLh = pricesLhText.map(price => parseFloat(price.replace('$', '')))
        const sortedLh = [...pricesLh].sort((a, b) => a - b)
        expect(pricesLh).toEqual(sortedLh)


        // 4. 价格 High→Low
        await sortDropDown.selectOption('hilo')
        const pricesHlText = await inventoryItems.locator('[data-test="inventory-item-price"]').allTextContents()
        const pricesHl = pricesHlText.map(price => parseFloat(price.replace('$', '')))
        const sortedHl = [...pricesHl].sort((a, b) => b - a)
        expect(pricesHl).toEqual(sortedHl)
    });

    test('2.3 inventory page details', async({ page }) => {
        
        const firstProduct = page.locator('[data-test="inventory-list"]').locator('[data-test="inventory-item"]').first()

        // 1. 点击产品标题跳转到详情页
        await firstProduct.locator('[data-test="inventory-item-name"]').click()
        await expect(page).toHaveURL(/id=/);

        // 2. 点击产品图片也应跳转
        await page.goBack()
        await firstProduct.locator('img.inventory_item_img').click()
        await expect(page).toHaveURL(/id=/)

        // 3. 返回列表功能 Back to products 正常
        await page.getByRole('button', {name: 'Back to products'}).click()
        await expect(page).not.toHaveURL(/id=/);

    });
});