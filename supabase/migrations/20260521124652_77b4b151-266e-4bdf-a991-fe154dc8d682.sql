
CREATE OR REPLACE FUNCTION public.mf_order_log_after_delete_cleanup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.mf_entregas WHERE order_log_id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_mf_order_log_after_delete_cleanup ON public.mf_order_log;
CREATE TRIGGER trg_mf_order_log_after_delete_cleanup
AFTER DELETE ON public.mf_order_log
FOR EACH ROW
EXECUTE FUNCTION public.mf_order_log_after_delete_cleanup();
