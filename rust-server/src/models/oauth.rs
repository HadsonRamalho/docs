use oauth2::{EmptyExtraTokenFields, StandardTokenResponse, basic::BasicTokenType};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct AuthRequest {
    pub code: String,
    pub state: String,
}

#[derive(Debug, Deserialize)]
pub struct GithubUser {
    pub id: u64,
    pub login: String,
    pub avatar_url: String,
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct GithubEmail {
    pub email: String,
    pub primary: bool,
    pub verified: bool,
}

#[derive(Debug, Deserialize)]
pub struct GithubUserResponse {
    pub user: GithubUser,
    pub token: StandardTokenResponse<EmptyExtraTokenFields, BasicTokenType>,
}
