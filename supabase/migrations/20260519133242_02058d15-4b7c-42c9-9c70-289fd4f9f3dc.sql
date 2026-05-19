CREATE OR REPLACE FUNCTION public.venues_enforce_owner_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _count int;
BEGIN
  SELECT count(*) INTO _count FROM public.venues WHERE owner_id = NEW.owner_id;
  IF _count >= 3 THEN
    RAISE EXCEPTION 'venue_limit_reached: cada usuário pode cadastrar no máximo 3 venues';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS venues_enforce_owner_limit_trg ON public.venues;
CREATE TRIGGER venues_enforce_owner_limit_trg
BEFORE INSERT ON public.venues
FOR EACH ROW EXECUTE FUNCTION public.venues_enforce_owner_limit();