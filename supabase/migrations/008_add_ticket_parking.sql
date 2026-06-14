-- Add ticket_price and parking_fee back to itinerary_stops
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS ticket_price text;
ALTER TABLE itinerary_stops ADD COLUMN IF NOT EXISTS parking_fee text;
