
-- Create table for user menu preferences
CREATE TABLE public.user_menu_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  favorite_ingredients TEXT NOT NULL,
  specific_requirements TEXT,
  max_calories INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to ensure one preference per user
ALTER TABLE public.user_menu_preferences 
ADD CONSTRAINT unique_user_preferences UNIQUE (user_id);

-- Enable Row Level Security
ALTER TABLE public.user_menu_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create table for storing generated menu plans
CREATE TABLE public.user_menu_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  menu_data JSONB NOT NULL,
  preferences_snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_menu_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for menu plans
CREATE POLICY "Users can view their own menu plans" 
  ON public.user_menu_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own menu plans" 
  ON public.user_menu_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menu plans" 
  ON public.user_menu_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);
