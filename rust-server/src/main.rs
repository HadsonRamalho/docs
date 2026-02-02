use axum::{Router, routing::post};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

use crate::{http::verify_request, utils::auto_delete_files};

pub mod file;
pub mod http;
pub mod sec;
pub mod utils;

#[derive(Deserialize)]
pub struct CodeRequest {
    code: String,
}

#[derive(Serialize)]
pub struct CodeResponse {
    stdout: String,
    stderr: String,
}

#[tokio::main]
async fn main() {
    tokio::spawn(auto_delete_files());

    let app = Router::new()
        .route("/run", post(verify_request))
        .layer(CorsLayer::permissive());

    let addr = "127.0.0.1:3001";
    println!("API rodando em http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .unwrap();
}
