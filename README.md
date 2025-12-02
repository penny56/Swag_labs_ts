# 🚀 软件测试用例 (Test Cases)

## 1. 登录模块 (Login)
### 1.1 正常登录 (Positive Testing)
* 使用标准账号（standard_user）成功登录首页
* 登录后 URL 应变为 /inventory.html
* 页面应显示产品列表

### 1.2 异常登录 (Negative Testing)
* 用户名为空，密码正确 → 提示错误信息
* 用户名正确，密码为空 → 提示错误信息
* 用户名为空、密码为空 → 提示错误信息
* 密码错误 → 登录失败提示
* 使用 locked_out_user → 提示“用户被锁定”
* 使用 problem_user → 页面资源加载异常（图片损坏，按钮错乱）
* 使用 error_user → 页面加载异常（用于特殊情况测试）

## 2. 产品列表页 (Inventory)
### 2.1 页面内容验证
* 产品数量是否为 6 个
* 每个产品是否显示图片、名称、价格
* 产品排序功能下拉框是否显示四个选项

### 2.2 排序功能测试
* 按名称 A→Z
* 名称 Z→A
* 价格 Low→High
* 价格 High→Low

### 2.3 进入产品详情页
* 点击产品标题跳转到详情页
* 点击产品图片也应跳转
* 返回列表功能 Back to products 正常

## 3. 购物车 (Add to Cart)
### 3.1 添加商品
* 列表页添加 1 个商品，购物车徽标数量应更新
* 添加多个商品，数量正确累加
* 在详情页添加商品

### 3.2 移除商品
* 列表页点击 Remove 后商品从购物车中消失
* 详情页点击 Remove
* 添加后重新进入详情页按钮变为 Remove

### 3.3 购物车图标
* 购物车数量清零后徽标应消失

## 4. 购物车页面 (Cart)
### 4.1 正常显示
* 显示所有加入购物车的商品
* 显示商品名称、价格、数量等信息
* Remove 按钮正常

### 4.2 跳转行为
* 点击 Continue Shopping 返回商品列表
* 点击 Checkout 进入结账流程

## 5. 结账流程 (Checkout)
### 5.1 Step One：填写用户信息
* 正常填写（First Name、Last Name、Zip）→ 进入 Step Two
* 三项任意一项为空 → 提示相应错误

### 5.2 Step Two：确认订单信息
* 展示所有商品
* 显示小计、税额、总金额正确（金额计算）

### 5.3 Step Three：订单完成页面
* 点击 Finish → 显示 “Thank you for your order”
* 显示订单成功图片
* Back Home 跳回首页

## 6. 菜单 (Menu)（左上角汉堡菜单）
### 6.1 菜单功能
* 点击打开菜单，显示四项：All Items / About / Logout / Reset App State
* 点击关闭菜单按钮正常

### 6.2 菜单选项
* Logout → 返回登录页
* About → 跳转到 Sauce Labs 官网
* Reset App State → 所有购物车状态清空

## 7. 页面 UI 和元素一致性（常见面试项）
* 所有“Add to cart”按钮样式一致
* 所有商品图片加载成功（排除 problem_user 场景）
* 断言各页面的标题（Products / Your Cart / Checkout）

## 8. 浏览器行为类
### 8.1 刷新页面
* 刷新产品页 → 状态保持
* 刷新购物车页面 → 商品不丢失

### 8.2 后退前进
* 登录后返回 → 不应回到登录页（有 session）
* 下单完成后点击浏览器后退 → 不应重新创建订单

## 9. Session & 安全
* 未登录直接访问 /inventory.html → 应跳转回登录
* 登录后打开新标签访问 inventory → 自动登录状态应一致
* Logout 后访问任何内部 URL → 应被重定向到登录页

## 10. problem_user / glitch_user 专用测试
> （这是 SauceDemo 提供的“用于测试 bug 的账号”）

* 图片加载失败
* Add to cart 按钮顺序混乱
* 商品排序失败
* 详情页返回按钮异常
* （面试常问：如何写 Playwright 断言识别这些异常）


## ✅ 10. Problem User / Glitch User 常见异常 & 对应 Test Scenarios

以下 4 大类异常是 SauceDemo 面试最常问的：

### A. 图片加载失败 (Image loading issue)

#### Case 1：商品列表页图片加载失败
* **Steps:**
    1. 登录 `problem_user`。
    2. 进入 Products 页面。
    3. 定位所有商品图片 `<img>` 元素。
* **断言 (Assertions):**
    * 某些图片的 `src` 属性值不正确。
    * 断言图片请求失败或加载失败（如 `img.complete = false` 或 `naturalWidth = 0`）。

#### Case 2：商品详情页图片加载失败
* **Steps:**
    1. 登录 `problem_user`。
    2. 进入任一商品的详情页。
* **断言 (Assertions):**
    * 检查并断言主图片加载状态为失败。

### B. Add to cart 按钮顺序混乱

#### Case 1：按钮与商品名称不匹配
* **Steps:**
    1. 登录 `problem_user`。
    2. 获取页面上所有商品名称的列表（顺序）。
    3. 获取页面上所有 "Add to Cart" 按钮的列表。
* **断言 (Assertions):**
    * 断言按钮的顺序与商品列表的顺序不一致。

#### Case 2：同一商品点击 Add to Cart 后状态异常
* **Steps:**
    1. 登录 `problem_user`。
    2. 点击某商品对应的 "Add to Cart" 按钮。
    3. 检查购物车 Badge 数量是否正确增加 `+1`。
    4. 刷新页面。
* **断言 (Assertions):**
    * 断言购物车 Badge 数量没有增加（Bug 表现）。
    * 断言刷新页面后，商品状态被意外重置或丢失（Bug 表现）。

### C. 商品排序失败

#### Case 1：名称排序 A → Z 失败
* **Steps:**
    1. 登录 `problem_user`。
    2. 设置 Sort 下拉框选项为 **A to Z** (Name (A to Z))。
    3. 获取所有商品名称的文本内容。
* **断言 (Assertions):**
    * 断言获取到的名称列表的实际顺序 **不等于** 预期排好序的列表。

#### Case 2：价格排序 Low → High 失败
* **Steps:**
    1. 登录 `problem_user`。
    2. 切换 Sort 下拉框选项为 **Low to High** (Price (low to high))。
    3. 获取所有商品的价格文本。
    4. 将价格文本解析并转换为浮点数。
* **断言 (Assertions):**
    * 断言转换后的浮点数列表 **不是** 严格的升序排列。
