package com.keycloak.test.controller;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/keycloak")
public class KeycloakController {

    private static final Logger log = LoggerFactory.getLogger(KeycloakController.class);

    @Autowired
    private RestTemplate restTemplate;
    
    // 前端 URL (登入後重導向的目標頁面)
    @Value("${frontend.url}")
    private String frontendUrl;
    // 後端 URL (本服務所在地址)
    @Value("${backend.url}")
    private String backendUrl;
    // Keycloak 認證服務 URL
    @Value("${sso.url}")
    private String authServerUrl;
    // Keycloak realm 設定
    @Value("${keycloak.realm}")
    private String realm;
    // Keycloak clientId 設定
    @Value("${keycloak.clientId}")
    private String clientId;
    // Keycloak client secret 設定
    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    /**
     * *必要*
     * 處理從 Keycloak 認證後重導向回來的請求。
     * <p>
     * 本方法使用授權碼向 Keycloak 取得存取憑證 (access token) 與更新憑證 (refresh token)，
     * 並呼叫 userinfo 端點以獲取使用者資訊。成功取得資料後，會將使用者名稱、電子郵件、
     * access token 以及 refresh token 附加至前端 URL 並進行重導向。
     * </p>
     *
     * @param code Keycloak 返回的授權碼。
     * @param response HttpServletResponse 用於進行重導向。
     * @throws IOException 當重導向失敗時會拋出此例外。
     */
    @GetMapping("/redirect")
    public void keycloakRedirect(@RequestParam("code") String code, HttpServletResponse response)
            throws IOException {
        // 組合重導向用的 URI，此 URI 與 token 請求同時使用
        String redirectUri = backendUrl + "/keycloak/redirect";
        // 組合 token 請求 URL：Keycloak Token Endpoint
        String tokenUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        try {
            log.info("Received authorization code: {}", code);

            // 建立存放 token 請求參數的 MultiValueMap
            MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
            // 加入 clientId
            tokenParams.add("client_id", clientId);
            // 加入 clientSecret
            tokenParams.add("client_secret", clientSecret);
            // 加入從 Keycloak 傳回的授權碼
            tokenParams.add("code", code);
            // 指定授權類型為 authorization_code
            tokenParams.add("grant_type", "authorization_code");
            // 加入 redirect URI，必須與授權請求時一致
            tokenParams.add("redirect_uri", redirectUri);

            // 建立 HTTP headers，並設定 Content-Type 為 x-www-form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");
            // 封裝 token 請求的 body 與 headers 到 HttpEntity 中
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(tokenParams, headers);

            // 發送 POST 請求給 Keycloak 的 token endpoint
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(tokenUrl, HttpMethod.POST, entity, Map.class);
            // 從回傳內容中取得 access token
            String accessToken = (String) tokenResponse.getBody().get("access_token");
            // 取得 refresh token
            String refreshToken = (String) tokenResponse.getBody().get("refresh_token");

            log.info("Access Token: {}", accessToken);
            log.info("Refresh Token: {}", refreshToken);

            // 若其中任一 token 為 null，表示取得失敗，則拋出異常
            if (accessToken == null || refreshToken == null) {
                throw new RuntimeException("Failed to obtain access token");
            }

            // 呼叫 Keycloak userinfo endpoint 取得使用者資訊
            String userInfoUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/userinfo";
            // 設定 HTTP headers，加上 bearer token 授權
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.set("Authorization", "Bearer " + accessToken);
            // 封裝 headers 至 HttpEntity（此處無需 body）
            HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

            // 發送 GET 請求取得使用者資訊
            ResponseEntity<Map> userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, userEntity, Map.class);
            Map<String, Object> userInfo = userResponse.getBody();

            log.info("User Info: {}", userInfo);

            // 從使用者資訊中取得使用者名稱
            String preferredUsername = (String) userInfo.get("preferred_username");
            if (preferredUsername == null) {
                // 若使用者名稱不存在，則拋出異常
                throw new RuntimeException("Failed to retrieve user info");
            }

            // 從使用者資訊中取得電子郵件
            String email = (String) userInfo.get("email");

            // 組合重導向 URL，將使用者資訊與 tokens 附加至 query string 中
            String redirectTarget = frontendUrl
                + "?username=" + preferredUsername
                + "&email=" + email
                + "&token=" + accessToken
                + "&refreshToken=" + refreshToken;
            // 執行 HTTP 重導向
            response.sendRedirect(redirectTarget);
        } catch (Exception e) {
            // 若有任何錯誤，記錄錯誤並回傳 500 錯誤碼
            log.error("Error processing OAuth redirect", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error processing OAuth redirect");
        }
    }

    /**
     * *必要*
     * 使用提供的 refresh token 呼叫 Keycloak 的登出 API，撤銷更新憑證。
     * <p>
     * 此方法將 refresh token 與 client 資訊作為參數傳遞至 Keycloak 登出端點，
     * 若成功則回傳登出成功訊息；若失敗則回傳錯誤訊息。
     * </p>
     *
     * @param refreshToken 用於登出的更新憑證。
     * @return ResponseEntity 包含登出操作結果的訊息與狀態碼。
     */
    @CrossOrigin
    @GetMapping("/logout")
    public ResponseEntity<?> logout(@RequestParam("refreshToken") String refreshToken) {
        // 組合 Keycloak 的登出 endpoint URL
        String logoutUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/logout";

        try {
            // 建立 HTTP headers，設定 Content-Type 為 x-www-form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");

            // 封裝登出所需參數（client_id, client_secret, refresh_token）到 MultiValueMap 中
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", refreshToken);

            // 封裝參數與 headers 到 HttpEntity 中
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            // 發送 POST 請求至 Keycloak 登出端點執行 token 撤銷
            restTemplate.exchange(logoutUrl, HttpMethod.POST, entity, String.class);

            // 若成功則回傳 200 OK 與訊息
            return ResponseEntity.ok("Logout successful");
        } catch (Exception e) {
            // 若發生錯誤，記錄錯誤訊息並回傳 500 錯誤碼與錯誤訊息
            log.error("Logout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Logout failed");
        }
    }

    /**
     * *必要*
     * 檢查指定的 access token 是否有效，並在必要時使用 refresh token 進行續期。
     * <p>
     * 此方法會先呼叫 Keycloak 的 introspection 端點檢查存取憑證 (access token) 的有效性，
     * 若 token 有效則直接回傳檢查結果；若 token 無效且同時提供了 refresh token，則會嘗試透過 refresh token 來刷新存取憑證，
     * 若刷新成功，則回傳新取得的 token 資訊並增加 "refreshed" 標記；若刷新失敗，則回傳未授權狀態。
     * </p>
     *
     * @param token 要檢查的存取憑證 (access token)。
     * @param refreshToken (可選) 用於刷新存取憑證的更新憑證 (refresh token)。
     * @return ResponseEntity 包含 token 檢查結果、刷新後的 token 資訊或錯誤訊息的回應。
     */
    @CrossOrigin
    @GetMapping("/introspect")
    public ResponseEntity<?> introspectToken(
            @RequestParam("token") String token,
            @RequestParam(value = "refreshToken", required = false) String refreshToken) {

        // 組合 introspection 請求 URL
        String introspectUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token/introspect";

        try {
            // 1. 呼叫 introspection 端點檢查存取憑證是否仍有效
            MultiValueMap<String, String> bodyParams = new LinkedMultiValueMap<>();
            bodyParams.add("client_id", clientId);
            bodyParams.add("client_secret", clientSecret);
            bodyParams.add("token", token);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/x-www-form-urlencoded");
            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(bodyParams, headers);

            // 發送 POST 請求檢查 token 有效性
            ResponseEntity<Map> introspectResponse = restTemplate.exchange(introspectUrl, HttpMethod.POST, entity,
                    Map.class);
            Map<String, Object> introspectionResult = introspectResponse.getBody();

            // 若 token 有效則直接回傳 introspection 結果
            if (introspectionResult != null && Boolean.TRUE.equals(introspectionResult.get("active"))) {
                return ResponseEntity.ok(introspectionResult);
            }
            // 2. 若 token 無效且有提供 refresh token，嘗試刷新 token
            else if (refreshToken != null && !refreshToken.isEmpty()) {
                log.info("Access token is invalid, attempting to refresh...");

                // 組合刷新 token 的 URL
                String tokenUrl = authServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";
                
                // 封裝刷新 token 的請求參數
                MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
                tokenParams.add("client_id", clientId);
                tokenParams.add("client_secret", clientSecret);
                tokenParams.add("refresh_token", refreshToken);
                tokenParams.add("grant_type", "refresh_token");

                HttpHeaders refreshHeaders = new HttpHeaders();
                refreshHeaders.set("Content-Type", "application/x-www-form-urlencoded");
                HttpEntity<MultiValueMap<String, String>> refreshEntity = new HttpEntity<>(tokenParams, refreshHeaders);

                try {
                    // 發送刷新 token 請求
                    ResponseEntity<Map> tokenResponse = restTemplate.exchange(tokenUrl, HttpMethod.POST, refreshEntity, Map.class);
                    
                    if (tokenResponse.getStatusCode().is2xxSuccessful()) {
                        // 刷新成功，取得新的 token 資訊，加入 refreshed 標記後回傳
                        Map<String, Object> tokenInfo = tokenResponse.getBody();
                        tokenInfo.put("refreshed", true);
                        return ResponseEntity.ok(tokenInfo);
                    }
                } catch (Exception e) {
                    log.error("Error refreshing token", e);
                    // 若刷新失敗，則繼續回傳未授權資訊
                }
            }
            
            // 若 token 無效且無法刷新，回傳 401 UNAUTHORIZED 與失敗訊息
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("active", false, "error", "Token is not active or invalid, and refresh failed.")
            );
        } catch (Exception e) {
            // 若發生錯誤，記錄錯誤並回傳 500 INTERNAL_SERVER_ERROR 與錯誤訊息
            log.error("Error during token introspection/refresh", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Error processing token.")
            );
        }
    }
}
