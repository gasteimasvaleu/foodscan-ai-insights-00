ALTER TABLE public.subscribers
  DROP COLUMN IF EXISTS is_hotmart_managed,
  DROP COLUMN IF EXISTS hotmart_transaction_id,
  DROP COLUMN IF EXISTS stripe_customer_id;

ALTER TABLE public.registration_tokens
  DROP COLUMN IF EXISTS hotmart_transaction_id,
  DROP COLUMN IF EXISTS hotmart_product_id;