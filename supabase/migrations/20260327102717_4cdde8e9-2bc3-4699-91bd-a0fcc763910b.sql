
CREATE OR REPLACE FUNCTION public.expire_overdue_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE subscribers
  SET subscribed = false, updated_at = now()
  WHERE subscribed = true
    AND subscription_end < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RAISE LOG 'Expired % subscriptions at %', expired_count, now();
END;
$$;
