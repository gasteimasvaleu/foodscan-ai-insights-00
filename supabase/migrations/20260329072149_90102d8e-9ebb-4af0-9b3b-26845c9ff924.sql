-- 1. Drop the restrictive check constraint on payment_provider
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_payment_provider_check;

-- 2. Add new columns for the orphan-claim flow
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS transaction_id text;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS product_source text;

-- 3. Index for orphan claim by transaction_id
CREATE INDEX IF NOT EXISTS idx_subscribers_transaction_id ON public.subscribers (transaction_id) WHERE transaction_id IS NOT NULL;

-- 4. Index for orphan claim by email where user_id is null
CREATE INDEX IF NOT EXISTS idx_subscribers_orphan_email ON public.subscribers (email) WHERE user_id IS NULL;