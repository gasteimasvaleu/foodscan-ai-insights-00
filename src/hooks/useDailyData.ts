
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DailyGoal, MealRecord } from '@/types/daily-control';

export const useDailyData = (user: any) => {
  const [goals, setGoals] = useState<DailyGoal | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Carregar metas do usuário
      const { data: goalsData, error: goalsError } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (goalsError && goalsError.code !== 'PGRST116') {
        console.error('Erro ao carregar metas:', goalsError);
      } else if (goalsData) {
        setGoals(goalsData);
      }

      // Carregar refeições do dia
      const today = new Date().toISOString().split('T')[0];
      const { data: mealsData, error: mealsError } = await supabase
        .from('meal_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (mealsError) {
        console.error('Erro ao carregar refeições:', mealsError);
      } else {
        setMeals(mealsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  return { goals, setGoals, meals, isLoading, loadUserData };
};
