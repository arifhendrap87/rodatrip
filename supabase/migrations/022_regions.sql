CREATE TABLE IF NOT EXISTS regions (
  code text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('province', 'regency')),
  parent_code text REFERENCES regions(code),
  image_url text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(type);
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_code);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON regions FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON regions FOR ALL USING (auth.role() = 'authenticated');
