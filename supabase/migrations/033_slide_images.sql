ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS slide_images jsonb DEFAULT '[]';
