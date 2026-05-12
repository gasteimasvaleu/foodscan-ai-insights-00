
-- Extensions
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1) food_catalog: novas colunas
ALTER TABLE public.food_catalog
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'official',
  ADD COLUMN IF NOT EXISTS community_suggestion_id uuid;

-- 2) Tabela de sugestões
CREATE TABLE IF NOT EXISTS public.food_catalog_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_normalized text NOT NULL UNIQUE,
  display_name text NOT NULL,
  category text NOT NULL DEFAULT 'preparacoes',
  calories_per_100g numeric NOT NULL DEFAULT 0,
  proteins_per_100g numeric NOT NULL DEFAULT 0,
  carbs_per_100g numeric NOT NULL DEFAULT 0,
  fats_per_100g numeric NOT NULL DEFAULT 0,
  submissions_count integer NOT NULL DEFAULT 0,
  distinct_users_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  promoted_food_id uuid,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_catalog_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view suggestions"
  ON public.food_catalog_suggestions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update suggestions"
  ON public.food_catalog_suggestions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete suggestions"
  ON public.food_catalog_suggestions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) Submissões (par único por sugestão+usuário)
CREATE TABLE IF NOT EXISTS public.food_catalog_suggestion_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid NOT NULL REFERENCES public.food_catalog_suggestions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (suggestion_id, user_id)
);

ALTER TABLE public.food_catalog_suggestion_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view submissions"
  ON public.food_catalog_suggestion_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4) Função de normalização
CREATE OR REPLACE FUNCTION public.normalize_food_name(_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  s text;
BEGIN
  IF _name IS NULL THEN RETURN NULL; END IF;
  s := lower(unaccent(_name));
  -- remove dígitos e separadores numéricos
  s := regexp_replace(s, '[0-9]+([.,][0-9]+)?', ' ', 'g');
  -- remove unidades e palavras de quantidade comuns
  s := regexp_replace(
    s,
    '\m(g|kg|mg|ml|l|un|und|unidade|unidades|fatia|fatias|colher|colheres|prato|pratos|porcao|porcoes|copo|copos|xicara|xicaras|pote|potes|concha|conchas|pedaco|pedacos|de|do|da|com|sem|aprox|aproximadamente)\M',
    ' ',
    'g'
  );
  -- colapsa espaços
  s := regexp_replace(s, '\s+', ' ', 'g');
  s := btrim(s);
  RETURN s;
END;
$$;

-- 5) Função de ingestão (chamada pelo trigger)
CREATE OR REPLACE FUNCTION public.ingest_meal_to_catalog()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _threshold constant int := 3;
  _normalized text;
  _grams numeric;
  _portion_text text;
  _kcal_100 numeric;
  _prot_100 numeric;
  _carbs_100 numeric;
  _fats_100 numeric;
  _suggestion public.food_catalog_suggestions%ROWTYPE;
  _new_food_id uuid;
  _bad text;
BEGIN
  -- Não processa se faltar dado essencial
  IF NEW.user_id IS NULL OR NEW.food_name IS NULL OR NEW.calories IS NULL THEN
    RETURN NEW;
  END IF;

  _normalized := public.normalize_food_name(NEW.food_name);
  IF _normalized IS NULL OR length(_normalized) < 3 OR length(_normalized) > 60 THEN
    RETURN NEW;
  END IF;

  -- Filtro de palavrões
  SELECT word INTO _bad
  FROM public.chat_banned_words
  WHERE severity = 'block'
    AND _normalized ~* ('\m' || word || '\M')
  LIMIT 1;
  IF _bad IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Estima gramas a partir de NEW.portion (regex pega primeiro número, opcionalmente seguido de g/ml)
  _portion_text := lower(coalesce(NEW.portion, ''));
  SELECT (regexp_match(_portion_text, '([0-9]+([.,][0-9]+)?)\s*(g|ml|gramas?|mililitros?)?'))[1]
    INTO _portion_text;
  IF _portion_text IS NULL THEN
    RETURN NEW;
  END IF;
  _grams := replace(_portion_text, ',', '.')::numeric;
  IF _grams IS NULL OR _grams < 5 OR _grams > 2000 THEN
    RETURN NEW;
  END IF;

  -- Macros normalizados por 100g
  _kcal_100 := (NEW.calories::numeric * 100.0) / _grams;
  _prot_100 := (coalesce(NEW.proteins, 0)::numeric * 100.0) / _grams;
  _carbs_100 := (coalesce(NEW.carbohydrates, 0)::numeric * 100.0) / _grams;
  _fats_100 := (coalesce(NEW.fats, 0)::numeric * 100.0) / _grams;

  -- Outliers
  IF _kcal_100 < 0 OR _kcal_100 > 900 THEN
    RETURN NEW;
  END IF;

  -- Upsert na sugestão (média móvel ponderada)
  INSERT INTO public.food_catalog_suggestions AS s (
    name_normalized, display_name,
    calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g,
    submissions_count, last_seen_at
  ) VALUES (
    _normalized, btrim(NEW.food_name),
    _kcal_100, _prot_100, _carbs_100, _fats_100,
    1, now()
  )
  ON CONFLICT (name_normalized) DO UPDATE
  SET
    calories_per_100g = (s.calories_per_100g * s.submissions_count + EXCLUDED.calories_per_100g) / (s.submissions_count + 1),
    proteins_per_100g = (s.proteins_per_100g * s.submissions_count + EXCLUDED.proteins_per_100g) / (s.submissions_count + 1),
    carbs_per_100g    = (s.carbs_per_100g    * s.submissions_count + EXCLUDED.carbs_per_100g)    / (s.submissions_count + 1),
    fats_per_100g     = (s.fats_per_100g     * s.submissions_count + EXCLUDED.fats_per_100g)     / (s.submissions_count + 1),
    submissions_count = s.submissions_count + 1,
    last_seen_at = now(),
    updated_at = now()
  RETURNING * INTO _suggestion;

  -- Registra par (sugestão, usuário) e recalcula distinct_users_count
  INSERT INTO public.food_catalog_suggestion_submissions (suggestion_id, user_id)
  VALUES (_suggestion.id, NEW.user_id)
  ON CONFLICT (suggestion_id, user_id) DO NOTHING;

  UPDATE public.food_catalog_suggestions
  SET distinct_users_count = (
    SELECT count(*) FROM public.food_catalog_suggestion_submissions
    WHERE suggestion_id = _suggestion.id
  ),
  updated_at = now()
  WHERE id = _suggestion.id
  RETURNING * INTO _suggestion;

  -- Promoção
  IF _suggestion.status = 'pending' AND _suggestion.distinct_users_count >= _threshold THEN
    INSERT INTO public.food_catalog (
      name, category,
      calories_per_100g, proteins_per_100g, carbs_per_100g, fats_per_100g,
      common_portion_g, common_portion_label,
      is_active, source, community_suggestion_id
    ) VALUES (
      _suggestion.display_name,
      _suggestion.category,
      round(_suggestion.calories_per_100g, 2),
      round(_suggestion.proteins_per_100g, 2),
      round(_suggestion.carbs_per_100g, 2),
      round(_suggestion.fats_per_100g, 2),
      100, '100g',
      true, 'community', _suggestion.id
    )
    RETURNING id INTO _new_food_id;

    UPDATE public.food_catalog_suggestions
    SET status = 'approved', promoted_food_id = _new_food_id, updated_at = now()
    WHERE id = _suggestion.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebra o INSERT do meal_record
  RAISE LOG 'ingest_meal_to_catalog falhou: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 6) Trigger
DROP TRIGGER IF EXISTS trg_meal_records_ingest ON public.meal_records;
CREATE TRIGGER trg_meal_records_ingest
AFTER INSERT ON public.meal_records
FOR EACH ROW EXECUTE FUNCTION public.ingest_meal_to_catalog();

-- 7) Index úteis
CREATE INDEX IF NOT EXISTS idx_food_catalog_suggestions_status ON public.food_catalog_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_food_catalog_suggestions_distinct ON public.food_catalog_suggestions(distinct_users_count DESC);
