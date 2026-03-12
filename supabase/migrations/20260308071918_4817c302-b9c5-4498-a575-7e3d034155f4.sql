
-- Allow admins to manage colleges
CREATE POLICY "Colleges can be inserted by anyone" ON public.colleges FOR INSERT WITH CHECK (true);
CREATE POLICY "Colleges can be updated by anyone" ON public.colleges FOR UPDATE USING (true);
CREATE POLICY "Colleges can be deleted by anyone" ON public.colleges FOR DELETE USING (true);
