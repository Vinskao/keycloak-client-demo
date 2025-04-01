## 使用建議
- 適用專案：只有前端、有react/angualr/vue框架
- 以下所有操作都適用react/angualr/vue框架，但本專案是react，angualr/vue需自行確認套件安裝方式
- 將所有所需檔案複製到自己的專案後再調整

## 1. 所有建置所需檔案
1. `src\App.js`，需要修改
2. `npm install keycloak-js`，完全不要修改，此套件適用react/angualr/vue
3. `src\keycloak.js`，完全不要修改，從`public\node_modules\keycloak-js\lib\keycloak.js`複製過來

## 2. `src\App.js`修改
修改這三個參數：
- url: "http://localhost:8080"
- realm: "MLIExternalRealm"
- clientId: "test-public"
與SSO負責人討論參數設定，設定好後，App.js可以合成入登入頁面

## 3. 客製化：決定哪幾頁需要驗證登入才能訪問
需要登入的頁面，在進入前用Dom控制先進行"驗證是否已登入"，驗證邏輯在App.js的驗證按紐，可直接移植