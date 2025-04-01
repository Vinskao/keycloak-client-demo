import React, { useEffect, useState } from "react";
import Keycloak from "keycloak-js";

function App() {
  const [keycloak, setKeycloak] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const keycloakInstance = new Keycloak({
      url: "http://localhost:8080",
      realm: "MLIExternalRealm",
      clientId: "test-public",
    });
    keycloakInstance
      .init({
        promiseType: "native",
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setKeycloak(keycloakInstance);
      })
      .catch((error) => console.error("Keycloak init failed:", error));
  }, []);

  if (keycloak === null) {
    return <div>正在初始化 Keycloak...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>React App with Keycloak</h1>
      {isAuthenticated ? (
        <div>
          <p>用戶已登入</p>
          <p>用戶名稱: {keycloak.tokenParsed?.preferred_username || "未知"}</p>
          <p>郵箱: {keycloak.tokenParsed?.email || "未知"}</p>
          <button onClick={() => keycloak.logout()} style={{ marginRight: 10 }}>
            登出
          </button>
          <button
            onClick={async () => {
              try {
                alert("Introspect 成功：" + JSON.stringify(keycloak.tokenParsed));
              } catch (error) {
                alert("Token 更新失敗：" + (error.toString ? error.toString() : JSON.stringify(error)));
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
          <button onClick={() => keycloak.login()}>登入</button>
        </div>
      )}
    </div>
  );
}

export default App;