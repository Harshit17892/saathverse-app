CREATE TABLE public.spotlight_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  hyperlink TEXT,
  link_text TEXT DEFAULT 'Learn More',
  gradient TEXT DEFAULT 'from-primary to-accent',
  category TEXT DEFAULT 'featured',
  is_active BOOLEAN DEFAULT true,
  carousel_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.spotlight_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active spotlight slides"
  ON public.spotlight_carousel FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage spotlight slides"
  ON public.spotlight_carousel FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_college_role(college_id, 'college_admin', auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_college_role(college_id, 'college_admin', auth.uid()));