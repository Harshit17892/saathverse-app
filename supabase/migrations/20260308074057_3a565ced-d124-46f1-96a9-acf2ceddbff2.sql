
-- Add company and company_type columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_type text;

-- Create form_settings table for admin form configuration
CREATE TABLE IF NOT EXISTS public.form_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid REFERENCES public.colleges(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(college_id, setting_key)
);

ALTER TABLE public.form_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form settings viewable by everyone" ON public.form_settings FOR SELECT USING (true);
CREATE POLICY "Form settings can be inserted by anyone" ON public.form_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Form settings can be updated by anyone" ON public.form_settings FOR UPDATE USING (true);
CREATE POLICY "Form settings can be deleted by anyone" ON public.form_settings FOR DELETE USING (true);

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 1048576)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update their avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Users can delete their avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
