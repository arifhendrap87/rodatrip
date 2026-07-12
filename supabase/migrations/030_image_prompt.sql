-- Add image prompt columns to spots and itineraries

ALTER TABLE spots ADD COLUMN IF NOT EXISTS image_prompt text;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS cover_image_prompt text;
