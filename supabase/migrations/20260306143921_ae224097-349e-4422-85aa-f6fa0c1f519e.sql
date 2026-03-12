
-- HACKATHONS TABLE
CREATE TABLE public.hackathons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  date TEXT,
  end_date TEXT,
  location TEXT,
  participants INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  prize TEXT,
  status TEXT DEFAULT 'upcoming',
  tags TEXT[] DEFAULT '{}',
  gradient TEXT DEFAULT 'from-primary to-purple-400',
  icon TEXT DEFAULT 'globe',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hackathons viewable by everyone" ON public.hackathons FOR SELECT USING (true);
CREATE POLICY "Hackathons can be inserted by anyone" ON public.hackathons FOR INSERT WITH CHECK (true);
CREATE POLICY "Hackathons can be updated by anyone" ON public.hackathons FOR UPDATE USING (true);
CREATE POLICY "Hackathons can be deleted by anyone" ON public.hackathons FOR DELETE USING (true);

-- CLUBS TABLE
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'Technical',
  description TEXT,
  tagline TEXT,
  members INTEGER DEFAULT 0,
  founded INTEGER,
  next_event TEXT,
  next_event_price NUMERIC,
  banner_gradient TEXT DEFAULT 'from-blue-600/40 to-primary/30',
  logo_letter TEXT DEFAULT 'C',
  focus_tags TEXT[] DEFAULT '{}',
  advisor TEXT,
  instagram TEXT,
  linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clubs viewable by everyone" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Clubs can be inserted by anyone" ON public.clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "Clubs can be updated by anyone" ON public.clubs FOR UPDATE USING (true);
CREATE POLICY "Clubs can be deleted by anyone" ON public.clubs FOR DELETE USING (true);

-- ALUMNI TABLE
CREATE TABLE public.alumni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  batch TEXT,
  department TEXT,
  avatar TEXT DEFAULT 'AA',
  role TEXT,
  company TEXT,
  location TEXT,
  linkedin TEXT,
  specialization TEXT,
  achievements TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alumni viewable by everyone" ON public.alumni FOR SELECT USING (true);
CREATE POLICY "Alumni can be inserted by anyone" ON public.alumni FOR INSERT WITH CHECK (true);
CREATE POLICY "Alumni can be updated by anyone" ON public.alumni FOR UPDATE USING (true);
CREATE POLICY "Alumni can be deleted by anyone" ON public.alumni FOR DELETE USING (true);

-- IEEE MEMBERS TABLE
CREATE TABLE public.ieee_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  avatar TEXT DEFAULT 'AA',
  ieee_id TEXT,
  research_papers INTEGER DEFAULT 0,
  specialization TEXT,
  bio TEXT,
  linkedin TEXT,
  is_officer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ieee_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "IEEE members viewable by everyone" ON public.ieee_members FOR SELECT USING (true);
CREATE POLICY "IEEE members can be inserted by anyone" ON public.ieee_members FOR INSERT WITH CHECK (true);
CREATE POLICY "IEEE members can be updated by anyone" ON public.ieee_members FOR UPDATE USING (true);
CREATE POLICY "IEEE members can be deleted by anyone" ON public.ieee_members FOR DELETE USING (true);
