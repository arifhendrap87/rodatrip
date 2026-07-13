-- Add concept_type and carousel fields to content_drafts
-- Allows saving both caption and viral carousel results as concepts

ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS concept_type text NOT NULL DEFAULT 'caption' CHECK (concept_type IN ('caption', 'carousel'));
ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS text_overlays jsonb DEFAULT '[]';
ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS image_prompts jsonb DEFAULT '[]';
ALTER TABLE content_drafts ADD COLUMN IF NOT EXISTS source_type text DEFAULT '';

-- Widen content_type constraint to include 'blog'
ALTER TABLE content_drafts DROP CONSTRAINT IF EXISTS content_drafts_content_type_check;
ALTER TABLE content_drafts ADD CONSTRAINT content_drafts_content_type_check CHECK (content_type IN ('roadtrip', 'spot', 'blog'));
