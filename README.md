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

## 什麼是OAuth 2.0 及 OpenID Connect (OIDC)？

## 如何選擇適合的範例？
請根據您的開發需求選擇對應的資料夾：
- 前後端皆有 (Full-stack) → confidential 資料夾 (Confidential Client)
適用於需要後端協助處理授權碼交換的應用，例如 Server-Side Web Apps。
- 僅有前端 (Frontend-only) → public 資料夾 (Public Client)
適用於 純前端應用 (如 SPA 應用) 直接與 SSO 伺服器進行驗證。

## 下一步：開始建置環境！
請繼續閱讀 confidential/ public 資料夾內的README，依照步驟完成 SSO 串接！ 🚀