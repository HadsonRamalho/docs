CREATE TYPE block_type_enum AS ENUM ('text', 'code', 'component');
CREATE TYPE language_enum AS ENUM ('rust', 'typescript', 'python');

CREATE TABLE notebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,

    block_type block_type_enum NOT NULL,
    language language_enum,

    content TEXT NOT NULL DEFAULT '',

    metadata JSONB DEFAULT '{}'::jsonb,

    position INTEGER NOT NULL
);

CREATE INDEX idx_blocks_notebook_id ON blocks(notebook_id);
CREATE INDEX idx_blocks_position ON blocks(notebook_id, position);
