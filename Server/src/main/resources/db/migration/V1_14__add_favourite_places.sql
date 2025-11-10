CREATE TABLE IF NOT EXISTS watchout.user_favourite_places (
                                                           id BIGSERIAL PRIMARY KEY,
                                                           region VARCHAR(255) NOT NULL,
    voivodeship VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    locality VARCHAR(255),
    point GEOMETRY(POINT, 4326),
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES watchout.users(id)
    );

CREATE INDEX idx_fav_places_point
    ON watchout.user_favourite_places USING gist (point);
CREATE INDEX idx_fav_places_region_trgm
    ON watchout.user_favourite_places USING gin (region gin_trgm_ops);
CREATE INDEX idx_fav_places_voivodeship_trgm
    ON watchout.user_favourite_places USING gin (voivodeship gin_trgm_ops);
CREATE INDEX idx_fav_places_location_trgm
    ON watchout.user_favourite_places USING gin (location gin_trgm_ops);
CREATE INDEX idx_fav_places_region_trgm
    ON watchout.user_favourite_places USING gin (locality gin_trgm_ops);