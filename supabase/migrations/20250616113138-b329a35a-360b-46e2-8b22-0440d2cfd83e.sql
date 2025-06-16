
-- Habilitar Row Level Security nas tabelas
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_records ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_goals - usuários só podem ver suas próprias metas
CREATE POLICY "Users can view their own daily goals" 
  ON public.daily_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily goals" 
  ON public.daily_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals" 
  ON public.daily_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily goals" 
  ON public.daily_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para meal_records - usuários só podem ver suas próprias refeições
CREATE POLICY "Users can view their own meal records" 
  ON public.meal_records 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal records" 
  ON public.meal_records 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal records" 
  ON public.meal_records 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal records" 
  ON public.meal_records 
  FOR DELETE 
  USING (auth.uid() = user_id);
