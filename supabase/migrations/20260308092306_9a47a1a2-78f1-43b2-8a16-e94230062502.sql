
CREATE TABLE public.ieee_carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  category text DEFAULT 'upcoming',
  hyperlink text,
  link_text text DEFAULT 'Learn More',
  college_id uuid REFERENCES public.colleges(id),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ieee_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ieee carousel slides" ON public.ieee_carousel FOR SELECT USING (true);
CREATE POLICY "Admins can manage ieee carousel slides" ON public.ieee_carousel FOR ALL USING (true) WITH CHECK (true);
