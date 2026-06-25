CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO settings (key, value) VALUES ('site_name', 'Plesiran Darat') ON CONFLICT (key) DO NOTHING;
