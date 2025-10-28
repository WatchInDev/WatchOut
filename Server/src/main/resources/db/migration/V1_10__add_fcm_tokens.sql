CREATE TABLE IF NOT EXISTS watchout.tokens_fcm (
                                                      id BIGSERIAL PRIMARY KEY,
                                                      user_id BIGINT NOT NULL UNIQUE,
                                                      token VARCHAR(255) NOT NULL,
                                                      created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES watchout.users(id)
    );