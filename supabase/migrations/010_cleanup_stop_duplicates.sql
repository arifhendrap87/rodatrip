-- Drop duplicate columns from itinerary_stops (data now lives in spots)
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS category;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS description;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS opening_hours;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS facilities;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS road_access;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS rating;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS image_url;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS physical_effort;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS ticket_price;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS parking_fee;
