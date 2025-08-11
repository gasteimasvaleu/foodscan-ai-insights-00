-- Create exercise_records table
CREATE TABLE public.exercise_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('Leve', 'Moderada', 'Intensa')),
  calories_burned NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calorie_adjustments table
CREATE TABLE public.calorie_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_record_id UUID NOT NULL,
  adjustment_amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calorie_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policies for exercise_records
CREATE POLICY "Users can view their own exercise records" 
ON public.exercise_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise records" 
ON public.exercise_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise records" 
ON public.exercise_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise records" 
ON public.exercise_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for calorie_adjustments
CREATE POLICY "Users can view their own calorie adjustments" 
ON public.calorie_adjustments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calorie adjustments" 
ON public.calorie_adjustments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calorie adjustments" 
ON public.calorie_adjustments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calorie adjustments" 
ON public.calorie_adjustments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraint
ALTER TABLE public.calorie_adjustments 
ADD CONSTRAINT fk_exercise_record 
FOREIGN KEY (exercise_record_id) REFERENCES public.exercise_records(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates on exercise_records
CREATE TRIGGER update_exercise_records_updated_at
BEFORE UPDATE ON public.exercise_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_exercise_records_user_date ON public.exercise_records(user_id, date DESC);
CREATE INDEX idx_calorie_adjustments_user_date ON public.calorie_adjustments(user_id, date DESC);