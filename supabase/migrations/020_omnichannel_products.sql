ALTER TABLE products ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tokopedia_url text;
