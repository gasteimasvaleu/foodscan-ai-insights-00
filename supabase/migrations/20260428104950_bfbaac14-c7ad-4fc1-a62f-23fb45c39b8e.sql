-- Tabela de listas de compras
CREATE TABLE public.shopping_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping lists"
  ON public.shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping lists"
  ON public.shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists"
  ON public.shopping_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists"
  ON public.shopping_lists FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de itens
CREATE TABLE public.shopping_list_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'un',
  category text NOT NULL DEFAULT 'outros',
  is_purchased boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping list items"
  ON public.shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping list items"
  ON public.shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping list items"
  ON public.shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping list items"
  ON public.shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_shopping_list_items_list_id ON public.shopping_list_items(list_id);
CREATE INDEX idx_shopping_lists_user_id ON public.shopping_lists(user_id);