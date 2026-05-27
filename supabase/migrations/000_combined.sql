-- Gaskuy — Combined Database Schema + RLS Policies
-- Migration: 000_combined
-- Copy paste this in Supabase SQL Editor and run

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Spots
CREATE TABLE spots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('alam', 'kuliner', 'budaya', 'foto', 'petualangan', 'sejarah')),
  province text NOT NULL,
  region text NOT NULL,
  location geography(POINT, 4326) NOT NULL,
  description text NOT NULL,
  why_special text NOT NULL,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  image_url text,
  image_credit text DEFAULT 'Unsplash',
  tags text[],
  tips text,
  best_time text,
  opening_hours text,
  estimated_time text,
  ticket_price text,
  road_access text,
  facilities text[],
  distance_from_city text,
  popular_routes jsonb DEFAULT '[]'::jsonb,
  related_product_ids uuid[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  original_price integer,
  description text,
  image_url text,
  images text[] DEFAULT '{}',
  rating numeric(2,1),
  stock_quantity integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. POI
CREATE TABLE poi (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  location geography(POINT, 4326) NOT NULL,
  address text,
  rating numeric(2,1),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Routes
CREATE TABLE routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  distance_km numeric,
  duration_hours numeric,
  polyline jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Waitlist
CREATE TABLE waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);

-- 6. Profiles (admin users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('super_admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Analytics
CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_spots_category ON spots(category);
CREATE INDEX idx_spots_province ON spots(province);
CREATE INDEX idx_spots_region ON spots(region);
CREATE INDEX idx_spots_location ON spots USING GIST(location);
CREATE INDEX idx_spots_featured ON spots(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_poi_category ON poi(category);
CREATE INDEX idx_poi_location ON poi USING GIST(location);
CREATE INDEX idx_analytics_event ON analytics(event_type, created_at);

-- Auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poi_updated_at BEFORE UPDATE ON poi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS Policies (from 002)
-- =============================================

-- Enable RLS
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE poi ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Spots: Public read, Admin write
CREATE POLICY "Public can view spots" ON spots
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admin can insert spots" ON spots
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

CREATE POLICY "Admin can update spots" ON spots
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

CREATE POLICY "Admin can delete spots" ON spots
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

-- Products: Public read, Admin write
CREATE POLICY "Public can view products" ON products
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admin can manage products" ON products
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- POI: Public read, Admin write
CREATE POLICY "Public can view POI" ON poi
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admin can manage POI" ON poi
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Routes: Public read, Admin write
CREATE POLICY "Public can view routes" ON routes
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admin can manage routes" ON routes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Waitlist: Admin only
CREATE POLICY "Admin can view waitlist" ON waitlist
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

-- Profiles: User can view own, Admin can manage all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Admin can manage all profiles" ON profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Analytics: Admin only
CREATE POLICY "Admin can view analytics" ON analytics
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

CREATE POLICY "Admin can insert analytics" ON analytics
  FOR INSERT TO authenticated, anon WITH CHECK (true);
