
-- Add college_id to connections table
ALTER TABLE public.connections ADD COLUMN college_id uuid REFERENCES public.colleges(id);

-- Add college_id to messages table  
ALTER TABLE public.messages ADD COLUMN college_id uuid REFERENCES public.colleges(id);

-- Drop existing RLS policies on connections
DROP POLICY IF EXISTS "Users can delete own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can send connections" ON public.connections;
DROP POLICY IF EXISTS "Users can update received connections" ON public.connections;
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;

-- Recreate connections RLS with college_id isolation
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND (college_id IS NULL OR college_id = public.get_user_college_id(auth.uid()))
  );

CREATE POLICY "Users can send connections"
  ON public.connections FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND college_id = public.get_user_college_id(auth.uid())
  );

CREATE POLICY "Users can update received connections"
  ON public.connections FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = receiver_id
    AND (college_id IS NULL OR college_id = public.get_user_college_id(auth.uid()))
  );

CREATE POLICY "Users can delete own connections"
  ON public.connections FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND (college_id IS NULL OR college_id = public.get_user_college_id(auth.uid()))
  );

-- Drop existing RLS policies on messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON public.messages;

-- Recreate messages RLS with college_id isolation
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND (college_id IS NULL OR college_id = public.get_user_college_id(auth.uid()))
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND college_id = public.get_user_college_id(auth.uid())
  );

CREATE POLICY "Users can mark received messages as read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = receiver_id
    AND (college_id IS NULL OR college_id = public.get_user_college_id(auth.uid()))
  );
