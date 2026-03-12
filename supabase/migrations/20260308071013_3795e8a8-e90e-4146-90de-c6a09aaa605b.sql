
-- ============ MULTI-TENANCY SCHEMA ============

-- 1. Colleges table
CREATE TABLE public.colleges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  logo_url text,
  city text,
  state text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colleges viewable by everyone" ON public.colleges FOR SELECT USING (true);

-- 2. Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  full_name text,
  branch text,
  year_of_study text,
  skills text[] DEFAULT '{}',
  photo_url text,
  bio text,
  is_alumni boolean DEFAULT false,
  hackathon_interest boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own college profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3. User roles table (per instructions - separate table)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- 4. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Function to get user's college_id
CREATE OR REPLACE FUNCTION public.get_user_college_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT college_id FROM public.profiles
  WHERE user_id = _user_id LIMIT 1
$$;

-- 6. Add college_id to ALL existing tables
ALTER TABLE public.branches ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.students ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.achievements ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.announcements ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.hackathons ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.clubs ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.alumni ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.ieee_members ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;
ALTER TABLE public.carousel_slides ADD COLUMN college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE;

-- 7. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _college_id uuid;
BEGIN
  -- Try to find college by email domain
  SELECT id INTO _college_id FROM public.colleges
  WHERE domain = split_part(NEW.email, '@', 2)
  LIMIT 1;

  INSERT INTO public.profiles (user_id, college_id, full_name)
  VALUES (NEW.id, COALESCE(_college_id, (NEW.raw_user_meta_data->>'college_id')::uuid), COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Seed a demo college
INSERT INTO public.colleges (name, domain, city, state)
VALUES ('Demo College', 'demo.edu', 'Demo City', 'Demo State');

-- 9. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.colleges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
