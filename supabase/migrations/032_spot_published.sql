ALTER TABLE spots ADD COLUMN is_published boolean DEFAULT true;

UPDATE spots SET is_published = true WHERE is_published IS NULL;
