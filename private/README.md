## 使用建議
- 適用專案：前後端都有
- 將所有所需檔案複製到自己的專案後再調整

## 1.1 所有建置所需檔案 - 前端
1. `private-frontend\login.html`，需要修改，可支援任何前端框架/原生

## 1.2 所有建置所需檔案 - 後端
假設您已設定完成所有前後端CORS相關設定
1. `private-backend\src\main\java\com\keycloak\test\controller\KeycloakController.java`，需要修改

## 2.1 `private-frontend\login.html`修改
修改這三個參數：
- BACKEND_URL: "http://localhost:8080"
- realm: "MLIExternalRealm"
- clientId: "test"

與SSO負責人討論參數設定，設定好後，login.html可以合成入登入頁面

## 2.2 `KeycloakController.java`修改
修改這三個參數：
- `private String clientId = "test";`
- `private String clientSecret = "ILrhid1S5brjy21p9k6a0NU3DXsOTfEa";`
- `private String realm = "MLIExternalRealm";`

與SSO負責人討論參數設定，設定好後，KeycloakController.java即完成設定

## 3. 客製化：決定哪幾頁需要驗證登入才能訪問
需要登入的頁面，在進入前用Dom控制先進行"驗證是否已登入"，驗證邏輯在login.html的verifyToken方法，可直接移植

