
-- Add gmail.com as a college so signup works
INSERT INTO public.colleges (name, domain, city, state)
VALUES ('SaathVerse HQ', 'gmail.com', 'Global', 'Global')
ON CONFLICT (domain) DO NOTHING;

-- Auto-assign admin role for this specific email on signup
CREATE OR REPLACE FUNCTION public.auto_assign_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'harshit02425@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_admin();
