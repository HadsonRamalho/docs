use axum::{Json, extract::State};
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};
use hyper::{HeaderMap, StatusCode};
use pwhash::bcrypt::verify;
use validator::Validate;

use crate::{
    controllers::{
        jwt::{extract_claims_from_header, generate_jwt},
        utils::{Sanitize, get_conn, password_hash},
    },
    models::{
        self,
        error::ApiError,
        user::{AuthProvider, LoginUser, NewUser, UpdateUser, User, UserAuthInfo},
    },
};

#[utoipa::path(post, path = "/user/register", responses((status = CREATED, body = String), (status = 401, body = ApiError)))]
pub async fn api_register_user(
    State(pool): State<Pool<AsyncPgConnection>>,
    input: Json<NewUser>,
) -> Result<(StatusCode, Json<String>), ApiError> {
    let mut user_input = input.0;
    user_input.sanitize();

    if let Err(errors) = user_input.validate() {
        return Err(ApiError::Request(errors.to_string()));
    }

    if user_input.password_hash.is_some() && user_input.primary_provider == AuthProvider::Email {
        user_input.password_hash = Some(password_hash(&user_input.password_hash.unwrap()));
    }

    let conn = &mut get_conn(&pool)
        .await
        .map_err(|e| ApiError::DatabaseConnection(e.1.0.to_string()))?;

    let user = match models::user::register_user(conn, &user_input).await {
        Ok(user) => user,
        Err(e) => return Err(ApiError::Database(e)),
    };

    let token = generate_jwt(UserAuthInfo::from(user))?;
    Ok((StatusCode::CREATED, Json(token)))
}

#[utoipa::path(post, path = "/user/login", responses((status = OK, body = String), (status = 401, body = ApiError)))]
pub async fn api_login_user(
    State(pool): State<Pool<AsyncPgConnection>>,
    Json(input): Json<LoginUser>,
) -> Result<Json<String>, ApiError> {
    let mut user_input = input;
    user_input.sanitize();

    if let Err(errors) = user_input.validate() {
        return Err(ApiError::Request(errors.to_string()));
    }

    let conn = &mut get_conn(&pool)
        .await
        .map_err(|e| ApiError::DatabaseConnection(e.1.0.to_string()))?;

    let user = models::user::find_user_by_email(conn, &user_input.email)
        .await
        .map_err(|_| ApiError::InvalidCredentials)?;

    if !user.is_active || user.deleted_at.is_some() {
        return Err(ApiError::NotActiveUser);
    }

    if user.primary_provider != AuthProvider::Email {
        return Err(ApiError::WrongProvider(format!(
            "{:?}",
            user.primary_provider
        )));
    }

    let password_valid = match &user.password_hash {
        Some(hash) => verify(&user_input.password, hash),
        None => false,
    };

    if !password_valid {
        return Err(ApiError::InvalidCredentials);
    }

    let token = generate_jwt(UserAuthInfo::from(user))?;

    Ok(Json(token))
}

pub async fn api_update_user_data(
    State(pool): State<Pool<AsyncPgConnection>>,
    headers: HeaderMap,
    input: Json<UpdateUser>,
) -> Result<StatusCode, ApiError> {
    let mut user_input = input.0;
    user_input.sanitize();

    if let Err(errors) = user_input.validate() {
        return Err(ApiError::Request(errors.to_string()));
    }

    let id = extract_claims_from_header(&headers).await?.1.id;

    let conn = &mut get_conn(&pool)
        .await
        .map_err(|e| ApiError::DatabaseConnection(e.1.0.to_string()))?;

    match models::user::find_user_by_id(conn, &id).await {
        Err(_) => {
            return Err(ApiError::UserNotFound);
        }
        _ => {}
    };

    match models::user::update_user_data(conn, &id, &user_input).await {
        Ok(_) => Ok(StatusCode::OK),
        Err(e) => Err(e),
    }
}

pub async fn api_get_logged_user(
    State(pool): State<Pool<AsyncPgConnection>>,
    headers: HeaderMap,
) -> Result<Json<User>, ApiError> {
    let id = extract_claims_from_header(&headers).await?.1.id;

    let conn = &mut get_conn(&pool)
        .await
        .map_err(|e| ApiError::DatabaseConnection(e.1.0.to_string()))?;

    let user = models::user::find_user_by_id(conn, &id)
        .await
        .map_err(|_| ApiError::UserNotFound)?;

    Ok(Json(user))
}

pub async fn api_delete_user(
    State(pool): State<Pool<AsyncPgConnection>>,
    headers: HeaderMap,
) -> Result<StatusCode, ApiError> {
    let id = extract_claims_from_header(&headers).await?.1.id;

    let conn = &mut get_conn(&pool)
        .await
        .map_err(|e| ApiError::DatabaseConnection(e.1.0.to_string()))?;

    let _ = models::user::delete_user(conn, &id).await?;

    Ok(StatusCode::OK)
}
