
CREATE TABLE public.chat_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  messages_used INTEGER NOT NULL DEFAULT 0,
  bonus_messages INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.chat_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat limits" ON public.chat_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat limits" ON public.chat_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat limits" ON public.chat_limits FOR UPDATE USING (auth.uid() = user_id);
