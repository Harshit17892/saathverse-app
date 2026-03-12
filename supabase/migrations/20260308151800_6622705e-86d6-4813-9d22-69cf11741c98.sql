
-- Add college_admin to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'college_admin';

-- Create a college-scoped role check function
CREATE OR REPLACE FUNCTION public.has_college_role(_user_id uuid, _role app_role, _college_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (college_id = _college_id OR college_id IS NULL)
  )
$$;

-- Allow admins to manage user_roles (for assigning college admins)
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to view all roles (for the management UI)
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read roles" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
);
