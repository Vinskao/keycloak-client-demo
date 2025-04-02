## SSO 客戶端整合教學文件

本文件將指導您如何將 **SSO 客戶端** 整合到您的專案，並提供 **前端的設定步驟**，確保應用程式能順利與 SSO 服務對接。

---

# 1. 使用建議

### 適用專案  
✅ **只有前端**，且需有 **npm** 管理的專案

### 整合方式  
📌 **以下所有操作適用不同框架，但本專案使用 React，其他框架請自行確認套件安裝方式**
📌 **請將所有必要檔案複製到您的專案後，再進行調整**

---

# 2. 必要檔案與修改說明

## 2.1 所有建置所需檔案

📂 **必要檔案**：  
1. `src/App.js` (需修改)
2. 執行 `npm install` 下載 Keycloak 相關套件，此套件適用任何有 npm 管理的前端專案
3. `src/keycloak.js` (完全不需修改，請從 `public/node_modules/keycloak-js/lib/keycloak.js` 複製過來)

---

## 2.2 `src/App.js` 修改

📌 **請調整以下 3 個參數，確保它們符合您的 SSO 設定**：  

```javascript
const url = "http://localhost:8080";  // 你的後端服務地址
const realm = "MLIExternalRealm";  // 你的 SSO Realm 名稱
const clientId = "test-public";  // 你的客戶端 ID
```

💡 **請與 SSO 負責人討論參數設定，確認後 `App.js` 可整合至登入頁面。**

---

# 3. 登入驗證與頁面權限控制

✅ **決定哪些頁面需要登入驗證**  
在進入需要登入的頁面前，透過 **DOM 控制** 先執行「登入狀態驗證」。

📌 **驗證邏輯位於 `App.js` 的登入按鈕處，可直接移植使用。**  

💡 **應用示例**：  
```javascript
if (!verifyToken()) {
    window.location.href = "/login.html";  // 若未登入，則導向登入頁面
}
```

---

📢 **🎯 恭喜！當您完成上述步驟後，即已成功整合 SSO！**  
如需進一步的 SSO 調整或客製化，請聯繫您的 SSO 負責人或查閱 Keycloak 官方文件。 🚀
