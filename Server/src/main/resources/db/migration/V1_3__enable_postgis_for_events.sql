CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE watchout.events
    ADD COLUMN IF NOT EXISTS location GEOMETRY(POINT, 4326);

DELETE FROM watchout.events WHERE location IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_location ON watchout.events USING GIST(location);

CREATE OR REPLACE FUNCTION watchout.update_event_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
RETURN NEW;
END;

$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_event_location ON watchout.events;

CREATE TRIGGER trg_update_event_location
    BEFORE INSERT OR UPDATE OF longitude, latitude ON watchout.events
    FOR EACH ROW
    WHEN (NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL)
    EXECUTE FUNCTION watchout.update_event_location();
