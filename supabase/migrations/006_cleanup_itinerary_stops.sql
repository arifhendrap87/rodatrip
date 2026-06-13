-- Gaskuy — Cleanup Itinerary Stops: FK, index, drop duplicate columns
-- Migration: 006
-- Run AFTER 004 and 005

-- Clean up invalid spot_slugs before adding FK
UPDATE itinerary_stops SET spot_slug = NULL
WHERE spot_slug IS NOT NULL AND spot_slug NOT IN (SELECT slug FROM spots);

ALTER TABLE itinerary_stops ADD CONSTRAINT fk_itinerary_stops_spot_slug
  FOREIGN KEY (spot_slug) REFERENCES spots(slug) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_itinerary_stops_spot_slug ON itinerary_stops(spot_slug);

-- Drop columns that duplicate spots table
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS description;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS ticket_price;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS parking_fee;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS physical_effort;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS spot_facilities;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS lat;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS lng;
ALTER TABLE itinerary_stops DROP COLUMN IF EXISTS category;
