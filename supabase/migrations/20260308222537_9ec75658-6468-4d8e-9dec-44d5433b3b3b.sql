
-- Create hackathon_teams table
CREATE TABLE public.hackathon_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  hackathon_id UUID REFERENCES public.hackathons(id) ON DELETE SET NULL,
  max_size INTEGER NOT NULL DEFAULT 4,
  looking_for TEXT[] DEFAULT '{}',
  gradient TEXT DEFAULT 'from-primary to-purple-400',
  created_by UUID NOT NULL,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hackathon_team_members table
CREATE TABLE public.hackathon_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for hackathon_teams
CREATE POLICY "Anyone authenticated can view teams" ON public.hackathon_teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create teams" ON public.hackathon_teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" ON public.hackathon_teams
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete their teams" ON public.hackathon_teams
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- RLS policies for hackathon_team_members
CREATE POLICY "Anyone authenticated can view team members" ON public.hackathon_team_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can request to join" ON public.hackathon_team_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team creators can update member status" ON public.hackathon_team_members
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.hackathon_teams 
      WHERE id = team_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Members can delete own membership" ON public.hackathon_team_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
