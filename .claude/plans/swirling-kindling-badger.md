# 友链申请：mailto → 前端表单 改造计划

## 背景

当前友链页面的申请区用的是 `mailto:` 链接，对方需要打开邮件客户端手动填写四样信息（头像、名字、网址、简介），体验差且依赖本地邮件客户端。目标是改为 jerrygao.cn 那种前端表单——用户只需输入邮箱，博主收到后主动联系。

## 技术方案

**Web3Forms** 作为表单后端（纯静态站无法自建 API）：
- 免费 250 条/月，无需绑卡
- 用户只需去 web3forms.com 输入 QQ 邮箱拿一个 access key
- 表单 POST 到 `https://api.web3forms.com/submit`，服务端发邮件通知博主

## 改什么

| 文件 | 改动 |
|---|---|
| `friends.json` | 新增 `apply` 配置对象（标题、描述、条件列表、access key 等） |
| `assets/js/main.js` | 替换硬编码的 mailto HTML → 表单 HTML + 提交事件处理 |
| `assets/css/main.css` | 删掉旧的 `.apply-email` / `.apply-format` 样式，新增表单、输入框、按钮、成功/错误状态样式 |

### 改动详情

**1. friends.json — 新增 `apply` 字段**

```json
"apply": {
    "title": "申请友链",
    "description": "如果你有优质的个人网站，欢迎互换友链。请确认满足以下条件：",
    "conditions": [
        "个人博客或独立网站，非商业推广",
        "站点内容积极健康，原创为主"
    ],
    "emailPlaceholder": "输入邮箱地址",
    "submitText": "提交申请",
    "web3formsAccessKey": "你的access_key",
    "note": "提交后博主会通过邮件与你联系。同时希望你也添加本站到你的友链。"
}
```

**2. main.js — 申请区 HTML 和表单逻辑**

- 把第 414~423 行的 mailto 硬编码替换为从 `data.apply` 读取配置、动态生成表单 HTML
- 表单结构：隐藏的 access_key + 隐藏的 honeypot 反垃圾 + email 输入框 + 提交按钮
- `root.innerHTML = html` 之后，给表单绑定 submit 事件：
  - 前端校验邮箱格式
  - AJAX 提交到 Web3Forms
  - 成功 → DOM 替换为成功提示
  - 失败 → 显示错误信息，恢复按钮

**3. main.css — 新增/替换样式**

- 删掉旧规则：`.apply-email`、`.apply-format-hint`、`.apply-format`、`.apply-format code`
- 保留并更新 `.apply-note`
- 新增：`.apply-header-icon`、`.apply-title`、`.apply-desc`、`.apply-conditions`、`.apply-condition-item`、`.apply-form`、`.apply-botcheck`、`.apply-input-row`、`.apply-email-input`、`.apply-submit-btn`、`.apply-success`、`.apply-error-msg`
- 全部使用现有 CSS 变量（`--site-line`、`--site-accent`、`--site-text` 等），与暗色主题一致
- 440px 断点下 input 和 button 上下堆叠

## 用户需要做的事情（一次性）

1. 打开 https://web3forms.com/，输入 `2701581775@qq.com`
2. 复制生成的 access key
3. 填入 `friends.json` 的 `apply.web3formsAccessKey` 字段

## 验证方式

1. 启动本地服务器预览 Friends.html
2. 空值提交 → HTML5 校验拦截
3. 无效邮箱 → JS 校验拦截，输入框变红
4. 有效邮箱提交 → 显示成功提示
5. 断网提交 → 显示错误提示
6. 移动端（440px 以下）→ 输入框和按钮上下排列
7. 检查 Web3Forms 是否发了一封通知邮件到 QQ 邮箱
