-- Add prompt_gambar column to spots and itineraries for AI image prompt storage

ALTER TABLE spots ADD COLUMN IF NOT EXISTS prompt_gambar text;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS prompt_gambar text;
