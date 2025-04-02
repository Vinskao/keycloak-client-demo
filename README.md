## 簡介
本專案提供 SSO 客戶端 (SSO Client) 串接示範，幫助開發者快速了解如何將應用程式與 單一登入 (Single Sign-On, SSO) 系統整合。透過本範例，您將學習如何在前端或前後端環境下，使用標準 OAuth 2.0 或 OpenID Connect (OIDC) 流程完成身份驗證與授權。

## 這個專案能做什麼？
模擬 SSO 串接流程：提供 Confidential Client (需要後端) 與 Public Client (僅前端) 兩種應用場景。
示範 OAuth 2.0 / OIDC 認證流程：包括 登入 (Login)、登出 (Logout) 以及 Token 交換 等操作。
協助開發者快速整合 SSO：透過可運行的 Demo，讓開發者能夠輕鬆上手。

## 適用對象
- 前端開發者：需要在瀏覽器端與 SSO 服務進行互動的應用程式開發者。
- 後端開發者：負責處理安全授權邏輯、管理 Token 交換的開發者。
- 完整應用開發者：同時開發前後端應用的開發者，需完整掌握 SSO 串接流程。

## 如何選擇適合的範例？
請根據您的開發需求選擇對應的資料夾：
- 前後端皆有 (Full-stack) → confidential 資料夾 (Confidential Client)
適用於需要後端協助處理授權碼交換的應用，例如 Server-Side Web Apps。
- 僅有前端 (Frontend-only) → public 資料夾 (Public Client)
適用於 純前端應用 (如 SPA 應用) 直接與 SSO 伺服器進行驗證。

## 下一步：開始建置環境！
請繼續閱讀 confidential/ public 資料夾內的README，依照步驟完成 SSO 串接！ 🚀

## 延伸：什麼是OAuth 2.0 及 OpenID Connect (OIDC)？
OAuth 2.0 和 OpenID Connect (OIDC) 是現代網路應用程式中 身份驗證 (Authentication) 與 授權 (Authorization) 的標準協議

* OAuth 2.0 負責授權 (讓應用程式能安全地存取 API)。
* OIDC 負責身份驗證 (確認使用者的身份，並提供基本資料)。

### OAuth 2.0：授權標準
OAuth 2.0 是一種開放標準的 授權 (Authorization) 協議，允許應用程式在 不直接存取使用者帳號密碼 的情況下，透過 存取權杖 (Access Token) 來存取受保護的 API 或資源。OAuth 2.0 只負責授權 (Authorization)，但它 不包含使用者身份驗證 (Authentication)，這就是 OIDC 存在的意義。

### OAuth 2.0 流程：
1. 使用者透過應用程式進行 登入授權，授權應用程式存取他們的資源。
2. 授權伺服器發送一個 Access Token 給應用程式。
3. 應用程式使用這個 Access Token 存取資源伺服器上的受保護資源。

### OpenID Connect (OIDC)：身份驗證標準
OpenID Connect (OIDC) 是建立在 OAuth 2.0 之上的 身份驗證 (Authentication) 協議，用來確認使用者的身份，並提供其基本資料 (如名稱、Email)。

🔹 OIDC 主要增加的功能：
- ID Token：一種特殊的 JWT (JSON Web Token)，包含使用者的身份資訊
- UserInfo 端點：允許應用程式獲取使用者的額外資訊。

🔹 OIDC 典型流程：

1. 使用者登入，OIDC 驗證身份並發送 ID Token 和 Access Token。
2. 應用程式解讀 ID Token，確認使用者身份。
3. 若需要存取 API，則使用 Access Token (與 OAuth 2.0 流程相同)。