use crate::{
    controllers::{
        jwt::generate_jwt,
        user::api_register_user,
        utils::{get_conn, get_var_from_env},
    },
    models::{
        self,
        error::ApiError,
        oauth::{AuthRequest, GithubEmail, GithubUser},
        user::{AuthProvider, NewUser, UserAuthInfo},
    },
};
use axum::{
    Json,
    extract::{Query, State},
    response::{IntoResponse, Redirect},
};
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
    TokenResponse, TokenUrl, basic::BasicClient,
};
use reqwest::Client as ReqwestClient;
use tracing::error;

macro_rules! oauth_client {
    () => {{
        let client_id = get_var_from_env("GITHUB_CLIENT_ID").unwrap();
        let client_secret = get_var_from_env("GITHUB_CLIENT_SECRET").unwrap();
        let api_redirect_url = format!(
            "{}/api/user/auth/callback/github",
            get_var_from_env("API_URL").unwrap()
        );

        let auth_url = AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
            .expect("URL Auth Inválida");
        let token_url = TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
            .expect("URL Token Inválida");
        let redirect_url = RedirectUrl::new(api_redirect_url).expect("URL Redirect Inválida");

        BasicClient::new(ClientId::new(client_id))
            .set_client_secret(ClientSecret::new(client_secret))
            .set_auth_uri(auth_url)
            .set_token_uri(token_url)
            .set_redirect_uri(redirect_url)
    }};
}

pub async fn api_github_login() -> Redirect {
    let client = oauth_client!();

    let (auth_url, _csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("read:user".to_string()))
        .add_scope(Scope::new("user:email".to_string()))
        .url();

    Redirect::to(auth_url.as_str())
}
pub async fn api_github_callback(
    State(pool): State<Pool<AsyncPgConnection>>,
    Query(params): Query<AuthRequest>,
) -> impl IntoResponse {
    let base_redirect_url = get_var_from_env("FRONTEND_URL").unwrap();

    let client = oauth_client!();

    let token_result = client
        .exchange_code(AuthorizationCode::new(params.code))
        .request_async(&oauth2::reqwest::Client::new())
        .await;

    let token = match token_result {
        Ok(t) => t,
        Err(e) => {
            let e = format!("Erro ao validar o token: {}", e.to_string());
            error!(e);
            return Redirect::to(&format!(
                "{}/login?auth_error=token_failed",
                base_redirect_url,
            ))
            .into_response();
        }
    };

    let http_client = ReqwestClient::new();
    let response = http_client
        .get("https://api.github.com/user")
        .header("User-Agent", "rust-notebook-app")
        .header(
            "Authorization",
            format!("Bearer {}", token.access_token().secret()),
        )
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|_| {
            Redirect::to(&format!(
                "{}/login?auth_error=github_response_failed",
                base_redirect_url,
            ))
            .into_response()
        })
        .unwrap();

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();

        error!("Erro na API do GitHub: Status: {} | Body: {}", status, text);

        return Redirect::to(&format!(
            "{}/login?auth_error=github_response_error",
            base_redirect_url,
        ))
        .into_response();
    }

    let user_data = match response.json::<GithubUser>().await {
        Ok(user) => user,
        Err(e) => {
            error!("Erro ao decodificar JSON: {:?}", e);
            return Redirect::to(&format!(
                "{}/login?auth_error=github_data_error",
                base_redirect_url,
            ))
            .into_response();
        }
    };

    let mut conn = &mut get_conn(&pool)
        .await
        .map_err(|e| ApiError::DatabaseConnection(e.1.0.to_string()))
        .unwrap();

    let email = match user_data.email {
        Some(e) => e,
        None => {
            let emails: Vec<GithubEmail> = http_client
                .get("https://api.github.com/user/emails")
                .header("User-Agent", "rust-notebook-app")
                .bearer_auth(token.access_token().secret())
                .send()
                .await
                .unwrap()
                .json()
                .await
                .map_err(|_| {
                    Redirect::to(&format!(
                        "{}/login?auth_error=github_emails_not_found",
                        base_redirect_url,
                    ))
                    .into_response()
                })
                .unwrap();

            emails
                .into_iter()
                .find(|e| e.primary && e.verified)
                .map(|e| e.email)
                .unwrap()
        }
    };

    let user_exists = match models::user::find_user_by_email(&mut conn, &email).await {
        Ok(u) => Some(u),
        Err(_) => None,
    };

    if let Some(user) = user_exists {
        if user.primary_provider != AuthProvider::Github {
            return Redirect::to(&format!(
                "{}/login?auth_error=wrong_login_method",
                base_redirect_url
            ))
            .into_response();
        }
        let token = generate_jwt(UserAuthInfo::from(user)).unwrap();
        return Redirect::to(&format!(
            "{}/auth-callback?token={}",
            base_redirect_url, token
        ))
        .into_response();
    }

    let _ = api_register_user(
        State(pool),
        Json(NewUser {
            name: user_data.login,
            email: email.clone(),
            password_hash: None,
            primary_provider: models::user::AuthProvider::Github,
            github_id: Some(user_data.id.to_string()),
            google_id: None,
            avatar_url: Some(user_data.avatar_url),
        }),
    )
    .await;

    let user_exists = match models::user::find_user_by_email(&mut conn, &email).await {
        Ok(u) => Some(u),
        Err(_) => None,
    };

    let base_redirect_url = get_var_from_env("FRONTEND_URL").unwrap();
    if let Some(user) = user_exists {
        let token = generate_jwt(UserAuthInfo::from(user)).unwrap();
        return Redirect::to(&format!(
            "{}/auth-callback?token={}",
            base_redirect_url, token
        ))
        .into_response();
    }
    Redirect::to(&base_redirect_url).into_response()
}
