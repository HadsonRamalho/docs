use axum::routing::{get, patch, post};
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};
use utoipa_axum::router::OpenApiRouter;

use crate::controllers::{
    oauth::{api_github_callback, api_github_login},
    user::{api_get_logged_user, api_login_user, api_register_user, api_update_user_data},
};

pub async fn user_routes() -> OpenApiRouter<Pool<AsyncPgConnection>> {
    let routes = OpenApiRouter::new()
        .route("/me", get(api_get_logged_user))
        .route("/register", post(api_register_user))
        .route("/login", post(api_login_user))
        .route("/update", patch(api_update_user_data))
        .route("/login/github", get(api_github_login))
        .route("/auth/callback/github", get(api_github_callback));

    routes
}
