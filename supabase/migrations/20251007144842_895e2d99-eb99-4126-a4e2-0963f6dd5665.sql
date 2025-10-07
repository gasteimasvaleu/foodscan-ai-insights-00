-- Adicionar coluna para múltiplas especialidades
ALTER TABLE public.nutritionist_ads 
ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}';

-- Migrar dados existentes (copiar specialty atual para o array)
UPDATE public.nutritionist_ads 
SET specialties = ARRAY[specialty::text]
WHERE specialty IS NOT NULL AND (specialties IS NULL OR specialties = '{}');

-- Criar políticas RLS para o storage bucket nutritionist-ads
-- Drop policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can upload to nutritionist-ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view nutritionist-ads" ON storage.objects;

CREATE POLICY "Anyone can upload to nutritionist-ads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'nutritionist-ads');

CREATE POLICY "Anyone can view nutritionist-ads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'nutritionist-ads');

-- Criar índice GIN para melhor performance em buscas de array
CREATE INDEX IF NOT EXISTS idx_nutritionist_ads_specialties 
ON public.nutritionist_ads USING GIN (specialties);