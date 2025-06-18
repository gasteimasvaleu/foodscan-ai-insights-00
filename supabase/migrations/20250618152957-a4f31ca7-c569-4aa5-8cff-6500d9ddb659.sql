
-- Adicionar coluna para valor da consulta na tabela nutritionist_ads
ALTER TABLE public.nutritionist_ads 
ADD COLUMN consultation_price DECIMAL(10,2);

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.nutritionist_ads.consultation_price IS 'Valor da consulta em reais';
