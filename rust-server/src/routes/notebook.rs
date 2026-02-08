use axum::routing::{delete, get, patch, post, put};
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};
use utoipa_axum::router::OpenApiRouter;

use crate::controllers::notebook::{
    api_create_notebook, api_delete_notebook, api_get_notebooks, api_get_single_notebook,
    api_get_single_notebook_with_blocks, api_rename_notebook, api_save_notebook_content,
};

pub async fn notebook_routes() -> OpenApiRouter<Pool<AsyncPgConnection>> {
    let routes = OpenApiRouter::new()
        .route("/create", post(api_create_notebook))
        .route("/{id}/title", patch(api_rename_notebook))
        .route("/{id}", delete(api_delete_notebook))
        .route("/{id}", get(api_get_single_notebook))
        .route("/{id}/full", get(api_get_single_notebook_with_blocks))
        .route("/{id}/content", put(api_save_notebook_content))
        .route("/all", get(api_get_notebooks));

    routes
}
