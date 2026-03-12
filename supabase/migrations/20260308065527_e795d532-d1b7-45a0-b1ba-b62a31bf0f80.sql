
-- Create carousel_slides table for admin-managed showcase carousel
CREATE TABLE public.carousel_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'rocket',
  gradient text DEFAULT 'from-primary/50 to-accent/30',
  link text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- Permissive policies (matching existing pattern)
CREATE POLICY "Carousel slides viewable by everyone" ON public.carousel_slides FOR SELECT USING (true);
CREATE POLICY "Carousel slides can be inserted by anyone" ON public.carousel_slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Carousel slides can be updated by anyone" ON public.carousel_slides FOR UPDATE USING (true);
CREATE POLICY "Carousel slides can be deleted by anyone" ON public.carousel_slides FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.carousel_slides;
