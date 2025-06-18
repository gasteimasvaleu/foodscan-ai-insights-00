
-- Criar enum para as especialidades de nutrição
CREATE TYPE public.nutrition_specialty AS ENUM (
  'nutricao_clinica',
  'nutricao_esportiva', 
  'nutricao_funcional',
  'nutricao_estetica',
  'nutricao_materno_infantil',
  'nutricao_hospitalar',
  'nutricao_coletiva',
  'nutricao_saude_publica'
);

-- Criar tabela para anúncios de nutricionistas
CREATE TABLE public.nutritionist_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  specialty nutrition_specialty NOT NULL,
  phone_ddd TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  photo_url TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.nutritionist_ads ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública dos anúncios
CREATE POLICY "Anyone can view nutritionist ads" 
  ON public.nutritionist_ads 
  FOR SELECT 
  USING (true);

-- Política para usuários criarem seus próprios anúncios
CREATE POLICY "Users can create their own ads" 
  ON public.nutritionist_ads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios anúncios
CREATE POLICY "Users can update their own ads" 
  ON public.nutritionist_ads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários deletarem seus próprios anúncios
CREATE POLICY "Users can delete their own ads" 
  ON public.nutritionist_ads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar bucket para fotos dos anúncios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nutritionist-ads', 'nutritionist-ads', true);

-- Política para upload de arquivos
CREATE POLICY "Users can upload their own files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'nutritionist-ads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para visualização pública dos arquivos
CREATE POLICY "Anyone can view files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'nutritionist-ads');

-- Política para usuários atualizarem seus próprios arquivos
CREATE POLICY "Users can update their own files" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'nutritionist-ads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para usuários deletarem seus próprios arquivos
CREATE POLICY "Users can delete their own files" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'nutritionist-ads' AND auth.uid()::text = (storage.foldername(name))[1]);
