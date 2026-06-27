CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok')),
  tone TEXT NOT NULL CHECK (tone IN ('promo', 'edukasi', 'inspirasi', 'storytelling')),
  content_type TEXT NOT NULL CHECK (content_type IN ('roadtrip', 'spot')),
  source_id TEXT,
  source_title TEXT,
  caption TEXT NOT NULL DEFAULT '',
  hashtags TEXT DEFAULT '',
  skrip_tiktok TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read content_drafts"
  ON content_drafts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert content_drafts"
  ON content_drafts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update content_drafts"
  ON content_drafts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete content_drafts"
  ON content_drafts FOR DELETE
  USING (auth.role() = 'authenticated');
