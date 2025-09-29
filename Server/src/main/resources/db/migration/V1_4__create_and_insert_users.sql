CREATE TABLE IF NOT EXISTS watchout.users (
                                              id BIGSERIAL PRIMARY KEY,
                                              name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    reputation DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
    );

INSERT INTO watchout.users (name, last_name, email, phone_number, reputation)
VALUES
    ('Alice', 'Smith', 'alice.smith@example.com', '+1-555-0001', 0.0),
    ('Bob', 'Johnson', 'bob.johnson@example.com', '+1-555-0002', -100),
    ('Charlie', 'Brown', 'charlie.brown@example.com', '+1-555-0003', -50),
    ('Diana', 'Prince', 'diana.prince@example.com', '+1-555-0004', 50),
    ('Evan', 'Taylor', 'evan.taylor@example.com', '+1-555-0005', 100);