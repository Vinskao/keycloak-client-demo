import React, { useEffect, useState } from "react";
import Keycloak from "keycloak-js";

/**
 * App 組件 - React 與 Keycloak 整合
 *
 * 此組件負責：
 * - 從環境變數讀取並設定 Keycloak 的參數（clientId、realm、ssoUrl）
 * - 初始化 Keycloak 實例，並根據認證狀態更新介面
 * - 提供登入、登出與驗證功能
 *
 * 注意：環境變數必須以 REACT_APP_ 為前綴，並應在 .env 檔案中定義，
 * 如：REACT_APP_CLIENTID、REACT_APP_REALM、REACT_APP_SSO_URL。
 */
function App() {
  // 使用 state 儲存 Keycloak 實例以及認證狀態
  const [keycloak, setKeycloak] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 從環境變數讀取設定 (這些值在 .env 檔案中定義，且 CRA 會自動注入)
  const clientId = process.env.REACT_APP_CLIENTID;
  const realm = process.env.REACT_APP_REALM;
  const ssoUrl = process.env.REACT_APP_SSO_URL;

  /**
   * 初始化 Keycloak
   *
   * 此 useEffect 在組件首次渲染時執行，用以建立及初始化 Keycloak 實例，
   * 並將認證狀態與 Keycloak 實例儲存到 state 中。若發生錯誤，則在 console 中顯示。
   *
   * useEffect 的依賴陣列包含 clientId、realm 與 ssoUrl，確保設定變數改變時重新初始化。
   */
  useEffect(() => {
    // 建立新的 Keycloak 實例並傳入必要的配置參數
    const keycloakInstance = new Keycloak({
      url: ssoUrl,
      realm: realm,
      clientId: clientId,
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

  // 如果 keycloak 實例尚未初始化完成，暫時在 console 顯示提示
  if (keycloak === null) {
    console.log("正在初始化 Keycloak...");
  }

  /**
   * 渲染組件介面
   *
   * 根據 isAuthenticated 的狀態渲染不同的內容：
   * - 若已登入：顯示使用者資訊、登出與驗證按鈕。
   * - 未登入：顯示提示文字與登入按鈕。
   */
  return (
    <div style={{ padding: 20 }}>
      <h1>React App with Keycloak</h1>
      {isAuthenticated ? (
        <div>
          <p>用戶已登入</p>
          <p>用戶名稱: {keycloak.tokenParsed?.preferred_username || "未知"}</p>
          <p>郵箱: {keycloak.tokenParsed?.email || "未知"}</p>
          {/* 登出按鈕：呼叫 keycloak.logout() 執行登出 */}
          <button onClick={() => keycloak.logout()} style={{ marginRight: 10 }}>
            登出
          </button>
          {/* 驗證按鈕：透過匿名 async 函式驗證 token 內容，若成功則彈出訊息 */}
          <button
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
          >
            驗證
          </button>
        </div>
      ) : (
        <div>
          <p>使用者未登入</p>
          {/* 登入按鈕：呼叫 keycloak.login() 跳轉至 Keycloak 登入頁面 */}
          <button onClick={() => keycloak.login()}>登入</button>
        </div>
      )}
    </div>
  );
}

export default App;