CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '123456'
);

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrations to add new fields if table already exists
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Seed initial data if tables are empty
INSERT INTO users (id, name, email, password)
VALUES 
    (1, 'Amit', 'amit@test.com', '123456'),
    (2, 'Riya', 'riya@test.com', '123456')
ON CONFLICT (email) DO NOTHING;

INSERT INTO notes (id, title, content, user_id, is_pinned, tags, created_at, updated_at)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Welcome to Notes Management System 🚀', 'This is a sample note with tagging and pinning capabilities. You can pin notes to keep them at the top of your list, and filter by various tags like "work", "ideas", etc.', 1, true, ARRAY['work', 'welcome'], '2026-06-05T00:00:00.000Z', '2026-06-05T00:00:00.000Z'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Feature Requests 💡', 'Here are some items we are planning to work on next:
- Rich text markdown editor
- Color category blocks
- Search performance indexing
- Archive folder', 2, false, ARRAY['ideas', 'roadmap'], '2026-06-05T01:00:00.000Z', '2026-06-05T01:00:00.000Z')
ON CONFLICT DO NOTHING;

-- Synchronize serial primary key sequence for users if seed data inserted
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);

