-- Your SQL goes here
ALTER TABLE team_roles ADD COLUMN can_manage_team BOOLEAN NOT NULL DEFAULT false;
