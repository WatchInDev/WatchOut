DROP TRIGGER IF EXISTS trg_update_event_location ON watchout.events;

DROP FUNCTION IF EXISTS watchout.update_event_location();

DELETE FROM watchout.comments;
DELETE FROM watchout.events;
DELETE FROM watchout.users;

ALTER TABLE watchout.events
    DROP COLUMN IF EXISTS longitude,
    DROP COLUMN IF EXISTS latitude,
    ADD COLUMN IF NOT EXISTS author_id BIGINT NOT NULL;

ALTER TABLE watchout.events
    ADD CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES watchout.users(id);

INSERT INTO watchout.users (name, last_name, email, phone_number, reputation)
VALUES
    ('Alice', 'Smith', 'alice.smith@example.com', '+1-555-0001', 1.0),
    ('Bob', 'Johnson', 'bob.johnson@example.com', '+1-555-0002', 1.0),
    ('Charlie', 'Brown', 'charlie.brown@example.com', '+1-555-0003', 0.0),
    ('Diana', 'Prince', 'diana.prince@example.com', '+1-555-0004', 0.25),
    ('Evan', 'Taylor', 'evan.taylor@example.com', '+1-555-0005', 0.5);


