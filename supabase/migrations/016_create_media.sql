CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  key text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size integer,
  folder text NOT NULL DEFAULT 'spots',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON media
  FOR ALL USING (auth.role() = 'authenticated');
