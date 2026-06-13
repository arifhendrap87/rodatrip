-- Gaskuy — Itineraries (Curated Multi-Stop Road Trip Guides)
-- Migration: 004_itineraries
-- Run this in Supabase SQL Editor or via migration runner

-- 1. Itineraries (macro-level trip info)
CREATE TABLE itineraries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  itinerary_duration text,
  total_distance text,
  road_condition text,
  estimated_cost text,
  best_driving_time text,
  route_facilities text[] DEFAULT '{}',
  maps_embed_url text,
  driving_safety_tips text,
  culinary_notes text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Itinerary Stops (per-destination repeater)
CREATE TABLE itinerary_stops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id uuid NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  stop_number integer NOT NULL,
  name text NOT NULL,
  category text,
  visit_duration text,
  best_visit_hour text,
  ticket_price text,
  parking_fee text,
  additional_cost text,
  physical_effort text,
  spot_facilities text[] DEFAULT '{}',
  spot_important_note text,
  description text,
  spot_slug text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(itinerary_id, stop_number)
);

-- Indexes
CREATE INDEX idx_itineraries_published ON itineraries(is_published) WHERE is_published = true;
CREATE INDEX idx_itinerary_stops_itinerary ON itinerary_stops(itinerary_id);
CREATE INDEX idx_itinerary_stops_order ON itinerary_stops(itinerary_id, stop_number);

-- Auto-update triggers
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itinerary_stops_updated_at BEFORE UPDATE ON itinerary_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_stops ENABLE ROW LEVEL SECURITY;

-- Itineraries: Public read (published), Admin write
CREATE POLICY "Public can view published itineraries" ON itineraries
  FOR SELECT TO authenticated, anon USING (is_published = true);

CREATE POLICY "Admin can view all itineraries" ON itineraries
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

CREATE POLICY "Admin can manage itineraries" ON itineraries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Itinerary Stops: Public read (via published itineraries), Admin write
CREATE POLICY "Public can view itinerary stops" ON itinerary_stops
  FOR SELECT TO authenticated, anon USING (
    EXISTS (SELECT 1 FROM itineraries WHERE itineraries.id = itinerary_stops.itinerary_id AND itineraries.is_published = true)
  );

CREATE POLICY "Admin can view all itinerary stops" ON itinerary_stops
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

CREATE POLICY "Admin can manage itinerary stops" ON itinerary_stops
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Service role grants
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
