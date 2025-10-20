-- 1. Criar tabela registration_tokens
CREATE TABLE IF NOT EXISTS public.registration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  hotmart_transaction_id TEXT UNIQUE NOT NULL,
  hotmart_product_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  plan_months INTEGER NOT NULL,
  subscription_end TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE NOT NULL,
  used_at TIMESTAMPTZ,
  created_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_registration_tokens_token ON public.registration_tokens(token);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_email ON public.registration_tokens(email);
CREATE INDEX IF NOT EXISTS idx_registration_tokens_hotmart_tx ON public.registration_tokens(hotmart_transaction_id);

-- Habilitar RLS
ALTER TABLE public.registration_tokens ENABLE ROW LEVEL SECURITY;

-- RLS: Qualquer um pode ler tokens válidos (necessário para validação pública)
CREATE POLICY "Anyone can read valid tokens" 
  ON public.registration_tokens 
  FOR SELECT 
  USING (is_used = FALSE AND expires_at > NOW());

-- 2. Adicionar colunas em subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS payment_provider TEXT 
CHECK (payment_provider IN ('stripe', 'hotmart'));

ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS hotmart_transaction_id TEXT UNIQUE;

-- Índice para busca rápida por transaction ID
CREATE INDEX IF NOT EXISTS idx_subscribers_hotmart_tx 
ON public.subscribers(hotmart_transaction_id);

-- Comentários para documentação
COMMENT ON COLUMN public.subscribers.payment_provider IS 'Provedor de pagamento: stripe ou hotmart';
COMMENT ON COLUMN public.subscribers.hotmart_transaction_id IS 'ID único da transação Hotmart (apenas para pagamentos via Hotmart)';