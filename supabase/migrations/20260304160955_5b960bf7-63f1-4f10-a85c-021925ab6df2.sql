
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==================== BRANCHES ====================
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'code',
  color TEXT DEFAULT 'from-primary to-accent',
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branches are viewable by everyone" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Branches can be inserted by anyone" ON public.branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Branches can be updated by anyone" ON public.branches FOR UPDATE USING (true);
CREATE POLICY "Branches can be deleted by anyone" ON public.branches FOR DELETE USING (true);

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== STUDENTS (profiles) ====================
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  graduation_year INTEGER,
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  xp_points INTEGER DEFAULT 0,
  is_topper BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'alumni')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students are viewable by everyone" ON public.students FOR SELECT USING (true);
CREATE POLICY "Students can be inserted by anyone" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Students can be updated by anyone" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Students can be deleted by anyone" ON public.students FOR DELETE USING (true);

CREATE INDEX idx_students_branch ON public.students(branch_id);
CREATE INDEX idx_students_status ON public.students(status);

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== EVENTS ====================
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('hackathon', 'workshop', 'seminar', 'fest', 'general')),
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  attendee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events can be inserted by anyone" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Events can be updated by anyone" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Events can be deleted by anyone" ON public.events FOR DELETE USING (true);

CREATE INDEX idx_events_branch ON public.events(branch_id);
CREATE INDEX idx_events_status ON public.events(status);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== ACHIEVEMENTS ====================
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  achievement_type TEXT DEFAULT 'general' CHECK (achievement_type IN ('hackathon', 'academic', 'research', 'sports', 'cultural', 'general')),
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  badge_icon TEXT DEFAULT 'trophy',
  badge_color TEXT DEFAULT 'from-amber-500 to-yellow-400',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Achievements can be inserted by anyone" ON public.achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Achievements can be updated by anyone" ON public.achievements FOR UPDATE USING (true);
CREATE POLICY "Achievements can be deleted by anyone" ON public.achievements FOR DELETE USING (true);

CREATE INDEX idx_achievements_student ON public.achievements(student_id);

-- ==================== ANNOUNCEMENTS ====================
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Announcements can be inserted by anyone" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Announcements can be updated by anyone" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Announcements can be deleted by anyone" ON public.announcements FOR DELETE USING (true);

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
