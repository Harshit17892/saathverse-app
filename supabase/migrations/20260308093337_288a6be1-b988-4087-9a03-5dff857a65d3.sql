
CREATE TABLE public.ieee_conferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  conference_type TEXT DEFAULT 'conference',
  date TEXT,
  end_date TEXT,
  location TEXT,
  hyperlink TEXT,
  college_id UUID REFERENCES public.colleges(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ieee_conferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ieee conferences" ON public.ieee_conferences FOR SELECT USING (true);
CREATE POLICY "Admins can manage ieee conferences" ON public.ieee_conferences FOR ALL USING (true) WITH CHECK (true);
