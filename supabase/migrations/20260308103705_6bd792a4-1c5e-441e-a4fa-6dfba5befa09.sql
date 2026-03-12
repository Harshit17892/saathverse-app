
-- Update trigger to fire on ANY update to students, not just status changes
DROP TRIGGER IF EXISTS sync_student_alumni_trigger ON public.students;

CREATE OR REPLACE FUNCTION public.sync_student_to_alumni()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'alumni' THEN
    INSERT INTO public.alumni (id, name, department, location, college_id, avatar, batch, role, company, linkedin)
    VALUES (
      NEW.id,
      NEW.name,
      (SELECT b.name FROM public.branches b WHERE b.id = NEW.branch_id LIMIT 1),
      NULL,
      NEW.college_id,
      COALESCE(NEW.avatar_url, LEFT(NEW.name, 2)),
      CASE WHEN NEW.graduation_year IS NOT NULL THEN NEW.graduation_year::text ELSE NULL END,
      NULL,
      CASE WHEN NEW.social_links IS NOT NULL AND NEW.social_links->>'company' IS NOT NULL 
           THEN NEW.social_links->>'company' ELSE NULL END,
      CASE WHEN NEW.social_links IS NOT NULL AND NEW.social_links->>'linkedin' IS NOT NULL 
           THEN NEW.social_links->>'linkedin' ELSE NULL END
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      department = EXCLUDED.department,
      college_id = EXCLUDED.college_id,
      avatar = EXCLUDED.avatar,
      batch = EXCLUDED.batch,
      company = EXCLUDED.company,
      linkedin = EXCLUDED.linkedin,
      updated_at = NOW();
  END IF;

  IF OLD IS NOT NULL AND OLD.status = 'alumni' AND NEW.status != 'alumni' THEN
    DELETE FROM public.alumni WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_student_alumni_trigger
  AFTER INSERT OR UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_to_alumni();
