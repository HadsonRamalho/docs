ALTER TABLE notebooks
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

ALTER TABLE notebooks
    ADD CONSTRAINT notebook_owner_check
    CHECK (user_id IS NOT NULL OR team_id IS NOT NULL);
