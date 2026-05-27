-- Gaskuy — Local Database Schema (without PostGIS)
-- For local development only. Use 000_combined.sql for staging/production.

-- No PostGIS extension (uses JSONB for location instead)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Spots
CREATE TABLE spots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('alam', 'kuliner', 'budaya', 'foto', 'petualangan', 'sejarah')),
  province text NOT NULL,
  region text NOT NULL,
  location jsonb NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
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
  location jsonb NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
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
-- Note: No FK to auth.users for local dev (Supabase auth schema not available locally)
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
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

-- Indexes (without PostGIS GIST indexes)
CREATE INDEX idx_spots_category ON spots(category);
CREATE INDEX idx_spots_province ON spots(province);
CREATE INDEX idx_spots_region ON spots(region);
CREATE INDEX idx_spots_featured ON spots(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_poi_category ON poi(category);
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
