-- 037_social_connected_column.sql
-- Tambah kolom connected + created_at ke social_accounts (tidak ada di 035)

ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS connected BOOLEAN DEFAULT false;
ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
