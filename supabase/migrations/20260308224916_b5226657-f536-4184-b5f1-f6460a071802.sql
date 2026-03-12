
-- Allow admins to manage rewards
CREATE POLICY "Admins can insert rewards" ON public.rewards
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'college_admin')
  );

CREATE POLICY "Admins can update rewards" ON public.rewards
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'college_admin')
  );

CREATE POLICY "Admins can delete rewards" ON public.rewards
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'college_admin')
  );

-- Allow admins to view all redemptions
CREATE POLICY "Admins can view all redemptions" ON public.reward_redemptions
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'college_admin')
  );

-- Drop the old select policy on reward_redemptions that only allowed own
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.reward_redemptions;
