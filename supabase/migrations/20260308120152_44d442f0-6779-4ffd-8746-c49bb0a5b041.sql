
-- Drop the unique constraint on slug alone, replace with unique per college
ALTER TABLE branches DROP CONSTRAINT IF EXISTS branches_slug_key;
ALTER TABLE branches ADD CONSTRAINT branches_slug_college_unique UNIQUE (slug, college_id);
