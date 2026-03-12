
-- Create connections table for student-to-student connection requests
CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own connections
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send connection requests
CREATE POLICY "Users can send connections"
  ON public.connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can update connections they received (accept/decline)
CREATE POLICY "Users can update received connections"
  ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete own connections"
  ON public.connections FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
