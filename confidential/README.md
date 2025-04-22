## 1. 使用建議

> 相關方法與 API 說明都置於程式碼註解中。

### 認證流程圖
```mermaid
sequenceDiagram
    participant User as 使用者
    participant Frontend as 前端應用
    participant Backend as 後端服務
    participant SSO as Keycloak SSO
    
    User->>Frontend: 1. 訪問應用
    Frontend->>Backend: 2. 請求登入
    Backend->>SSO: 3. 重定向到SSO登入頁
    User->>SSO: 4. 輸入帳密
    SSO->>Backend: 5. 返回授權碼
    Backend->>SSO: 6. 用授權碼換取Token
    SSO->>Backend: 7. 返回Access Token
    Backend->>Frontend: 8. 返回用戶資訊
    Frontend->>User: 9. 顯示登入成功
    
    Note over Frontend,Backend: Token驗證流程
    Frontend->>Backend: 10. API請求(帶Token)
    Backend->>SSO: 11. 驗證Token
    SSO->>Backend: 12. Token有效
    Backend->>Frontend: 13. 返回受保護資源
```

### 適用專案  
- 準備好前後端專案。(Full-stack)

## 2. 開始
1. 依照 [confidential-backend](./confidential-backend/README.md) 指示，啟動專案以查看 DEMO 成果，或參考程式完成自己的**後端串接**

2. 依照 [confidential-frontend](./confidential-frontend/README.md) 指示，啟動專案以查看 DEMO 成果，或參考程式完成自己的**前端串接**
