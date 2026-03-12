
-- User gamification profile
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  total_logins INTEGER NOT NULL DEFAULT 0,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- XP transaction log
CREATE TABLE public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rewards store
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  xp_cost INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'coupon',
  icon TEXT DEFAULT 'gift',
  coupon_code TEXT,
  total_quantity INTEGER,
  remaining_quantity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reward redemptions
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  xp_spent INTEGER NOT NULL,
  coupon_code TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- user_gamification policies
CREATE POLICY "Users can view all gamification profiles" ON public.user_gamification
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own gamification" ON public.user_gamification
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON public.user_gamification
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- xp_transactions policies
CREATE POLICY "Users can view own xp transactions" ON public.xp_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp transactions" ON public.xp_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- rewards policies (public read)
CREATE POLICY "Anyone can view active rewards" ON public.rewards
  FOR SELECT TO authenticated USING (is_active = true);

-- reward_redemptions policies
CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards" ON public.reward_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT GREATEST(1, FLOOR(SQRT(xp_amount::FLOAT / 100))::INTEGER + 1);
$$;

-- Function to award XP
CREATE OR REPLACE FUNCTION public.award_xp(
  _user_id UUID,
  _amount INTEGER,
  _action TEXT,
  _description TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
  today DATE := CURRENT_DATE;
  last_date DATE;
  cur_streak INTEGER;
BEGIN
  -- Upsert gamification record
  INSERT INTO user_gamification (user_id, xp, level, last_active_date, current_streak, longest_streak, total_logins)
  VALUES (_user_id, _amount, calculate_level(_amount), today, 1, 1, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    xp = user_gamification.xp + _amount,
    level = calculate_level(user_gamification.xp + _amount),
    updated_at = now();

  -- Log transaction
  INSERT INTO xp_transactions (user_id, amount, action, description)
  VALUES (_user_id, _amount, _action, _description);
END;
$$;

-- Function to update streak on login
CREATE OR REPLACE FUNCTION public.update_login_streak(_user_id UUID)
RETURNS TABLE(current_streak INTEGER, xp_earned INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  last_date DATE;
  cur_streak INTEGER;
  longest INTEGER;
  bonus INTEGER := 0;
BEGIN
  SELECT g.last_active_date, g.current_streak, g.longest_streak
  INTO last_date, cur_streak, longest
  FROM user_gamification g WHERE g.user_id = _user_id;

  IF NOT FOUND THEN
    INSERT INTO user_gamification (user_id, xp, level, last_active_date, current_streak, longest_streak, total_logins)
    VALUES (_user_id, 10, 1, today, 1, 1, 1);
    INSERT INTO xp_transactions (user_id, amount, action, description) VALUES (_user_id, 10, 'daily_login', 'First login bonus');
    current_streak := 1;
    xp_earned := 10;
    RETURN NEXT;
    RETURN;
  END IF;

  IF last_date = today THEN
    current_streak := cur_streak;
    xp_earned := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  IF last_date = today - 1 THEN
    cur_streak := cur_streak + 1;
  ELSE
    cur_streak := 1;
  END IF;

  IF cur_streak > longest THEN
    longest := cur_streak;
  END IF;

  -- Streak bonus: 10 base + 5 per streak day (max 50)
  bonus := LEAST(10 + (cur_streak - 1) * 5, 50);

  UPDATE user_gamification SET
    last_active_date = today,
    current_streak = cur_streak,
    longest_streak = longest,
    total_logins = total_logins + 1,
    xp = xp + bonus,
    level = calculate_level(xp + bonus),
    updated_at = now()
  WHERE user_gamification.user_id = _user_id;

  INSERT INTO xp_transactions (user_id, amount, action, description)
  VALUES (_user_id, bonus, 'daily_login', 'Day ' || cur_streak || ' streak bonus');

  current_streak := cur_streak;
  xp_earned := bonus;
  RETURN NEXT;
END;
$$;
