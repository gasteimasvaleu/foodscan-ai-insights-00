-- Permitir admins fazerem upload no bucket criativos
CREATE POLICY "Admins can upload to criativos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'criativos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Permitir admins deletarem do bucket criativos  
CREATE POLICY "Admins can delete from criativos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'criativos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);