CREATE TABLE IF NOT EXISTS watchout.event_ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_author FOREIGN KEY (user_id) REFERENCES watchout.users(id),
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES watchout.events(id),
    CONSTRAINT unique_user_event_rating UNIQUE (user_id, event_id)
    );

CREATE TABLE IF NOT EXISTS watchout.comment_ratings (
                                                      id BIGSERIAL PRIMARY KEY,
                                                      user_id BIGINT NOT NULL,
                                                      comment_id BIGINT NOT NULL,
                                                      rating INTEGER NOT NULL,
                                                      created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_author FOREIGN KEY (user_id) REFERENCES watchout.users(id),
    CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES watchout.comments(id),
    CONSTRAINT unique_user_comment_rating UNIQUE (user_id, comment_id)
    );