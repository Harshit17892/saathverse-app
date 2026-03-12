
-- Trigger function: sync profile data to students table
CREATE OR REPLACE FUNCTION public.sync_profile_to_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _branch_id uuid;
BEGIN
  -- Only sync if profile has a name (completed onboarding)
  IF NEW.full_name IS NULL OR NEW.full_name = '' THEN
    RETURN NEW;
  END IF;

  -- Try to find matching branch by name
  SELECT id INTO _branch_id
  FROM public.branches
  WHERE college_id = NEW.college_id
    AND (name ILIKE '%' || NEW.branch || '%' OR NEW.branch ILIKE '%' || name || '%')
  LIMIT 1;

  -- Upsert into students table using user_id as a stable key
  INSERT INTO public.students (id, name, email, branch_id, college_id, skills, bio, avatar_url, status, graduation_year)
  VALUES (
    NEW.user_id,
    NEW.full_name,
    (SELECT email FROM auth.users WHERE id = NEW.user_id),
    _branch_id,
    NEW.college_id,
    NEW.skills,
    NEW.bio,
    NEW.photo_url,
    CASE WHEN NEW.is_alumni THEN 'alumni' ELSE 'active' END,
    CASE 
      WHEN NEW.year_of_study = '1st Year' THEN EXTRACT(YEAR FROM NOW())::int + 3
      WHEN NEW.year_of_study = '2nd Year' THEN EXTRACT(YEAR FROM NOW())::int + 2
      WHEN NEW.year_of_study = '3rd Year' THEN EXTRACT(YEAR FROM NOW())::int + 1
      WHEN NEW.year_of_study = '4th Year' THEN EXTRACT(YEAR FROM NOW())::int
      WHEN NEW.year_of_study = '5th Year' THEN EXTRACT(YEAR FROM NOW())::int
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    branch_id = EXCLUDED.branch_id,
    college_id = EXCLUDED.college_id,
    skills = EXCLUDED.skills,
    bio = EXCLUDED.bio,
    avatar_url = EXCLUDED.avatar_url,
    status = EXCLUDED.status,
    graduation_year = EXCLUDED.graduation_year,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_sync_student ON public.profiles;
CREATE TRIGGER on_profile_sync_student
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_to_student();

-- Sync existing profiles to students
INSERT INTO public.students (id, name, email, college_id, skills, bio, avatar_url, status)
SELECT 
  p.user_id,
  p.full_name,
  u.email,
  p.college_id,
  p.skills,
  p.bio,
  p.photo_url,
  CASE WHEN p.is_alumni THEN 'alumni' ELSE 'active' END
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.full_name IS NOT NULL AND p.full_name != ''
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  college_id = EXCLUDED.college_id,
  skills = EXCLUDED.skills,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  status = EXCLUDED.status,
  updated_at = NOW();
