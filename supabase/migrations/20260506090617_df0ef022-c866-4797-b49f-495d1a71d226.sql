CREATE TABLE public.daily_usage_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, usage_date)
);

CREATE INDEX idx_daily_usage_limits_lookup
  ON public.daily_usage_limits (user_id, feature, usage_date);

ALTER TABLE public.daily_usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own usage"
  ON public.daily_usage_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own usage"
  ON public.daily_usage_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own usage"
  ON public.daily_usage_limits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own usage"
  ON public.daily_usage_limits FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_usage_limits_updated_at
  BEFORE UPDATE ON public.daily_usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();