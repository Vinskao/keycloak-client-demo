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

    // *非必要* 
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

        // *非必要* 每 10 秒呼叫一次 verifyToken 來檢查登入狀態
        setInterval(function () {
            verifyToken(accessToken).then(result => {
                if (!result.valid) {
                    // refreshToken也過期了，才提示用戶重新登入
                    document.getElementById('statusText').textContent = "登入會話已失效，請重新登入";
                    document.getElementById('userInfo').style.display = 'none';
                    document.getElementById('loginButton').style.display = 'inline-block';
                    window.history.replaceState({}, document.title, window.location.pathname);
                    console.log("您的登入已過期，請重新登入！");
                } else if (result.tokenRefreshed) {
                    // 若後端有成功用 refresh token 換到新 access token，這裡可以選擇更新變數
                    accessToken = result.accessToken;
                    refreshToken = result.refreshToken; // 若後端也有刷新 refresh token
                }
            });
        }, 10000);
    }

    /**
     * *必要* 
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
            const formData = new FormData();
            formData.append('token', token);
            formData.append('refreshToken', refreshToken); // 傳給後端自行判斷要不要續期

            const response = await fetch(`${BACKEND_URL}/keycloak/introspect`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                mode: 'cors'
            });

            if (response.ok) {
                const result = await response.json();

                // 如果是新的 token，就更新前端儲存的 token
                if (result.access_token) {
                    return {
                        valid: true,
                        tokenRefreshed: true,
                        accessToken: result.access_token,
                        refreshToken: result.refresh_token
                    };
                }

                return {
                    valid: result.active === true,
                    tokenRefreshed: false
                };
            } else {
                return { valid: false };
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return { valid: false };
        }
    }

    // *必要* 
    // login 請求，取得 accessToken，30秒後會過期，換成refreshToken，如果不希望按紐形式，可把內容抽換成別種function
    document.getElementById('loginButton').addEventListener('click', function () {
        // 勿修改
        const authorizationUrl = SSO_URL + `/realms/${REALM}/protocol/openid-connect/auth?response_type=code&scope=openid&client_id=${CLIENTID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authorizationUrl;
    });

    // *必要* 
    // logout 請求，使用 refreshToken，如果不希望按紐形式，可把內容抽換成別種function
    document.getElementById('logoutButton').addEventListener('click', async function () {
        try {
            // 建立表單資料
            const formData = new FormData();
            formData.append('refreshToken', refreshToken);

            // 發送 POST 請求到後端進行登出處理
            const response = await fetch(`${BACKEND_URL}/keycloak/logout`, {
                method: 'POST',  // 改為 POST 方法
                body: formData,  // 使用表單資料傳送 refreshToken
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
            // 清除 URL 參數、隱藏使用者資訊、顯示登入按鈕
            window.history.replaceState({}, document.title, window.location.pathname);
            document.getElementById('userInfo').style.display = 'none';
            document.getElementById('loginButton').style.display = 'inline-block';
            document.getElementById('statusText').textContent = "請點擊下方按鈕進行登入";
        }
    });
});
