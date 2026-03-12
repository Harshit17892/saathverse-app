CREATE OR REPLACE FUNCTION public.process_admin_invite()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

    -- Always set the profile's college_id to the invited college
    NEW.college_id := _invite.college_id;

    -- Mark invite as accepted
    UPDATE public.pending_admin_invites
    SET status = 'accepted', updated_at = now()
    WHERE id = _invite.id;
  END LOOP;

  RETURN NEW;
END;
$function$;