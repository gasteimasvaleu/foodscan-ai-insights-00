-- Tabela de produtos de afiliado
CREATE TABLE public.affiliate_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  price NUMERIC,
  category TEXT NOT NULL,
  subcategory TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active affiliate products"
ON public.affiliate_products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all affiliate products"
ON public.affiliate_products
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert affiliate products"
ON public.affiliate_products
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update affiliate products"
ON public.affiliate_products
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete affiliate products"
ON public.affiliate_products
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_affiliate_products_updated_at
BEFORE UPDATE ON public.affiliate_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_affiliate_products_category ON public.affiliate_products(category);
CREATE INDEX idx_affiliate_products_created_at ON public.affiliate_products(created_at DESC);

-- Bucket de imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('affiliate-products', 'affiliate-products', true);

CREATE POLICY "Anyone can view affiliate product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'affiliate-products');

CREATE POLICY "Admins can upload affiliate product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'affiliate-products' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update affiliate product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'affiliate-products' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete affiliate product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'affiliate-products' AND has_role(auth.uid(), 'admin'::app_role));