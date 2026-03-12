
-- Startup group chat messages table
CREATE TABLE public.startup_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL REFERENCES public.startup_ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.startup_messages ENABLE ROW LEVEL SECURITY;

-- Function to check if user is an approved member or founder of a startup
CREATE OR REPLACE FUNCTION public.is_startup_member(_user_id uuid, _startup_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Founder
    SELECT 1 FROM public.startup_ideas WHERE id = _startup_id AND user_id = _user_id
    UNION ALL
    -- Approved member
    SELECT 1 FROM public.startup_members WHERE startup_id = _startup_id AND user_id = _user_id AND status = 'approved'
  )
$$;

-- SELECT: only approved members/founder can read
CREATE POLICY "Startup members can view messages"
ON public.startup_messages FOR SELECT TO authenticated
USING (public.is_startup_member(auth.uid(), startup_id));

-- INSERT: only approved members/founder can send
CREATE POLICY "Startup members can send messages"
ON public.startup_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_startup_member(auth.uid(), startup_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.startup_messages;
