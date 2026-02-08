use axum::routing::post;
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};
use utoipa_axum::router::OpenApiRouter;

use crate::http::verify_request;

pub async fn run_rust_routes() -> OpenApiRouter<Pool<AsyncPgConnection>> {
    let routes = OpenApiRouter::new().route("/run", post(verify_request));

    routes
}
