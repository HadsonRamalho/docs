use crate::schema::team_invitations;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct InviteRequest {
    pub email: String,
    #[serde(rename = "roleId")]
    pub role_id: Uuid,
}

#[derive(Deserialize)]
pub struct AcceptInviteRequest {
    pub token: String,
}

#[derive(Queryable, Selectable, Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = team_invitations)]
pub struct TeamInvitation {
    pub id: Uuid,
    pub team_id: Uuid,
    pub role_id: Uuid,
    pub email: String,
    pub token: String,
    pub expires_at: NaiveDateTime,
    pub created_at: NaiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = team_invitations)]
pub struct NewTeamInvitation {
    pub team_id: Uuid,
    pub role_id: Uuid,
    pub email: String,
    pub token: String,
    pub expires_at: NaiveDateTime,
}

pub async fn create_invitation(
    conn: &mut AsyncPgConnection,
    data: &NewTeamInvitation,
) -> Result<TeamInvitation, String> {
    match diesel::insert_into(team_invitations::table)
        .values(data)
        .get_result(conn)
        .await
    {
        Ok(inv) => Ok(inv),
        Err(e) => Err(e.to_string()),
    }
}

pub async fn consume_invitation_by_token(
    conn: &mut AsyncPgConnection,
    token_param: &str,
) -> Result<TeamInvitation, String> {
    match diesel::delete(team_invitations::table.filter(team_invitations::token.eq(token_param)))
        .returning(team_invitations::all_columns)
        .get_result(conn)
        .await
    {
        Ok(inv) => Ok(inv),
        Err(e) => Err(e.to_string()),
    }
}
