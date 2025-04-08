請使用VS Code Live Server啟動
![alt text](image.png)

- 登入頁面：`http://127.0.0.1:5500/confidential/confidential-frontend/login.html`

# 1. 必要檔案與修改說明
**必要檔案**：
- `confidential-frontend/login.html` (不需修改，可支援任何前端框架/原生 HTML，但可拆分function放到適合之處)
- `confidential-frontend\config.js` (需修改，環境變數)

**修改內容**：請調整`config.js` 4 個參數，確保它們符合您的 SSO 設定：  

```javascript
CLIENTID: "test", // 需求訪談後取得
REALM: "MLIExternalRealm",  // 需求訪談後取得
BACKEND_URL: "http://localhost:8081", // 你的後端
SSO_URL: "http://localhost:8080"  // 需求訪談後取得
```

**設定完成後**，`login.html` 可嵌入至您的登入頁面。

# 2. 登入驗證與頁面權限控制

## 2.1 決定哪些頁面需要登入驗證

**若某些頁面需登入後才能訪問**，請在進入該頁面前，透過 **DOM 控制** 先執行「登入狀態驗證」。  

**驗證邏輯位於 `login.html` 的 `verifyToken` 方法**，可直接移植使用。  

💡 **應用示例**：  
```javascript
if (!verifyToken()) {
    window.location.href = "/login.html";  // 若未登入，則導向登入頁面
}
```