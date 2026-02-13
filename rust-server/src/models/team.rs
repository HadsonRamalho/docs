use crate::models::error::ApiError;
use crate::schema::{team_members, team_roles, teams};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// --- TEAMS ---

#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = teams)]
pub struct Team {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = teams)]
pub struct NewTeam {
    pub name: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
}

#[derive(AsChangeset, Deserialize)]
#[diesel(table_name = teams)]
pub struct UpdateTeam {
    pub name: Option<String>,
    pub description: Option<String>,
    pub image_url: Option<String>,
}

// --- TEAM ROLES ---

#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize, Clone)]
#[diesel(table_name = team_roles)]
pub struct TeamRole {
    pub id: Uuid,
    pub team_id: Uuid,
    pub name: String,
    pub can_read: bool,
    pub can_write: bool,
    pub can_manage_privacy: bool,
    pub can_manage_clones: bool,
    pub can_invite_users: bool,
    pub can_remove_users: bool,
    pub can_manage_permissions: bool,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = team_roles)]
pub struct NewTeamRole {
    pub team_id: Uuid,
    pub name: String,
    // Permissões opcionais (defaults definidos no banco, mas aqui podemos passar explícito)
    pub can_read: bool,
    pub can_write: bool,
    pub can_manage_privacy: bool,
    pub can_manage_clones: bool,
    pub can_invite_users: bool,
    pub can_remove_users: bool,
    pub can_manage_permissions: bool,
}

#[derive(AsChangeset, Deserialize)]
#[diesel(table_name = team_roles)]
pub struct UpdateTeamRole {
    pub name: Option<String>,
    pub can_read: Option<bool>,
    pub can_write: Option<bool>,
    pub can_manage_privacy: Option<bool>,
    pub can_manage_clones: Option<bool>,
    pub can_invite_users: Option<bool>,
    pub can_remove_users: Option<bool>,
    pub can_manage_permissions: Option<bool>,
}

// --- TEAM MEMBERS ---

#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = team_members)]
pub struct TeamMember {
    pub id: Uuid,
    pub team_id: Uuid,
    pub user_id: Uuid,
    pub role_id: Uuid,
    pub joined_at: NaiveDateTime,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = team_members)]
pub struct NewTeamMember {
    pub team_id: Uuid,
    pub user_id: Uuid,
    pub role_id: Uuid,
}

// src/db/teams.rs (ou onde preferir organizar)

// -----------------------------------------------------------------------------
// TEAMS
// -----------------------------------------------------------------------------

pub async fn create_team(conn: &mut AsyncPgConnection, data: &NewTeam) -> Result<Team, ApiError> {
    match diesel::insert_into(teams::table)
        .values(data)
        .get_result(conn)
        .await
    {
        Ok(team) => Ok(team),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

pub async fn find_team_by_id(
    conn: &mut AsyncPgConnection,
    team_id_param: Uuid,
) -> Result<Team, String> {
    match teams::table
        .filter(teams::id.eq(team_id_param))
        .get_result(conn)
        .await
    {
        Ok(team) => Ok(team),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn update_team_data(
    conn: &mut AsyncPgConnection,
    team_id_param: Uuid,
    data: &UpdateTeam,
) -> Result<Team, ApiError> {
    match diesel::update(teams::table)
        .filter(teams::id.eq(team_id_param))
        .set(data)
        .get_result(conn) // Retorna o time atualizado
        .await
    {
        Ok(team) => Ok(team),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

pub async fn delete_team(
    conn: &mut AsyncPgConnection,
    team_id_param: Uuid,
) -> Result<(), ApiError> {
    match diesel::delete(teams::table)
        .filter(teams::id.eq(team_id_param))
        .execute(conn)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

// -----------------------------------------------------------------------------
// TEAM ROLES
// -----------------------------------------------------------------------------

pub async fn create_team_role(
    conn: &mut AsyncPgConnection,
    data: &NewTeamRole,
) -> Result<TeamRole, ApiError> {
    match diesel::insert_into(team_roles::table)
        .values(data)
        .get_result(conn)
        .await
    {
        Ok(role) => Ok(role),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

pub async fn find_roles_by_team(
    conn: &mut AsyncPgConnection,
    team_id_param: Uuid,
) -> Result<Vec<TeamRole>, String> {
    match team_roles::table
        .filter(team_roles::team_id.eq(team_id_param))
        .load::<TeamRole>(conn)
        .await
    {
        Ok(roles) => Ok(roles),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn update_team_role(
    conn: &mut AsyncPgConnection,
    role_id_param: Uuid,
    data: &UpdateTeamRole,
) -> Result<TeamRole, ApiError> {
    match diesel::update(team_roles::table)
        .filter(team_roles::id.eq(role_id_param))
        .set(data)
        .get_result(conn)
        .await
    {
        Ok(role) => Ok(role),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

// -----------------------------------------------------------------------------
// TEAM MEMBERS
// -----------------------------------------------------------------------------

pub async fn add_user_to_team(
    conn: &mut AsyncPgConnection,
    data: &NewTeamMember,
) -> Result<TeamMember, ApiError> {
    // Note: Isso pode falhar se violar a constraint UNIQUE(team_id, user_id)
    match diesel::insert_into(team_members::table)
        .values(data)
        .get_result(conn)
        .await
    {
        Ok(member) => Ok(member),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

pub async fn remove_user_from_team(
    conn: &mut AsyncPgConnection,
    team_id_param: Uuid,
    user_id_param: Uuid,
) -> Result<(), ApiError> {
    match diesel::delete(team_members::table)
        .filter(team_members::team_id.eq(team_id_param))
        .filter(team_members::user_id.eq(user_id_param))
        .execute(conn)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(ApiError::Database(e.to_string())),
    }
}

// Função utilitária para buscar todos os membros com seus papeis (JOIN)
// Retorna uma tupla (Membro, Role, User) - Assumindo que você tem a struct User
pub async fn find_team_members_with_roles(
    conn: &mut AsyncPgConnection,
    team_id_param: Uuid,
) -> Result<Vec<(TeamMember, TeamRole)>, String> {
    match team_members::table
        .inner_join(team_roles::table)
        .filter(team_members::team_id.eq(team_id_param))
        .select((team_members::all_columns, team_roles::all_columns))
        .load::<(TeamMember, TeamRole)>(conn)
        .await
    {
        Ok(results) => Ok(results),
        Err(e) => Err(e.to_string()),
    }
}
