CREATE TABLE public.finance_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('receita','despesa')),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  category text NOT NULL DEFAULT 'Outros',
  description text,
  occurred_on date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_tx_user_date ON public.finance_transactions(user_id, occurred_on);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own select" ON public.finance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.finance_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.finance_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.finance_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER finance_tx_updated_at
BEFORE UPDATE ON public.finance_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();