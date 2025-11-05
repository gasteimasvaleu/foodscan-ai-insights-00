-- Adicionar UNIQUE constraint no user_id da tabela subscribers
-- Isso garante que cada usuário só possa ter uma assinatura
ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);

-- Criar índice para performance (se não existir via constraint)
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id 
ON public.subscribers(user_id);

-- Adicionar comentário para documentação
COMMENT ON CONSTRAINT subscribers_user_id_unique ON public.subscribers 
IS 'Garante que cada usuário só pode ter uma assinatura ativa';