# 0. 測試前置作業
只要能安裝 [keycloak-js](https://www.npmjs.com/package/keycloak-js) 的前端，都能適用，**以下所有操作適用不同框架，但本專案使用 React，其他框架請自行確認套件安裝方式**，**請將所有必要檔案複製到您的專案後，再進行調整**
- 適用專案：**只有前端**，且需有 **npm** 管理的專案
- Runtime需求(是React 18需求，不代表你的專案一定如此)：
    - Node.js v14
    - NPM：建議使用 NPM 6.14.15（對應 Node.js v14）
- 本專案需求(不代表一定要用React)：
    - React 18.3.1
- 本專案啟動：
    ```bash
    npm install # 環境變數有改要再執行一次
    npm run start
    ```
    
# 1. 必要檔案與修改說明
## 1.1 所有建置所需檔案
**必要檔案**：  
- `.env`：先把值都填好，按照需求訪談的結果填寫
- `src/App.js` (需修改)
    1. `App.js`有1個建立Keycloak實例，成功建立才能繼續
        ```js
        useEffect(() => {
            // 建立新的 Keycloak 實例並傳入必要的配置參數
            const keycloakInstance = new Keycloak({
                url: ssoUrl, // 環境變數
                realm: realm, // 環境變數
                clientId: clientId, // 環境變數
            });
            // 初始化 Keycloak 實例，promiseType 設為 native 可使回傳結果為原生的 Promise
            keycloakInstance
            .init({
                promiseType: "native",
            })
            .then((authenticated) => {
                // 更新認證狀態與 Keycloak 實例
                setIsAuthenticated(authenticated);
                setKeycloak(keycloakInstance);
            })
            .catch((error) => console.error("Keycloak init failed:", error));
        }, [clientId, realm, ssoUrl]);
        ```
    2. `App.js`裡面有3個使用Keycloak實例打sso端點的function，已標記必要，且對應SSO了，function 不要改，目前是使用按鈕的形式，自行換其他觸發形式。
    3. 其他看需求可微調，例如每幾秒請求一次，可自己寫迴圈請求這三個必要function，因為每個網站需求不同，沒辦法寫客製化，請前端工程師自行判斷需要判斷登入/登出的時機，這個串接只會有3種行為(`登入`、`登出`、`驗證`)，使用function無誤就不可能有程式面導致的驗證失敗狀況，客製化請參考程式註解
    3. HTML 僅用於展示 DEMO 畫面
- `index.html` (只是顯示DEMO畫面用)
# 2. 使用判斷式達到全頁面控制權限

**2.1 決定哪些頁面需要登入驗證**  

**若某些頁面需登入後才能訪問**，對該頁面卡關設計，將*判斷式*設為filter，或者在路由守衛放置這個邏輯(除了 onClick 之外的操作，可根據需求自行客製化)。

**應用示例**：  
```js
onClick={async () => {
    try {
    alert("Introspect 成功：" + JSON.stringify(keycloak.tokenParsed));
    } catch (error) {
    alert(
        "Token 更新失敗：" +
        (error.toString ? error.toString() : JSON.stringify(error))
    );
    console.error("Token update failed:", error);
    }
}}
```
為什麼不檢查Session Cookie(Keycloak SSO存放token的地方)就好？前端 JavaScript 無法訪問 session cookie，因為設定了 HttpOnly 屬性 ，讓 JS 不能存取該 cookie。

DevTools > Application > Cookies
```
Name:        JSESSIONID
Value:       abcdef123456
HttpOnly:    ✅
Secure:      ✅
``````
```js
console.log(document.cookie); // 印不出來這個 cookie
```


# 3. 最終完成檢核點：4個function是否實作完成
無論使用什麼前端，只要能裝keycloak-js套件，都可以實作完成這4個function，達成前端串接
1. **創建Keycloak實例**： 在組件首次渲染時執行，用以建立及初始化 Keycloak 實例，並將認證狀態與 Keycloak 實例儲存到 state 中。若發生錯誤，則在 console 中顯示。依賴陣列包含 clientId、realm 與 ssoUrl，確保設定變數改變時重新初始化。
2. **登入**：呼叫 `keycloak.login()` 跳轉至 Keycloak 登入頁面 
3. **登出**：呼叫 `keycloak.logout()` 執行登出
4. **驗證**：透過`JSON.stringify(keycloak.tokenParsed)`驗證 token 內容，若成功則彈出訊息