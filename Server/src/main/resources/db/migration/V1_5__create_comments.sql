CREATE TABLE IF NOT EXISTS watchout.comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES watchout.users(id),
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES watchout.events(id)
);