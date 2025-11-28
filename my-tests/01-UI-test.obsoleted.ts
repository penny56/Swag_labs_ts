/*

因为：
1. laywright 的设计理念：每个 test() 默认会运行在全新的上下文里（新的 browserContext + page），目的是让测试相互独立，不互相污染。
2. storageState 只能保存浏览器的登录状态（cookie、localStorage），但它不会保存你的 购物车里的数据。
所以，每个test都需要再向cart中添加products，否则只会得到一个空的cart

Easy:
1. login failed: 输入正确用户名和密码 → 登录成功 → 定位到产品列表页。
2. login success: 输入错误密码 → 登录失败 → 页面显示错误提示。
3. 添加商品到购物车: 在产品列表页，点击 “Add to cart” → 购物车图标显示数量增加。
4. 移除购物车商品: 添加商品 → 点击 “Remove” → 购物车数量减少。
5. 查看购物车详情: 添加多个商品 → 点击购物车图标 → 检查购物车内商品是否正确。
商品排序功能: 切换 “Price (low to high)” 排序 → 检查商品价格顺序是否正确。
Medium:
6. 结账流程 (Checkout Step 1 → Step 2 → Finish): 购物车 → Checkout → 填写 First Name, Last Name, Postal Code → 检查订单信息是否展示正确。
6. 订单完成页验证: 完成支付 → 验证 “Thank you for your order” 页面出现。
7. 登出功能: 点击菜单 → Logout → 回到登录页面。
9. 多用户角色测试（锁定用户 locked_out_user）
    - 用 locked_out_user 登录 → 验证被阻止信息。
    - 用 problem_user 登录 → 验证图片错误或 UI 异常是否出现。 */

import { test, expect } from '@playwright/test'

let usernameArray: string[] = []
let passwordArray: string[] = []

test.beforeEach(async ({ page }, testInfo) => {
    console.log('>>> Str to -------> ', testInfo.title)
});

test.afterEach(async ({ page }, testInfo) => {
    console.log('=== End of =======> ', testInfo.title)
});

test.describe('No session', () => {

    test.beforeEach(async ({ page }) => {
        // inside 'No session'
        await page.goto("https://www.saucedemo.com/")
        await expect(page).toHaveTitle(/Swag Labs/);
    });

    test('0. get information', async ({ page }) => {

        // get the usernames
        const usernamesRow = await page.locator('#login_credentials').innerText()

        // throw the head and the tail
        usernameArray = usernamesRow.split('\n').slice(1, -1)
        if (usernameArray.length === 0) {
            throw new Error('usernameArray is empty!');
        }
        console.log('usernameArray: ', usernameArray)

        const passwordRow = await page.locator('.login_password').innerText()

        // throw the head only in the password table
        passwordArray = passwordRow.split('\n').slice(1)
        if (usernameArray.length === 0) {
            throw new Error('passwordArray is empty!');
        }

        console.log('passwordArray: ', passwordArray)

    });

    test('1. login failed', async ({ page }) => {

        const loginName = usernameArray[Math.floor(Math.random() * usernameArray.length)]!
        const loginPasswordFail = passwordArray[0] + 'abc'

        console.log(`loginName: ${loginName}, loginPasswordFail: ${loginPasswordFail}`)

        await page.getByPlaceholder('Username').fill(loginName)
        await page.getByPlaceholder('Password').fill(loginPasswordFail)

        await page.locator('#login-button').click()

        await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible()

        await page.waitForTimeout(3000)

    });

    test('2. login success', async ({ page }) => {

        // have confirmed the arrays are not empty while fill the arrays
        // const loginName = usernameArray[Math.floor(Math.random() * usernameArray.length)]!
        const loginName = 'standard_user'
        const loginPasswordSuccess = passwordArray[0]!

        console.log(`loginName: ${loginName}, loginPasswordFail: ${loginPasswordSuccess}`)

        await page.getByPlaceholder('Username').fill(loginName)
        await page.getByPlaceholder('Password').fill(loginPasswordSuccess)

        await page.locator('#login-button').click()

        await expect(page).toHaveTitle('Swag Labs')

        const context = page.context()

        // save session to state.json in root/ directory
        await context.storageState({ path: './state.json' })
    });

});

test.describe('With session', () => {

    test.beforeEach(async ({ page }) => {
        // inside 'With session'
        await page.goto("https://www.saucedemo.com/inventory.html")
        await expect(page).toHaveURL(/inventory.html/)
    });

    // use the session information while login
    test.use({ storageState: './state.json' });

    test('3. add product to cart', async ({ page }) => {

        const addButtons = page.getByRole('button', { name: 'Add to cart' })

        await expect(addButtons.nth(0)).toBeVisible()

        // add one product
        await addButtons.nth(0).click()

        // locator 是 懒查找，只是一个引用，不会真正去查找元素，所以把它提前声明不会报错。
        // 真正发生查找是调用异步方法时，如 await cartBadge.click() 或 await expect(cartBadge).toBeVisible()
        const cartBadge = page.locator('span[data-test="shopping-cart-badge"]');

        await expect(cartBadge).toBeVisible();   // 等 badge 出现
        const oldCount = await cartBadge.innerText();
        console.log('Ole cart count: ', oldCount);

        // add another product
        await addButtons.nth(1).click()

        await expect(cartBadge).toBeVisible();   // 等 badge 出现
        const newCount = await cartBadge.innerText();
        console.log('New cart count: ', newCount);

        await page.waitForTimeout(5000)

    });

    test('4. remove product from cart', async ({ page }) => {

        // add first
        const addButtons = page.getByRole('button', { name: 'Add to cart' })
        await expect(addButtons.nth(0)).toBeVisible()
        await addButtons.nth(0).click()

        // check the badge apear, show the badge number
        const cartBadge = page.locator('span[data-test="shopping-cart-badge"]');
        await expect(cartBadge).toBeVisible();
        const badgeText = await cartBadge.innerText();
        console.log('Badge count after add:', badgeText);

        // remove the production
        const removeButtons = page.locator('button.btn.btn_secondary.btn_small.btn_inventory')
        const removeButtonCount = await removeButtons.count()

        if (removeButtonCount > 0) {
            await removeButtons.nth(0).click()
        } else {
            throw new Error("No remove button, terminated!");
        }

        await expect(cartBadge).toHaveCount(0);

        await page.waitForTimeout(5000)

    });


    test('5. Check the cart details', async ({ page }) => {

        /*  Add 2 products into the cart
            enter the cart details page
            very the product name and price */

        // assume there are 6 products inside single page
        const productCountPerPage: number = 6
        let cartNeeded: number = 2
        let productPriceDict: Record<string, string> = {}


        const inventoryList = page.locator('css=div.inventory_list')
        await expect(inventoryList).toBeVisible()

        const inventoryItems = inventoryList.locator('div.inventory_item_description')
        await expect(inventoryItems).toHaveCount(productCountPerPage)  // 假设这里一页显示6个

        for (let i = 0; i < productCountPerPage; i++) {
            const productInfo = await inventoryItems.nth(i).innerText()
            const productName: string = productInfo.split('\n').at(0) ?? ""
            const productPrice: string = productInfo.split('\n').at(2) ?? ""
            const addOrRemove: string = productInfo.split('\n').at(-1) ?? ""

            // verify if this product have not added to cart
            if (addOrRemove === 'Add to cart') {
                // 1. new added the productName and productPrice
                productPriceDict[productName] = productPrice

                // 2. click 'add to cart'
                // the only button is the 'add to cart' button
                await inventoryItems.nth(i).getByRole('button').click()

                // 3. verify the link turned to 'remove'
                await expect(inventoryItems.nth(i).getByRole('button')).toHaveText('Remove')

                // 4. got 2?
                cartNeeded--
                if (cartNeeded === 0) {
                    break
                }
            }
        }

        console.log('productPriceDict: ', productPriceDict)

        // conform the cart badge is 2

        // Click to enter cart detail page
        await page.locator('css=a.shopping_cart_link').click()
        await expect(page).toHaveURL(/cart.html/)

        const cartItems = page.locator('css=div.cart_item')
        await expect(cartItems).toHaveCount(2)

        // verify the product and its price
        for (let i = 0; i < 2; i++) {
            const cartItemInfo = await cartItems.nth(i).innerText()
            const cartItemName = cartItemInfo.split('\n').at(1) ?? ""
            const cartItemPrice = cartItemInfo.split('\n').at(3) ?? ""
            expect(productPriceDict[cartItemName]).toBe(cartItemPrice)
        }

    });

    test('6. check out', async ({ page }) => {

        /*  add products to cart
            click checkout button, and verify goto step-one page
            fill in the blanks and click continue
            verify the total amount
            submit */

        page.pause()
        const addButtons = page.getByRole('button', { name: 'Add to cart' })
        await expect(addButtons.nth(0)).toBeVisible()
        await addButtons.nth(0).click()
        await expect(addButtons.nth(1)).toBeVisible()
        await addButtons.nth(1).click()

        // goto details page
        const cartLink = await page.locator('css=a.shopping_cart_link').click()
        await expect(page).toHaveURL(/cart.html/)

        // click checkout button, and verify goto step-one page
        await page.getByRole('button', {name: 'Checkout'}).click()
        await expect(page).toHaveURL(/checkout-step-one.html/)

        // fill in the blanks and click continue
        await page.getByRole('textbox', {name: 'First Name'}).fill("Ying Chun")
        await page.getByRole('textbox', {name: 'Last Name'}).fill("Zhang")
        await page.getByRole('textbox', {name: 'Zip/Postal Code'}).fill("100000")

        await page.getByRole('button', {name: 'Continue'}).click()
        await expect(page).toHaveURL(/checkout-step-two.html/)

        // verify the total number
        let priceNumber: number = 0
        let totalNumber: number = 0
        let totalCount: number = 0

        // sum up all the productions price
        const productPrices = page.locator('css=div.inventory_item_price')
        totalCount = await productPrices.count()
        for (let i = 0; i < totalCount; i++) {
            const priceInfo = await productPrices.nth(i).innerText()
            priceNumber = Number(priceInfo.slice(1))
            totalNumber += priceNumber
        }

        // add the tax
        const taxInfo = await page.locator('css=div.summary_tax_label').innerText()
        const lastPart1 = taxInfo.split(' ').at(-1) ?? "$0";  // 防止 undefined
        totalNumber += Number(lastPart1.slice(1));

        // double check
        const showTotal = await page.locator('css=div.summary_total_label').innerText()
        const lastPart2 = showTotal.split(' ').at(-1) ?? "$0"; // 防止 undefined
        const showTotalNumber = Number(lastPart2.slice(1));
        console.log("showTotalNumer: ", showTotalNumber)
        expect(totalNumber).toBe(showTotalNumber)

        // submit
        await page.getByRole('button', {name: 'Finish'}).click()

        // confirm
        await expect(page.getByRole('heading', {name: 'Thank you for your order!'})).toBeVisible()

        // back to home
        await page.getByRole('button', {name: 'Back Home'}).click()
        await expect(page).toHaveURL(/inventory.html/)
    });

    test('7. Log out', async ({ page }) => {

        await page.locator('#react-burger-menu-btn').click()
        await page.locator('#logout_sidebar_link').click()
        await expect(page.locator('#login-button')).toBeVisible()
    });

});

