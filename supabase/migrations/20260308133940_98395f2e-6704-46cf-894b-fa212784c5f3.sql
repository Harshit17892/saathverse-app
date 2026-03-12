
-- Startup Ideas table
CREATE TABLE public.startup_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  college_id uuid REFERENCES public.colleges(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  description text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'idea',
  looking_for text[] DEFAULT '{}',
  looking_for_mentor boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  ai_score numeric DEFAULT NULL,
  ai_clarity numeric DEFAULT NULL,
  ai_market numeric DEFAULT NULL,
  ai_feasibility numeric DEFAULT NULL,
  ai_innovation text DEFAULT NULL,
  ai_difficulty text DEFAULT NULL,
  ai_strengths text[] DEFAULT '{}',
  ai_risks text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view startup ideas" ON public.startup_ideas FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert own ideas" ON public.startup_ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON public.startup_ideas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON public.startup_ideas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Startup Members / Join Requests table
CREATE TABLE public.startup_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startup_ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  message text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(startup_id, user_id)
);

ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view startup members" ON public.startup_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can request to join" ON public.startup_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Founder or member can update membership" ON public.startup_members FOR UPDATE TO authenticated 
  USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT si.user_id FROM public.startup_ideas si WHERE si.id = startup_id)
  );
CREATE POLICY "Founder or member can delete membership" ON public.startup_members FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT si.user_id FROM public.startup_ideas si WHERE si.id = startup_id)
  );

-- Enable realtime for startup ideas
ALTER PUBLICATION supabase_realtime ADD TABLE public.startup_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.startup_members;
