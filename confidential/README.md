## SSO 客戶端整合教學文件

本文件將指導您如何將 **SSO 客戶端** 整合到您的專案，並提供 **前端與後端的設定步驟**，確保應用程式能順利與 SSO 服務對接。

---

# 1. 使用建議

### 適用專案  
✅ **前後端皆有** (Full-stack)

### 整合方式  
📌 **請將所有必要檔案複製到您的專案後，再進行調整**

---

# 2. 必要檔案與修改說明

## 2.1 前端 (`confidential-frontend`)

📂 **必要檔案**：  
- `confidential-frontend/login.html` (需修改，可支援任何前端框架/原生 HTML)

📌 **修改內容**：請調整以下 3 個參數，確保它們符合您的 SSO 設定：  

```javascript
const BACKEND_URL = "http://localhost:8080";  // 你的後端服務地址
const realm = "MLIExternalRealm";  // 你的 SSO Realm 名稱
const clientId = "test";  // 你的客戶端 ID
```

💡 **設定完成後**，`login.html` 可嵌入至您的登入頁面。

---

## 2.2 後端 (`confidential-backend`)

📂 **必要檔案**：  
- `confidential-backend/src/main/java/com/keycloak/test/controller/KeycloakController.java` (需修改)

📌 **修改內容**：請調整以下 3 個參數，確保它們符合您的 SSO 設定：  

```java
private String clientId = "test";  // 你的客戶端 ID
private String clientSecret = "ILrhid1S5brjy21p9k6a0NU3DXsOTfEa";  // 你的客戶端密鑰
private String realm = "MLIExternalRealm";  // 你的 SSO Realm 名稱
```
💡 **請與 SSO 負責人確認這些參數，確保與 SSO 伺服器的設定匹配。**
---

# 3. 登入驗證與頁面權限控制

## 3.1 決定哪些頁面需要登入驗證

✅ **若某些頁面需登入後才能訪問**，請在進入該頁面前，透過 **DOM 控制** 先執行「登入狀態驗證」。  

📌 **驗證邏輯位於 `login.html` 的 `verifyToken` 方法**，可直接移植使用。  

💡 **應用示例**：  
```javascript
if (!verifyToken()) {
    window.location.href = "/login.html";  // 若未登入，則導向登入頁面
}
```

---

📢 **🎯 恭喜！當您完成上述步驟後，即已成功整合 SSO！**  
如需進一步的 SSO 調整或客製化，請聯繫您的 SSO 負責人或查閱 Keycloak 官方文件。 🚀
