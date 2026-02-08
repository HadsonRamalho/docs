use axum::{
    Json,
    response::{IntoResponse, Response},
};
use hyper::StatusCode;
use serde::Serialize;
use serde_json::json;
use thiserror::Error;
use utoipa::ToSchema;

#[derive(Error, Debug, Serialize, ToSchema)]
pub enum ApiError {
    #[error("Error processing your request: {0}")]
    Request(String),

    #[error("Error while trying to connect to the database: {0}")]
    DatabaseConnection(String),

    #[error("Invalid authorization token")]
    InvalidAuthorizationToken,

    #[error("Multiple errors while validating the authorization token: {0:?}")]
    MultipleAuthorizationErrors(Vec<String>),

    #[error("A database error occurred: {0}")]
    Database(String),

    #[error("Failed to create token: {0}")]
    CreateToken(String),

    #[error("Missing fields in the request")]
    InvalidData,

    #[error("Invalid email provided")]
    InvalidEmail,

    #[error("Invalid email or password")]
    InvalidCredentials,

    #[error("Please log in with {0}")]
    WrongProvider(String),

    #[error("User is not active")]
    NotActiveUser,

    #[error("Invalid password")]
    InvalidPassword,

    #[error("Missing frontend URL")]
    FrontendUrl,

    #[error("User not found")]
    UserNotFound,

    #[error("Missing frontend URL")]
    MissingFrontendUrl,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::Database(_) | ApiError::DatabaseConnection(_) | ApiError::CreateToken(_) => {
                (StatusCode::INTERNAL_SERVER_ERROR, self.to_string())
            }

            ApiError::Request(_) | ApiError::InvalidData | ApiError::MissingFrontendUrl => {
                (StatusCode::BAD_REQUEST, self.to_string())
            }

            ApiError::InvalidAuthorizationToken
            | ApiError::InvalidPassword
            | ApiError::InvalidCredentials => (StatusCode::UNAUTHORIZED, self.to_string()),

            ApiError::NotActiveUser => (
                StatusCode::FORBIDDEN,
                "User account is inactive".to_string(),
            ),
            ApiError::WrongProvider(p) => {
                (StatusCode::BAD_REQUEST, format!("Please log in with {}", p))
            }

            ApiError::UserNotFound => (StatusCode::NOT_FOUND, self.to_string()),

            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Unknown error".to_string(),
            ),
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}
