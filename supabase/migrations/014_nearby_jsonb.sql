-- Change nearby_hotels and nearby_restaurants from text to jsonb
ALTER TABLE spots ADD COLUMN IF NOT EXISTS nearby_hotels_jsonb jsonb DEFAULT '[]';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS nearby_restaurants_jsonb jsonb DEFAULT '[]';
