-- Create workout_plans table
CREATE TABLE public.workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout plans"
  ON public.workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout plans"
  ON public.workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout plans"
  ON public.workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout plans"
  ON public.workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for workout_plans updated_at
CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create physical_assessments table
CREATE TABLE public.physical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  waist NUMERIC(5,2),
  neck NUMERIC(5,2),
  body_fat_percentage NUMERIC(5,2),
  lean_mass NUMERIC(5,2),
  fat_mass NUMERIC(5,2),
  before_photo_url TEXT,
  after_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own physical assessments"
  ON public.physical_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own physical assessments"
  ON public.physical_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own physical assessments"
  ON public.physical_assessments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own physical assessments"
  ON public.physical_assessments FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for physical_assessments updated_at
CREATE TRIGGER update_physical_assessments_updated_at
  BEFORE UPDATE ON public.physical_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_custom_diets table
CREATE TABLE public.user_custom_diets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  description TEXT,
  foods JSONB DEFAULT '[]',
  total_calories INTEGER DEFAULT 0,
  total_proteins NUMERIC(5,2) DEFAULT 0,
  total_carbs NUMERIC(5,2) DEFAULT 0,
  total_fats NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_custom_diets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom diets"
  ON public.user_custom_diets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom diets"
  ON public.user_custom_diets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom diets"
  ON public.user_custom_diets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom diets"
  ON public.user_custom_diets FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for user_custom_diets updated_at
CREATE TRIGGER update_user_custom_diets_updated_at
  BEFORE UPDATE ON public.user_custom_diets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for assessment photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assessments', 'assessments', true);

-- Storage policies for assessments bucket
CREATE POLICY "Users can upload assessment photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assessments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update assessment photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'assessments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete assessment photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assessments' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view assessment photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assessments');