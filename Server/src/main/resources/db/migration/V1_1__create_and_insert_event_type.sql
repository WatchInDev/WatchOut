CREATE TABLE watchout.event_types (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            icon BYTEA NOT NULL,
                            description TEXT NOT NULL,
                            created_at TIMESTAMP NOT NULL DEFAULT now(),
                            updated_at TIMESTAMP DEFAULT now()
);


INSERT INTO watchout.event_types (name, icon, description, created_at, updated_at)
VALUES
    (
        'event-type1',
        decode('47494638396126002600F7', 'hex'),
        'event type 1 description',
        now(),
        now()
    ),
    (
        'event-type2',
        decode('47494638396126002600F7', 'hex'),
        'event type 2 description',
        now(),
        now()
    ),
    (
        'event-type3',
        decode('47494638396126002600F7', 'hex'),
        '',
        now(),
        now()
    );