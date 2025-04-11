# 0. 測試前置作業
對於需要整合 keycloak SSO 互動套件的專案才有系統需求，也就是public前端、Confidential後端，需求則取決於互動套件的版本，該版本應與 SSO Server 相符，請與SSO負責人確認版本，基本上從此 Demo 起皆建議使用 Keycloak 26.1.3 以上版本，此處將提供Spring Boot版本需求，其他後端語言及框架請參考相應的 Keycloak 26.1.3（或以上）版本
- Runtime需求：
    - Java 17
    - Maven 3.9.6
- 專案依賴版本：
    - Spring Boot 3
    - Spring Framework 6
    - `spring-boot-starter-oauth2-client`
    - `spring-boot-starter-oauth2-resource-server`
    - `spring-boot-starter-security`
    - `keycloak-spring-boot-starter:25.0.3`  
    > ⚠️ 注意：目前最新版為 25.0.3，雖然不等同 Keycloak Server 26.1.3，但仍可相容運行，僅因官方 starter 更新較慢。
- 專案啟動：
    ```bash
    mvn clean install  # 若有調整環境變數（application.properties），請重新執行安裝
    mvn spring-boot:run
    ```
# 1. 使用建議
- 適用專案：**想用後端驗證**，且需有 **maven** 管理的專案，或其他能下載Keycloak互動套件工具

- 整合方式： **以下所有操作適用不同框架，但本專案使用 React，其他框架請自行確認套件安裝方式**，**請將所有必要檔案複製到您的專案後，再進行調整**

# 2. 必要檔案與修改說明
## 2.1 所有建置所需檔案
**必要檔案**：  
- `pom.xml`：標記必要套件必裝
- `\src\main\resources\application.yml`：先把值都填好，按照需求訪談的結果填寫
- `KeycloakController.java` (需修改)
    1. `KeycloakController.java`裡面有3個打sso端點的function，已標記必要，且對應SSO了，url不要改
    2. 其他看需求可微調，例如每幾秒請求一次，可自己寫迴圈請求這三個必要function，因為每個網站需求不同，沒辦法寫客製化，請前端工程師自行判斷需要判斷登入/登出的時機，這個串接只會有3種行為(`登入`、`登出`、`驗證`)，前端打後端url，後端打SSO的url，SSO打後端url，url無誤就不可能有程式面導致的驗證失敗狀況，客製化請參考程式註解
- 假設後端工程師已將CORS等其他後端設定自行設定好，不贅述

# 3. 最終完成檢核點：3個端點/function是否實作完成
無論使用什麼後端，只要能裝`oauth2-client`、`oauth2-resource-server`、同等`keycloak-spring-boot-starter:25.0.3`，都可以實作完成這三個端點，任何能實作轉打、請求url的後端語言及框架都可以達成，以下url除了`authServerUrl`、`backendUrl`、`realm`是環境變數以外，其他都是Keycloak規範範疇。
1. **登入**：
    1.  封裝請求用token，tokenParams包含：
        - client_id：從環境變數取得
        - client_secret：從環境變數取得
        - code：從 Keycloak 傳回的授權碼
        - grant_type：固定為authorization_code
        - redirect_uri：`backendUrl + "/keycloak/redirect"`
    2.  使用授權碼(`authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token"`)向 Keycloak 取得存取憑證 (access token) 與更新憑證 (refresh token)
    3. 呼叫 userinfo 端點(`authServerUrl + "/realms/" + realm + "/protocol/openid-connect/userinfo"`)以獲取使用者資訊。
    4. 成功取得資料後，會將使用者名稱、電子郵件、access token 以及 refresh token 附加至前端 URL 並進行重導向。

2. **登出**：
    1. 將 refresh token 與 client 資訊作為參數傳遞至 Keycloak 登出端點(`authServerUrl + "/realms/" + realm + "/protocol/openid-connect/logout"`)
    2. 若成功則回傳登出成功訊息；若失敗則回傳錯誤訊息。
3. **驗證**：
    1. 先呼叫 Keycloak 的 introspection 端點(`authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token/introspect"`)檢查存取憑證 (access token) 的有效性
    2. 若 token 有效則直接回傳檢查結果；若 token 無效且同時提供了 refresh token，則會嘗試透過 refresh token 來刷新存取憑證
    4. 若刷新成功，則回傳新取得的 token 資訊並增加 "refreshed" 標記；若刷新失敗，則回傳未授權狀態。