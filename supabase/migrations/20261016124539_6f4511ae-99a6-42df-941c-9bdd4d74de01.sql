DROP POLICY IF EXISTS insert_subscription ON public.subscribers;
DROP POLICY IF EXISTS update_own_subscription ON public.subscribers;
DROP POLICY IF EXISTS select_own_subscription ON public.subscribers;
CREATE POLICY select_own_subscription ON public.subscribers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY admin_manage_subscriptions ON public.subscribers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_transaction_id_unique
  ON public.subscribers (transaction_id) WHERE transaction_id IS NOT NULL;

DROP POLICY IF EXISTS "Users insert their own usage" ON public.daily_usage_limits;
DROP POLICY IF EXISTS "Users update their own usage" ON public.daily_usage_limits;
DROP POLICY IF EXISTS "Users delete their own usage" ON public.daily_usage_limits;

UPDATE public.subscribers SET subscribed = true, subscription_status = 'active', subscription_tier = 'Premium',
  subscription_end = '2099-12-31 23:59:59+00', payment_provider = 'manual', product_source = 'lifetime',
  transaction_id = 'lifetime_owner', updated_at = now()
WHERE lower(email) = 'admin@wediet.app';