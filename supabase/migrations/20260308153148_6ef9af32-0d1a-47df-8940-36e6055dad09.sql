
-- Table to store pending admin invites
CREATE TABLE public.pending_admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'college_admin',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, college_id)
);

ALTER TABLE public.pending_admin_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invites
CREATE POLICY "Admins can view invites" ON public.pending_admin_invites
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert invites" ON public.pending_admin_invites
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invites" ON public.pending_admin_invites
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invites" ON public.pending_admin_invites
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger: when a new user signs up, check if they have a pending invite
CREATE OR REPLACE FUNCTION public.process_admin_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite RECORD;
  _email text;
BEGIN
  -- Get the user's email
  SELECT email INTO _email FROM auth.users WHERE id = NEW.user_id;
  
  IF _email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check for pending invites
  FOR _invite IN
    SELECT * FROM public.pending_admin_invites
    WHERE lower(email) = lower(_email)
    AND status = 'pending'
  LOOP
    -- Assign the role
    INSERT INTO public.user_roles (user_id, role, college_id)
    VALUES (NEW.user_id, _invite.role, _invite.college_id)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Update the profile's college_id if not set
    IF NEW.college_id IS NULL THEN
      NEW.college_id := _invite.college_id;
    END IF;

    -- Mark invite as accepted
    UPDATE public.pending_admin_invites
    SET status = 'accepted', updated_at = now()
    WHERE id = _invite.id;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Fire BEFORE insert on profiles so we can modify college_id
CREATE TRIGGER on_profile_created_check_invite
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.process_admin_invite();
