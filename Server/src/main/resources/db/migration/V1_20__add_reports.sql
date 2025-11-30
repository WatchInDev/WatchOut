CREATE TABLE IF NOT EXISTS watchout.reports (
                                                id BIGSERIAL PRIMARY KEY,
                                                reason TEXT NOT NULL,
                                                reporter_id BIGINT NOT NULL,
                                                reported_user_id BIGINT NOT NULL,
                                                reported_object_id BIGINT NOT NULL,
                                                reported_object VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_reports_reporter
    FOREIGN KEY (reporter_id) REFERENCES watchout.users (id),
    CONSTRAINT fk_reports_reported_user
    FOREIGN KEY (reported_user_id) REFERENCES watchout.users (id)
    );