-- 038_social_rls.sql
-- Enable RLS untuk social_accounts & scheduled_posts
-- Service_role bypasses RLS, jadi bisa akses via admin API

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
