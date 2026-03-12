
-- Backfill: insert existing alumni-status students into the alumni table
INSERT INTO public.alumni (id, name, department, college_id, avatar, batch)
SELECT 
  s.id,
  s.name,
  (SELECT b.name FROM public.branches b WHERE b.id = s.branch_id LIMIT 1),
  s.college_id,
  COALESCE(LEFT(s.name, 2), 'AA'),
  CASE WHEN s.graduation_year IS NOT NULL THEN s.graduation_year::text ELSE NULL END
FROM public.students s
WHERE s.status = 'alumni'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  college_id = EXCLUDED.college_id,
  updated_at = NOW();
