-- Make itinerary_stops.name nullable since spot name is in spots table
ALTER TABLE itinerary_stops ALTER COLUMN name DROP NOT NULL;
