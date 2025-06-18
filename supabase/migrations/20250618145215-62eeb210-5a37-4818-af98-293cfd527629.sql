
-- Verificar e corrigir as políticas RLS para user_menu_preferences
-- Primeiro, vamos remover as políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own menu preferences" ON public.user_menu_preferences;
DROP POLICY IF EXISTS "Users can create their own menu preferences" ON public.user_menu_preferences;
DROP POLICY IF EXISTS "Users can update their own menu preferences" ON public.user_menu_preferences;
DROP POLICY IF EXISTS "Users can delete their own menu preferences" ON public.user_menu_preferences;

-- Recriar as políticas RLS corretas
CREATE POLICY "Users can view their own menu preferences" 
  ON public.user_menu_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own menu preferences" 
  ON public.user_menu_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menu preferences" 
  ON public.user_menu_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menu preferences" 
  ON public.user_menu_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Garantir que a tabela tenha RLS habilitado
ALTER TABLE public.user_menu_preferences ENABLE ROW LEVEL SECURITY;
