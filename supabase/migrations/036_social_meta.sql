-- 036_social_meta.sql
-- Tambah kolom untuk Facebook & Instagram OAuth

ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS page_id TEXT;
ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS page_name TEXT;
ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS ig_account_id TEXT;
