-- Gaskuy — Blog SEO Columns
-- Migration: 026

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS prompt_gambar text;
