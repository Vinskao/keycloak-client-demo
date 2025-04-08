document.addEventListener('DOMContentLoaded', function () {
    const CLIENTID = window.CONFIG.CLIENTID;
    const REALM = window.CONFIG.REALM;
    const BACKEND_URL = window.CONFIG.BACKEND_URL;
    const SSO_URL = window.CONFIG.SSO_URL;
    const redirectUri = BACKEND_URL + "/keycloak/redirect";

    // 讀取 URL 參數（同時取得 accessToken 與 refreshToken）
    const urlParams = new URLSearchParams(window.location.search);
    const usernameParam = urlParams.get('username');
    const emailParam = urlParams.get('email');
    const accessToken = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken'); // 確保後端 redirect 時也帶入此參數

    // 此判斷式可以被移動到其他適合的地方，另如router中的判斷式
    // 如果存在 accessToken，則透過 verifyToken 函式來驗證存取憑證是否仍有效。
    // 若驗證通過，則隱藏登入按鈕並顯示使用者資訊，將用戶名、電子郵件及狀態訊息更新成「使用者已登入」。
    // 如果驗證失敗，則更新狀態訊息並清除 URL 參數，要求使用者重新登入。
    if (accessToken) {
        verifyToken(accessToken).then(isValid => {
            if (isValid) {
                document.getElementById('loginButton').style.display = 'none';
                document.getElementById('userInfo').style.display = 'block';
                document.getElementById('username').textContent = `用戶名: ${usernameParam || '未知'}`;
                document.getElementById('email').textContent = `郵箱: ${emailParam || '未知'}`;
                document.getElementById('statusText').textContent = "使用者已登入";
            } else {
                document.getElementById('statusText').textContent = "登入會話已失效，請重新登入";
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });

        // (非必須) 每 10 秒呼叫一次 verifyToken 來檢查登入狀態
        setInterval(function () {
            verifyToken(accessToken).then(isValid => {
                if (!isValid) {
                    document.getElementById('statusText').textContent = "登入會話已失效，請重新登入";
                    document.getElementById('userInfo').style.display = 'none';
                    document.getElementById('loginButton').style.display = 'inline-block';
                    // 清除 URL 中的 token 參數（避免再次自動讀取到已失效的 token）
                    window.history.replaceState({}, document.title, window.location.pathname);
                    // 提示使用者重新登入
                    alert("您的登入已過期，請重新登入！");
                }
            });
        }, 10000);
    }

    /**
     * 勿修改
     * 驗證存取憑證 (access token) 是否仍有效。
     * <p>
     * 此函式會呼叫後端 /keycloak/introspect API，
     * 並依照回傳狀態決定 token 是否有效。
     * </p>
     * @param {string} token - 存取憑證 (access token)
     * @returns {Promise<boolean>} - 回傳一個 Promise，內容為 token 是否有效 (true/false)
     */
    async function verifyToken(token) {
        try {
            const response = await fetch(`${BACKEND_URL}/keycloak/introspect?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    // login 請求，取得 accessToken，30秒後會過期，換成refreshToken，如果不希望按紐形式，可把內容抽換成別種function
    document.getElementById('loginButton').addEventListener('click', function () {
        // 勿修改
        const authorizationUrl = SSO_URL + `/realms/${REALM}/protocol/openid-connect/auth?response_type=code&scope=openid&client_id=${CLIENTID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authorizationUrl;
    });

    // logout 請求，使用 refreshToken，如果不希望按紐形式，可把內容抽換成別種function
    document.getElementById('logoutButton').addEventListener('click', async function () {
        // 勿修改
        try {
            const response = await fetch(`${BACKEND_URL}/keycloak/logout?refreshToken=${encodeURIComponent(refreshToken)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            if (response.ok) {
                alert('登出成功');
            } else {
                alert('登出失敗');
            }
        } catch (error) {
            console.error("Logout error:", error);
            alert('登出失敗');
        } finally {
            window.history.replaceState({}, document.title, window.location.pathname);
            document.getElementById('userInfo').style.display = 'none';
            document.getElementById('loginButton').style.display = 'inline-block';
            document.getElementById('statusText').textContent = "請點擊下方按鈕進行登入";
        }
    });
});
