
CREATE TABLE public.discover_carousel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  gradient TEXT DEFAULT 'from-primary/30 to-accent/20',
  hyperlink TEXT,
  link_text TEXT DEFAULT 'Learn More',
  category TEXT DEFAULT 'featured',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discover_carousel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active discover carousel" ON public.discover_carousel
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage discover carousel" ON public.discover_carousel
  FOR ALL USING (true) WITH CHECK (true);
