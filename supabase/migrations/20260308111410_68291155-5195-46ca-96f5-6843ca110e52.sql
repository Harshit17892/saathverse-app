
CREATE TABLE public.branch_featured_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  achievement text,
  sort_order integer DEFAULT 0,
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(branch_id, student_id)
);

ALTER TABLE public.branch_featured_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Branch featured students viewable by everyone" ON public.branch_featured_students FOR SELECT USING (true);
CREATE POLICY "Branch featured students can be inserted by anyone" ON public.branch_featured_students FOR INSERT WITH CHECK (true);
CREATE POLICY "Branch featured students can be updated by anyone" ON public.branch_featured_students FOR UPDATE USING (true);
CREATE POLICY "Branch featured students can be deleted by anyone" ON public.branch_featured_students FOR DELETE USING (true);

CREATE TRIGGER update_branch_featured_students_updated_at
  BEFORE UPDATE ON public.branch_featured_students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
