
CREATE TABLE public.homepage_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  storage_path text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.homepage_banners
FOR SELECT
TO public
USING (is_active = true);

-- Only admins can insert banners
CREATE POLICY "Only admins can insert banners"
ON public.homepage_banners
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update banners
CREATE POLICY "Only admins can update banners"
ON public.homepage_banners
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete banners
CREATE POLICY "Only admins can delete banners"
ON public.homepage_banners
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
