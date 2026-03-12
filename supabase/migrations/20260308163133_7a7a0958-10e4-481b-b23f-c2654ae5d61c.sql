
-- Club members table
CREATE TABLE public.club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Member',
  avatar_initials text,
  added_by uuid,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  college_id uuid REFERENCES public.colleges(id),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members viewable by everyone" ON public.club_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert club members" ON public.club_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Club members can be updated by anyone" ON public.club_members FOR UPDATE USING (true);
CREATE POLICY "Club members can be deleted by anyone" ON public.club_members FOR DELETE USING (true);

-- Club join requests table
CREATE TYPE public.join_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.club_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  student_name text NOT NULL,
  student_roll text,
  message text,
  status public.join_request_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  college_id uuid REFERENCES public.colleges(id),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Join requests viewable by everyone" ON public.club_join_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert join requests" ON public.club_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Join requests can be updated" ON public.club_join_requests FOR UPDATE USING (true);
CREATE POLICY "Join requests can be deleted" ON public.club_join_requests FOR DELETE USING (true);

-- Club events table
CREATE TABLE public.club_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  date date,
  time text,
  location text,
  is_free boolean NOT NULL DEFAULT true,
  price numeric,
  total_spots integer NOT NULL DEFAULT 50,
  registered_count integer NOT NULL DEFAULT 0,
  banner_gradient text DEFAULT 'from-primary/50 to-accent/30',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  college_id uuid REFERENCES public.colleges(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club events viewable by everyone" ON public.club_events FOR SELECT USING (true);
CREATE POLICY "Club events can be inserted" ON public.club_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Club events can be updated" ON public.club_events FOR UPDATE USING (true);
CREATE POLICY "Club events can be deleted" ON public.club_events FOR DELETE USING (true);

-- Club event registrations table
CREATE TYPE public.payment_mode AS ENUM ('online', 'at_venue', 'free');

CREATE TABLE public.club_event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.club_events(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  student_name text NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  payment_mode public.payment_mode NOT NULL DEFAULT 'free',
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  college_id uuid REFERENCES public.colleges(id),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.club_event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registrations viewable by everyone" ON public.club_event_registrations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register" ON public.club_event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Registrations can be updated" ON public.club_event_registrations FOR UPDATE USING (true);
CREATE POLICY "Registrations can be deleted" ON public.club_event_registrations FOR DELETE USING (true);

-- Add is_active to clubs table
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
