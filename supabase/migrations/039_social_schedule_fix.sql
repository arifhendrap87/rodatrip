-- 039_social_schedule_fix.sql
-- Tambah kolom yang dibutuhkan schedule POST (sudah insert created_by tapi kolom belum ada)
-- + index untuk query cron

ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS created_by UUID;
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status_time ON scheduled_posts(status, scheduled_at);
