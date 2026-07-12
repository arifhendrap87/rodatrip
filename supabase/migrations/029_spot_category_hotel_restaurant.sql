-- Add hotel and restaurant to spot category CHECK constraint
-- Match the SPOT_CATEGORIES array in src/lib/validators/spot.ts

ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_category_check;
ALTER TABLE spots ADD CONSTRAINT spots_category_check 
  CHECK (category IN ('alam','kuliner','budaya','foto','petualangan','sejarah','hotel','restaurant'));
