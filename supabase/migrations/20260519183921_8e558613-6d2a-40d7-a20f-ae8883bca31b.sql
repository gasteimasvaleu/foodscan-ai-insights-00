CREATE OR REPLACE FUNCTION public.venues_enforce_owner_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count int;
BEGIN
  IF public.has_role(NEW.owner_id, 'admin') THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO _count FROM public.venues WHERE owner_id = NEW.owner_id;
  IF _count >= 3 THEN
    RAISE EXCEPTION 'venue_limit_reached: cada usuário pode cadastrar no máximo 3 venues';
  END IF;
  RETURN NEW;
END;
$$;