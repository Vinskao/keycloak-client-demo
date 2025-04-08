## SSO 客戶端整合教學文件

本文件將指導您如何將 **SSO 客戶端** 整合到您的專案，並提供 **前端與後端的設定步驟**，確保應用程式能順利與 SSO 服務對接。

---

# 1. 使用建議

### 適用專案  
✅ **前後端皆有** (Full-stack)

### 整合方式  
📌 **請將所有必要檔案複製到您的專案後，再進行調整**

---



---

## 2.2 後端 (`confidential-backend`)

📂 **必要檔案**：  
- `confidential-backend/src/main/java/com/keycloak/test/controller/KeycloakController.java` (需修改)

📌 **修改內容**：請調整以下 3 個參數，確保它們符合您的 SSO 設定：  

```java
private String clientId = "test";  // 你的客戶端 ID
private String clientSecret = "d4krdfaNRp4tZwR1ZQ2bMRBfVkEx0Bks";  // 你的客戶端密鑰
private String realm = "MLIExternalRealm";  // 你的 SSO Realm 名稱
```
💡 **請與 SSO 負責人確認這些參數，確保與 SSO 伺服器的設定匹配。**
---



---

📢 **🎯 恭喜！當您完成上述步驟後，即已成功整合 SSO！**  
如需進一步的 SSO 調整或客製化，請聯繫您的 SSO 負責人或查閱 Keycloak 官方文件。 🚀
