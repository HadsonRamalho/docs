#[allow(dead_code, unused_imports, unused_import_braces)]
use axum::{
    extract::{
        Path, State as AxumState,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};
use bytes::Bytes;
use diesel_async::{AsyncPgConnection, pooled_connection::deadpool::Pool};
use futures::{SinkExt, stream::StreamExt};
use hyper::HeaderMap;
use std::sync::Arc;
use tokio::sync::{RwLock, mpsc};
use uuid::Uuid;

use automerge::sync::{Message as SyncMessage, State as SyncState, SyncDoc};

use crate::{
    controllers::{
        jwt::extract_claims_from_ws_headers,
        sync::{ActiveNotebook, SyncRegistry},
    },
    models::{
        notebook::{NotebookPermission, load_notebook_data, save_notebook_data},
        state::AppState,
    },
};

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    headers: HeaderMap,
    Path(notebook_id): Path<Uuid>,
    AxumState(state): AxumState<Arc<AppState>>,
) -> impl IntoResponse {
    let user_token = match extract_claims_from_ws_headers(&headers).await {
        Ok(t) => Some(t.1.id),
        Err(_) => None,
    };

    let pool = state.pool.clone();

    ws.on_upgrade(move |socket| {
        handle_socket(
            socket,
            notebook_id,
            user_token,
            state.sync_registry.clone(),
            pool,
        )
    })
}

async fn handle_socket(
    socket: WebSocket,
    notebook_id: Uuid,
    original_user_id: Option<Uuid>,
    registry: SyncRegistry,
    pool: Pool<AsyncPgConnection>,
) {
    let user_id = original_user_id.unwrap_or(Uuid::new_v4());
    let (mut sender, mut receiver) = socket.split();

    let permission =
        crate::models::notebook::check_permission(&pool, original_user_id, notebook_id)
            .await
            .unwrap_or(NotebookPermission::Viewer);

    let (tx, mut rx) = mpsc::unbounded_channel::<Vec<u8>>();

    let notebook = {
        if let Some(nb) = registry.get(&notebook_id) {
            nb.clone()
        } else {
            let mut conn = pool.get().await.unwrap();
            let saved_data = load_notebook_data(&mut conn, notebook_id).await;
            let new_notebook = Arc::new(RwLock::new(ActiveNotebook::new(saved_data)));
            registry.insert(notebook_id, new_notebook.clone());
            new_notebook
        }
    };

    {
        let mut nb = notebook.write().await;
        nb.subscribers.insert(user_id, tx.clone());
        let mut peer_state = SyncState::new();

        if let Some(msg) = nb.doc.sync().generate_sync_message(&mut peer_state) {
            let _ = tx.send(msg.encode());
        }
        nb.peer_states.insert(user_id, peer_state);
    }

    let mut send_task = tokio::spawn(async move {
        while let Some(packet) = rx.recv().await {
            if sender.send(Message::Binary(packet.into())).await.is_err() {
                break;
            }
        }
    });

    let notebook_recv = notebook.clone();
    let permission_cloned = permission.clone();

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Binary(data))) = receiver.next().await {
            process_msg(user_id, data, &notebook_recv, permission_cloned.clone()).await;
        }
    });

    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };

    let (should_remove, data_to_save) = {
        let mut nb = notebook.write().await;
        nb.subscribers.remove(&user_id);
        nb.peer_states.remove(&user_id);

        let empty = nb.subscribers.is_empty();
        (empty, nb.doc.save())
    };

    if should_remove {
        let pool_clone = pool.clone();
        tokio::spawn(async move {
            if let Ok(mut conn) = pool_clone.get().await {
                save_notebook_data(&mut conn, user_id, notebook_id, data_to_save).await;
            }
        });
        registry.remove(&notebook_id);
    }
}
async fn process_msg(
    sender_session_id: Uuid,
    data: Bytes,
    notebook: &Arc<RwLock<ActiveNotebook>>,
    permission: NotebookPermission,
) {
    let mut nb_guard = notebook.write().await;

    let ActiveNotebook {
        doc,
        peer_states,
        subscribers,
        ..
    } = &mut *nb_guard;

    if let Ok(msg) = SyncMessage::decode(&data) {
        if let Some(peer_state) = peer_states.get_mut(&sender_session_id) {
            match permission {
                NotebookPermission::OwnerOrTeam => {
                    if let Err(e) = doc.sync().receive_sync_message(peer_state, msg) {
                        tracing::error!("Erro sync owner: {:?}", e);
                    }
                }
                NotebookPermission::Viewer => {
                    let mut doc_clone = doc.fork();
                    if let Err(e) = doc_clone.sync().receive_sync_message(peer_state, msg) {
                        tracing::error!("Erro sync viewer: {:?}", e);
                    }
                }
            }
        }
    }

    for (peer_id, peer_state) in peer_states.iter_mut() {
        if let Some(msg) = doc.sync().generate_sync_message(peer_state) {
            let bytes = msg.encode();
            if let Some(tx) = subscribers.get(peer_id) {
                let _ = tx.send(bytes);
            }
        }
    }
}
