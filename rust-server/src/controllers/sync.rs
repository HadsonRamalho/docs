use automerge::{AutoCommit, sync::State as SyncState};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, mpsc};
use uuid::Uuid;

pub struct ActiveNotebook {
    pub doc: AutoCommit,
    pub subscribers: HashMap<Uuid, mpsc::UnboundedSender<Vec<u8>>>,
    pub peer_states: HashMap<Uuid, SyncState>,
}

impl ActiveNotebook {
    pub fn new(loaded_data: Option<Vec<u8>>) -> Self {
        let doc = if let Some(data) = loaded_data {
            AutoCommit::load(&data).unwrap_or_else(|_| AutoCommit::new())
        } else {
            AutoCommit::new()
        };

        Self {
            doc,
            subscribers: HashMap::new(),
            peer_states: HashMap::new(),
        }
    }
}

pub struct PresenceRoom {
    pub subscribers: HashMap<Uuid, mpsc::UnboundedSender<String>>,
}

impl PresenceRoom {
    pub fn new() -> Self {
        Self {
            subscribers: HashMap::new(),
        }
    }
}

pub type SyncRegistry = Arc<dashmap::DashMap<Uuid, Arc<RwLock<ActiveNotebook>>>>;
pub type PresenceRegistry = Arc<RwLock<HashMap<Uuid, Arc<RwLock<PresenceRoom>>>>>;
