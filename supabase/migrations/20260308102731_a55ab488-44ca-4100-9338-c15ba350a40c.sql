
-- Update the sync function to copy avatar_url and more fields
CREATE OR REPLACE FUNCTION public.sync_student_to_alumni()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'alumni' THEN
    INSERT INTO public.alumni (id, name, department, location, college_id, avatar, batch, linkedin)
    VALUES (
      NEW.id,
      NEW.name,
      (SELECT b.name FROM public.branches b WHERE b.id = NEW.branch_id LIMIT 1),
      NULL,
      NEW.college_id,
      COALESCE(NEW.avatar_url, LEFT(NEW.name, 2)),
      CASE WHEN NEW.graduation_year IS NOT NULL THEN NEW.graduation_year::text ELSE NULL END,
      CASE WHEN NEW.social_links IS NOT NULL AND NEW.social_links->>'linkedin' IS NOT NULL 
           THEN NEW.social_links->>'linkedin' ELSE NULL END
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      department = EXCLUDED.department,
      college_id = EXCLUDED.college_id,
      avatar = EXCLUDED.avatar,
      batch = EXCLUDED.batch,
      linkedin = EXCLUDED.linkedin,
      updated_at = NOW();
  END IF;

  IF OLD IS NOT NULL AND OLD.status = 'alumni' AND NEW.status != 'alumni' THEN
    DELETE FROM public.alumni WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Re-sync all existing alumni from students
UPDATE public.alumni a SET
  avatar = COALESCE(s.avatar_url, LEFT(s.name, 2)),
  department = (SELECT b.name FROM public.branches b WHERE b.id = s.branch_id LIMIT 1),
  batch = CASE WHEN s.graduation_year IS NOT NULL THEN s.graduation_year::text ELSE NULL END
FROM public.students s
WHERE a.id = s.id AND s.status = 'alumni';
