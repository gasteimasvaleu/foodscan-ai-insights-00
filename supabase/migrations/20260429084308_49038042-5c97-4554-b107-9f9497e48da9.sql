-- Extensão para busca fuzzy por nome
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================
-- favorite_meals
-- =========================
CREATE TABLE public.favorite_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  food_name text NOT NULL,
  portion text NOT NULL,
  calories integer NOT NULL,
  proteins numeric NOT NULL DEFAULT 0,
  carbohydrates numeric NOT NULL DEFAULT 0,
  fats numeric NOT NULL DEFAULT 0,
  meal_type text,
  image_url text,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.favorite_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorite meals" ON public.favorite_meals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorite meals" ON public.favorite_meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorite meals" ON public.favorite_meals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite meals" ON public.favorite_meals
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_favorite_meals_user ON public.favorite_meals(user_id, last_used_at DESC NULLS LAST);

CREATE TRIGGER update_favorite_meals_updated_at
  BEFORE UPDATE ON public.favorite_meals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- food_catalog (público para leitura, admin para escrita)
-- =========================
CREATE TABLE public.food_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  calories_per_100g numeric NOT NULL,
  proteins_per_100g numeric NOT NULL DEFAULT 0,
  carbs_per_100g numeric NOT NULL DEFAULT 0,
  fats_per_100g numeric NOT NULL DEFAULT 0,
  common_portion_g numeric NOT NULL DEFAULT 100,
  common_portion_label text NOT NULL DEFAULT '100g',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.food_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active foods" ON public.food_catalog
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert foods" ON public.food_catalog
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update foods" ON public.food_catalog
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete foods" ON public.food_catalog
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_food_catalog_name_trgm ON public.food_catalog USING gin (name gin_trgm_ops);
CREATE INDEX idx_food_catalog_category ON public.food_catalog(category) WHERE is_active = true;

CREATE TRIGGER update_food_catalog_updated_at
  BEFORE UPDATE ON public.food_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- user_recipes
-- =========================
CREATE TABLE public.user_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  servings integer NOT NULL DEFAULT 1,
  calories_per_serving integer NOT NULL DEFAULT 0,
  proteins_per_serving numeric NOT NULL DEFAULT 0,
  carbs_per_serving numeric NOT NULL DEFAULT 0,
  fats_per_serving numeric NOT NULL DEFAULT 0,
  image_url text,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON public.user_recipes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recipes" ON public.user_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON public.user_recipes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON public.user_recipes
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_recipes_user ON public.user_recipes(user_id, last_used_at DESC NULLS LAST);

CREATE TRIGGER update_user_recipes_updated_at
  BEFORE UPDATE ON public.user_recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();