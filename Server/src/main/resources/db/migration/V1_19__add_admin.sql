CREATE TABLE IF NOT EXISTS watchout.admins (
                                               id BIGSERIAL PRIMARY KEY,
                                               external_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
    );

INSERT INTO watchout.admins (external_id, name, email) VALUES
    ('admin-1', 'Admin One', 'admin@watchout.com');