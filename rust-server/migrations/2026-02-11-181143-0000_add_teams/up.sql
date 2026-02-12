-- Your SQL goes here
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    image_url VARCHAR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE team_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,

    can_read BOOLEAN NOT NULL DEFAULT true,
    can_write BOOLEAN NOT NULL DEFAULT false,
    can_manage_privacy BOOLEAN NOT NULL DEFAULT false,
    can_manage_clones BOOLEAN NOT NULL DEFAULT false,
    can_invite_users BOOLEAN NOT NULL DEFAULT false,
    can_remove_users BOOLEAN NOT NULL DEFAULT false,
    can_manage_permissions BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES team_roles(id) ON DELETE RESTRICT,

    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(team_id, user_id)
);
