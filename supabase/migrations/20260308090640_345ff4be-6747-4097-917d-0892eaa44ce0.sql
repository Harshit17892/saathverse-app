
CREATE TABLE public.hackathon_carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text DEFAULT NULL,
  category text DEFAULT 'upcoming',
  hyperlink text DEFAULT NULL,
  link_text text DEFAULT 'Learn More',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hackathon_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hackathon carousel slides"
  ON public.hackathon_carousel FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage hackathon carousel slides"
  ON public.hackathon_carousel FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
