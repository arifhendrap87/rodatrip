-- Add nearby hotels and restaurants info to spots
ALTER TABLE spots ADD COLUMN IF NOT EXISTS nearby_hotels text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS nearby_restaurants text;
