/*
SauceDemo 本身没有公开 API 文档，可以通过 拦截网络请求（Playwright page.request）模拟测试。

1. 登录 API 成功: POST /login → 输入正确账号密码 → 返回 200 & token/session。
2. 登录失败 API: POST /login → 错误密码 → 返回 401 Unauthorized。
3. 获取商品列表 API: GET /inventory → 返回商品数组 → 校验字段如 id, name, price, image_url。
4. 添加购物车 API: POST /cart → body 包含商品 id → 返回 200 & cart item 更新。
5. 完整下单流程 API（难度高）: 登录 → 添加多个商品 → GET /cart 校验商品正确 → POST /checkout → 返回订单 id → GET /orders/{id} 校验订单状态 = "completed"。 */