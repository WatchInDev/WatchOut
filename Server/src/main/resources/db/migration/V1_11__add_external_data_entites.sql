CREATE TABLE IF NOT EXISTS watchout.electrical_outages (
                                                           id BIGSERIAL PRIMARY KEY,
                                                           region VARCHAR(255) NOT NULL,
    voivodeship VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    from_date TIMESTAMP NOT NULL,
    to_date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT electrical_outages_business_unique
    UNIQUE (region, voivodeship, provider, from_date, to_date, location)
    );

CREATE TABLE IF NOT EXISTS watchout.weather_warnings (
                                                         id BIGSERIAL PRIMARY KEY,
                                                         region VARCHAR(255) NOT NULL,
    event VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    from_date TIMESTAMP NOT NULL,
    to_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT weather_warnings_business_unique
    UNIQUE (region, event, description, from_date, to_date)
    );