-- Add trip-specific info fields to spots (so itinerary_stops can be simplified)
ALTER TABLE spots ADD COLUMN IF NOT EXISTS visit_duration text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS best_visit_hour text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS additional_cost text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS spot_important_note text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS parking_fee text;
