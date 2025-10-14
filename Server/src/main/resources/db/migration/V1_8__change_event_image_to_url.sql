DELETE FROM watchout.event_ratings;
DELETE FROM watchout.comment_ratings;
DELETE FROM watchout.comments;
DELETE FROM watchout.events;


ALTER TABLE watchout.events
ALTER COLUMN image TYPE VARCHAR(255);