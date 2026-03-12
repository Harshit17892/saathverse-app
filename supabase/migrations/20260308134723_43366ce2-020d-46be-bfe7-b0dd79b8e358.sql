
CREATE TABLE public.startup_carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES public.colleges(id),
  title text NOT NULL,
  description text DEFAULT NULL,
  image_url text DEFAULT NULL,
  category text DEFAULT 'featured',
  hyperlink text DEFAULT NULL,
  link_text text DEFAULT 'Learn More',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active startup carousel" ON public.startup_carousel FOR SELECT USING (true);
CREATE POLICY "Admins can manage startup carousel" ON public.startup_carousel FOR ALL TO authenticated USING (true) WITH CHECK (true);
