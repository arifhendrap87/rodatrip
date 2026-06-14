-- Add all independent stop fields to itinerary_stops
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS opening_hours text;
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS facilities text[] DEFAULT '{}';
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS road_access text;
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS rating numeric(2,1);
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS lat numeric(10,7);
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS lng numeric(10,7);
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS physical_effort text;
