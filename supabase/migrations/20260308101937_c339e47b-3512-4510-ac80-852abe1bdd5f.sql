
-- Trigger: when a student's status changes to 'alumni', auto-insert into alumni table
-- When status changes away from 'alumni', remove from alumni table
CREATE OR REPLACE FUNCTION public.sync_student_to_alumni()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If student status is now 'alumni', upsert into alumni table
  IF NEW.status = 'alumni' THEN
    INSERT INTO public.alumni (id, name, department, location, college_id, avatar, batch)
    VALUES (
      NEW.id,
      NEW.name,
      (SELECT b.name FROM public.branches b WHERE b.id = NEW.branch_id LIMIT 1),
      NULL,
      NEW.college_id,
      COALESCE(LEFT(NEW.name, 2), 'AA'),
      CASE WHEN NEW.graduation_year IS NOT NULL THEN NEW.graduation_year::text ELSE NULL END
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      department = EXCLUDED.department,
      college_id = EXCLUDED.college_id,
      avatar = EXCLUDED.avatar,
      batch = EXCLUDED.batch,
      updated_at = NOW();
  END IF;

  -- If student status changed FROM 'alumni' to something else, remove from alumni
  IF OLD.status = 'alumni' AND NEW.status != 'alumni' THEN
    DELETE FROM public.alumni WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on students table
DROP TRIGGER IF EXISTS sync_student_alumni_trigger ON public.students;
CREATE TRIGGER sync_student_alumni_trigger
  AFTER INSERT OR UPDATE OF status ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_to_alumni();
