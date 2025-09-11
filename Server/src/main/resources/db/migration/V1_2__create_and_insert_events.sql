CREATE TABLE watchout.events (
                                 id BIGSERIAL PRIMARY KEY,
                                 name VARCHAR(255) NOT NULL,
                                 description TEXT NOT NULL,
                                 image BYTEA NOT NULL,
                                 latitude DOUBLE PRECISION NOT NULL,
                                 longitude DOUBLE PRECISION NOT NULL,
                                 reported_date TIMESTAMP NOT NULL,
                                 end_date TIMESTAMP NOT NULL,
                                 is_active BOOLEAN NOT NULL,
                                 event_type_id BIGSERIAL NOT NULL,
                                 created_at TIMESTAMP NOT NULL DEFAULT now(),
                                 updated_at TIMESTAMP DEFAULT now(),
                                 CONSTRAINT fk_event_type
                                     FOREIGN KEY (event_type_id)
                                         REFERENCES watchout.event_types (id)
);

-- Just for testing
INSERT INTO watchout.events (
     name, description, image, latitude, longitude, reported_date, end_date, is_active, event_type_id
) VALUES
      ( 'Spring Festival', 'A community festival with music and food.', E'\\x', 40.7128, -74.0060, '2025-06-01 14:00:00', '2025-06-01 20:00:00', true, 1),

      ( 'Book Fair', 'Annual gathering for local authors and readers.', E'\\x', 34.0522, -118.2437, '2025-07-15 09:00:00', '2025-07-15 17:00:00', true, 2),

      ( 'Marathon', 'City-wide running event.', E'\\x', 41.8781, -87.6298, '2025-05-20 07:00:00', '2025-05-20 13:00:00', true, 3),

      ( 'Art Exhibition', 'Showcasing local artists.', E'\\x', 51.5074, -0.1278, '2025-08-10 10:00:00', '2025-08-10 18:00:00', true, 1),

      ( 'Charity Concert', 'Benefit concert for local shelter.', E'\\x', 48.8566, 2.3522, '2025-09-05 18:00:00', '2025-09-05 22:00:00', false, 2);