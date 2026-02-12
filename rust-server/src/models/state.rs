use crate::controllers::sync::SyncRegistry;
use axum::extract::FromRef;
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};

pub struct AppState {
    pub pool: Pool<AsyncPgConnection>,
    pub sync_registry: SyncRegistry,
}

impl FromRef<AppState> for Pool<AsyncPgConnection> {
    fn from_ref(state: &AppState) -> Self {
        state.pool.clone()
    }
}
