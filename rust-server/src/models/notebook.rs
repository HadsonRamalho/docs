use crate::{models::error::ApiError, schema::blocks::dsl as blocks_dsl};
use chrono::{DateTime, Utc};
use diesel::{
    BelongingToDsl, BoolExpressionMethods, ExpressionMethods, JoinOnDsl, PgTextExpressionMethods,
    QueryDsl, Selectable,
    prelude::{Associations, Identifiable, Insertable, Queryable},
};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};
use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use crate::schema::{blocks, notebooks};

#[derive(Debug, Clone, Copy, PartialEq, Eq, DbEnum, Serialize, Deserialize)]
#[ExistingTypePath = "crate::schema::sql_types::BlockTypeEnum"]
#[serde(rename_all = "lowercase")]
pub enum BlockType {
    Text,
    Code,
    Component,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, DbEnum, Serialize, Deserialize)]
#[ExistingTypePath = "crate::schema::sql_types::LanguageEnum"]
#[serde(rename_all = "lowercase")]
pub enum Language {
    Rust,
    Typescript,
    Python,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum BlockMetadata {
    Callout {
        props: CalloutProps,
    },
    Card {
        props: CardProps,
    },
    GithubRepo {
        props: GithubRepoProps,
    },
    Banner {
        variant: String,
    },
    Generic {
        #[serde(flatten)]
        props: serde_json::Value,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalloutProps {
    pub title: Option<String>,
    pub icon: Option<String>,
    #[serde(rename = "type")]
    pub callout_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardProps {
    pub title: String,
    pub description: Option<String>,
    pub href: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GithubRepoProps {
    pub owner: String,
    pub repo: String,
}

#[derive(Queryable, Selectable, Identifiable, Serialize, Debug)]
#[diesel(table_name = crate::schema::notebooks)]
pub struct Notebook {
    pub id: Uuid,
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    pub title: String,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
    pub document_data: Option<Vec<u8>>,
}

#[derive(Queryable, Selectable, Identifiable, Associations, Serialize, Debug, Insertable)]
#[diesel(belongs_to(Notebook))]
#[diesel(table_name = crate::schema::blocks)]
pub struct Block {
    pub id: Uuid,
    pub notebook_id: Uuid,
    pub title: String,
    pub block_type: BlockType,
    pub language: Option<Language>,
    pub content: String,
    pub metadata: Option<serde_json::Value>,
    pub position: i32,
}

#[derive(Serialize)]
pub struct NotebookResponse {
    #[serde(flatten)]
    pub meta: Notebook,
    pub blocks: Vec<BlockResponse>,
}

#[derive(Serialize)]
pub struct BlockResponse {
    pub id: Uuid,
    pub title: String,
    #[serde(rename = "type")]
    pub block_type: BlockType,
    pub content: String,
    pub language: Option<Language>,
    pub metadata: Option<BlockMetadata>,
}

#[derive(Insertable)]
#[diesel(table_name = notebooks)]
pub struct NewNotebook {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
}

#[derive(Insertable)]
#[diesel(table_name = blocks)]
pub struct NewBlock {
    pub id: Uuid,
    pub notebook_id: Uuid,
    pub title: String,
    pub block_type: BlockType,
    pub language: Option<Language>,
    pub content: String,
    pub metadata: Option<Value>,
    pub position: i32,
}

#[derive(Deserialize)]
pub struct UpdateNotebookTitle {
    pub title: String,
}

#[derive(Deserialize)]
pub struct SyncNotebookRequest {
    pub title: String,
    pub blocks: Vec<BlockRequest>,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
}

#[derive(Deserialize)]
pub struct BlockRequest {
    pub id: Uuid,
    pub title: String,
    #[serde(rename = "type")]
    pub block_type: BlockType,
    pub content: String,
    pub language: Option<Language>,
    pub metadata: Option<BlockMetadata>,
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub id: Uuid,
    pub title: String,
    pub content: String,
}

pub async fn create_notebook(
    conn: &mut AsyncPgConnection,
    new_notebook: &NewNotebook,
) -> Result<(), String> {
    use crate::schema::notebooks::dsl::*;

    match diesel::insert_into(notebooks)
        .values(new_notebook)
        .execute(conn)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn create_block(
    conn: &mut AsyncPgConnection,
    new_block: &NewBlock,
) -> Result<(), String> {
    use crate::schema::blocks::dsl::*;

    match diesel::insert_into(blocks)
        .values(new_block)
        .execute(conn)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn find_notebook_by_id(
    conn: &mut AsyncPgConnection,
    param_id: &Uuid,
) -> Result<Notebook, String> {
    use crate::schema::notebooks::dsl::*;
    match notebooks
        .filter(id.eq(param_id))
        .get_result::<Notebook>(conn)
        .await
    {
        Ok(notebook) => Ok(notebook),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn delete_notebook(conn: &mut AsyncPgConnection, param_id: &Uuid) -> Result<(), String> {
    use crate::schema::notebooks::dsl::*;

    match diesel::delete(notebooks.filter(id.eq(param_id)))
        .execute(conn)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn update_notebook_title(
    conn: &mut AsyncPgConnection,
    param_id: Uuid,
    new_title: String,
) -> Result<(), String> {
    use crate::schema::notebooks::dsl::*;

    match diesel::update(notebooks.filter(id.eq(param_id)))
        .set((title.eq(new_title), updated_at.eq(Utc::now())))
        .execute(conn)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn get_all_notebooks(
    conn: &mut AsyncPgConnection,
    param_id: &Uuid,
) -> Result<Vec<Notebook>, String> {
    use crate::schema::notebooks::dsl::*;

    match notebooks
        .filter(user_id.eq(param_id))
        .order(updated_at.desc())
        .load::<Notebook>(conn)
        .await
    {
        Ok(items) => Ok(items),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn find_blocks_by_notebook_id(
    conn: &mut AsyncPgConnection,
    param_nb_id: &Uuid,
) -> Result<Vec<Block>, String> {
    match blocks_dsl::blocks
        .filter(blocks_dsl::notebook_id.eq(param_nb_id))
        .order(blocks_dsl::position.asc())
        .load::<Block>(conn)
        .await
    {
        Ok(items) => Ok(items),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn sync_notebook_content(
    conn: &mut AsyncPgConnection,
    nb_id: Uuid,
    new_title: String,
    new_blocks: Vec<NewBlock>,
    set_is_public: bool,
) -> Result<(), String> {
    use crate::schema::notebooks::dsl::*;

    let result = conn
        .transaction::<_, diesel::result::Error, _>(|conn| {
            Box::pin(async move {
                diesel::update(notebooks.filter(id.eq(nb_id)))
                    .set((
                        title.eq(new_title),
                        updated_at.eq(chrono::Utc::now()),
                        is_public.eq(set_is_public),
                    ))
                    .execute(conn)
                    .await?;

                diesel::delete(blocks_dsl::blocks.filter(blocks_dsl::notebook_id.eq(nb_id)))
                    .execute(conn)
                    .await?;

                if !new_blocks.is_empty() {
                    diesel::insert_into(blocks_dsl::blocks)
                        .values(&new_blocks)
                        .execute(conn)
                        .await?;
                }

                Ok(())
            })
        })
        .await;

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn get_notebook_with_blocks(
    conn: &mut AsyncPgConnection,
    param_id: &Uuid,
) -> Result<NotebookResponse, String> {
    let notebook: Notebook = match notebooks::table
        .find(param_id)
        .first::<Notebook>(conn)
        .await
    {
        Ok(n) => n,
        Err(e) => return Err(format!("Notebook não encontrado: {}", e)),
    };

    let db_blocks: Vec<Block> = match Block::belonging_to(&notebook)
        .order(blocks::position.asc())
        .load::<Block>(conn)
        .await
    {
        Ok(b) => b,
        Err(e) => return Err(format!("Erro ao buscar blocos: {}", e)),
    };

    let api_blocks: Vec<BlockResponse> = db_blocks
        .into_iter()
        .map(|b| {
            let parsed_metadata: Option<BlockMetadata> =
                b.metadata
                    .and_then(|json_val| match serde_json::from_value(json_val) {
                        Ok(meta) => Some(meta),
                        Err(e) => {
                            println!("Erro ao desserializar metadata do bloco {}: {}", b.id, e);
                            None
                        }
                    });

            BlockResponse {
                id: b.id,
                title: b.title,
                block_type: b.block_type,
                content: b.content,
                language: b.language,
                metadata: parsed_metadata,
            }
        })
        .collect();

    Ok(NotebookResponse {
        meta: notebook,
        blocks: api_blocks,
    })
}

pub async fn clone_notebook(
    conn: &mut AsyncPgConnection,
    target_notebook_id: &Uuid,
    new_notebook_id: &Uuid,
    new_notebook_title: &str,
) -> Result<(), ApiError> {
    use crate::schema::notebooks::dsl::*;

    let target_notebook: Notebook = match notebooks
        .filter(id.eq(target_notebook_id))
        .get_result(conn)
        .await
    {
        Ok(n) => n,
        Err(e) => return Err(ApiError::Database(e.to_string())),
    };

    let db_blocks: Vec<Block> = match Block::belonging_to(&target_notebook)
        .order(blocks::position.asc())
        .load::<Block>(conn)
        .await
    {
        Ok(b) => b,
        Err(e) => return Err(ApiError::Database(e.to_string())),
    };

    let mut new_db_blocks = vec![];
    if !db_blocks.is_empty() {
        for block in db_blocks {
            let mut block = block;
            block.id = Uuid::new_v4();
            block.notebook_id = new_notebook_id.clone();

            new_db_blocks.push(block);
        }
    }

    let result = conn
        .transaction::<_, diesel::result::Error, _>(|conn| {
            Box::pin(async move {
                diesel::update(notebooks.filter(id.eq(new_notebook_id)))
                    .set((
                        title.eq(new_notebook_title),
                        updated_at.eq(chrono::Utc::now()),
                        is_public.eq(target_notebook.is_public),
                        document_data.eq(target_notebook.document_data),
                    ))
                    .execute(conn)
                    .await?;

                diesel::delete(
                    blocks_dsl::blocks.filter(blocks_dsl::notebook_id.eq(new_notebook_id)),
                )
                .execute(conn)
                .await?;

                diesel::insert_into(blocks_dsl::blocks)
                    .values(&new_db_blocks)
                    .execute(conn)
                    .await?;

                Ok(())
            })
        })
        .await;

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

pub async fn search_user_blocks(
    conn: &mut AsyncPgConnection,
    current_user_id: uuid::Uuid,
    search_term: &str,
) -> Result<Vec<SearchResult>, ApiError> {
    use crate::schema::blocks::dsl as b;
    use crate::schema::notebooks::dsl as n;

    let results_tuples: Vec<(uuid::Uuid, String, String)> = b::blocks
        .inner_join(n::notebooks.on(b::notebook_id.eq(n::id)))
        .filter(
            n::user_id.eq(current_user_id).and(
                b::title
                    .ilike(&search_term)
                    .or(b::content.ilike(&search_term)),
            ),
        )
        .select((n::id, n::title, b::content))
        .limit(10)
        .load(conn)
        .await
        .map_err(|e| ApiError::Database(e.to_string()))?;

    let final_results = results_tuples
        .into_iter()
        .map(|(id, title, content)| SearchResult { id, title, content })
        .collect::<Vec<SearchResult>>();

    Ok(final_results)
}

pub async fn load_notebook_data(
    conn: &mut AsyncPgConnection,
    notebook_id: Uuid,
) -> Option<Vec<u8>> {
    use crate::schema::notebooks::dsl::*;

    notebooks
        .filter(id.eq(notebook_id))
        .select(document_data)
        .first::<Option<Vec<u8>>>(conn)
        .await
        .unwrap_or(None)
}

pub async fn save_notebook_data(
    conn: &mut AsyncPgConnection,
    user_id_param: Uuid,
    notebook_id_param: Uuid,
    data: Vec<u8>,
) {
    use crate::schema::notebooks::dsl::*;

    /*
    let notebook: Notebook = notebooks
        .filter(id.eq(notebook_id_param))
        .get_result(conn)
        .await
        .unwrap();

    if notebook.user_id != user_id_param && !notebook.is_public {
        return;
    }
    */

    diesel::update(notebooks)
        .filter(id.eq(notebook_id_param))
        .set((
            document_data.eq(data),
            updated_at.eq(chrono::Utc::now().naive_utc()),
        ))
        .execute(conn)
        .await
        .ok();
}
