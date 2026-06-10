-- Add lat/lng to itinerary_stops for nearby places
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS lat numeric(10,7);
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS lng numeric(10,7);

-- Add cover_image to itineraries
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS cover_image text;
