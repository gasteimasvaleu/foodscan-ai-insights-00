
CREATE OR REPLACE FUNCTION public.normalize_food_name(_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  s text;
BEGIN
  IF _name IS NULL THEN RETURN NULL; END IF;
  s := lower(unaccent(_name));
  s := regexp_replace(s, '[0-9]+([.,][0-9]+)?', ' ', 'g');
  s := regexp_replace(
    s,
    '\m(g|kg|mg|ml|l|un|und|unidade|unidades|fatia|fatias|colher|colheres|prato|pratos|porcao|porcoes|copo|copos|xicara|xicaras|pote|potes|concha|conchas|pedaco|pedacos|de|do|da|com|sem|aprox|aproximadamente)\M',
    ' ',
    'g'
  );
  s := regexp_replace(s, '\s+', ' ', 'g');
  s := btrim(s);
  RETURN s;
END;
$$;
