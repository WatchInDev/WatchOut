CREATE TABLE watchout.user_global_preferences (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  user_id BIGINT NOT NULL UNIQUE,
                                                  notify_on_comment BOOLEAN DEFAULT TRUE,
                                                  notify_on_event BOOLEAN DEFAULT TRUE,
                                                  notify_on_external_warning BOOLEAN DEFAULT TRUE,
                                                  created_at TIMESTAMP NOT NULL DEFAULT now(),
                                                  updated_at TIMESTAMP DEFAULT now(),
                                                    FOREIGN KEY (user_id)
                                                        REFERENCES watchout.users (id)
);

CREATE TABLE watchout.user_favourite_place_references (
                                                          id BIGSERIAL PRIMARY KEY,
                                                          user_favourite_place_id BIGINT NOT NULL UNIQUE,
                                                          radius DOUBLE PRECISION,
                                                          weather BOOLEAN,
                                                          electricity BOOLEAN,
                                                          notification_enabled BOOLEAN,
                                                          created_at TIMESTAMP NOT NULL DEFAULT now(),
                                                          updated_at TIMESTAMP DEFAULT now(),
                                                            FOREIGN KEY (user_favourite_place_id)
                                                                REFERENCES watchout.user_favourite_places (id)

);

CREATE TABLE watchout.user_favourite_place_favourite_places (
                                                                user_favourite_place_preference_id BIGINT NOT NULL,
                                                                event_type_id BIGINT NOT NULL,
                                                                PRIMARY KEY (user_favourite_place_preference_id, event_type_id),
                                                                FOREIGN KEY (user_favourite_place_preference_id)
                                                                    REFERENCES watchout.user_favourite_place_references (id),
                                                                FOREIGN KEY (event_type_id)
                                                                    REFERENCES watchout.event_types (id)
);