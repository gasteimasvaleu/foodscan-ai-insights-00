import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfWeek, endOfWeek, format, parseISO, startOfDay, endOfDay } from 'date-fns';

export interface UserObjective {
  id: string;
  user_id: string;
  objective_key: string;
  target_value: number;
  target_unit: string;
  is_active: boolean;
  custom_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveProgress {
  objective: UserObjective;
  currentValue: number;
  targetValue: number;
  isWithinGoal: boolean;
  label: string;
  description: string;
}

export const OBJECTIVE_CATALOG = {
  limit_snacks: {
    label: 'Limitar Lanches',
    description: 'Controle a quantidade de lanches por semana',
    icon: 'Cookie',
    defaultTarget: 3,
    defaultUnit: 'per_week',
    keywords: ['lanche', 'snack', 'salgado', 'coxinha', 'pastel', 'empada', 'esfiha'],
    color: '#F59E0B',
  },
  limit_fast_food: {
    label: 'Limitar Fast Food',
    description: 'Reduza o consumo de fast food',
    icon: 'Pizza',
    defaultTarget: 2,
    defaultUnit: 'per_week',
    keywords: ['pizza', 'hambúrguer', 'hamburger', 'hot dog', 'cachorro-quente', 'batata frita', 'fast food', 'mc', 'burger king', 'subway'],
    color: '#EF4444',
  },
  limit_sugar: {
    label: 'Limitar Açúcar',
    description: 'Reduza doces e sobremesas',
    icon: 'Candy',
    defaultTarget: 3,
    defaultUnit: 'per_week',
    keywords: ['bolo', 'sorvete', 'chocolate', 'doce', 'brigadeiro', 'pudim', 'torta', 'biscoito', 'bolacha', 'açúcar', 'sobremesa', 'cookie', 'brownie', 'mousse'],
    color: '#EC4899',
  },
  no_overeating: {
    label: 'Não Comer em Excesso',
    description: 'Fique dentro da meta calórica diária',
    icon: 'ShieldCheck',
    defaultTarget: 5,
    defaultUnit: 'per_week',
    keywords: [],
    color: '#10B981',
  },
  healthy_eating: {
    label: 'Alimentação Saudável',
    description: 'Atinja a meta de proteínas na maioria dos dias',
    icon: 'Apple',
    defaultTarget: 5,
    defaultUnit: 'per_week',
    keywords: [],
    color: '#22C55E',
  },
  start_exercising: {
    label: 'Começar a se Exercitar',
    description: 'Pratique exercícios regularmente',
    icon: 'Dumbbell',
    defaultTarget: 3,
    defaultUnit: 'per_week',
    keywords: [],
    color: '#6366F1',
  },
  reduce_meat: {
    label: 'Reduzir Carne',
    description: 'Diminua o consumo de carne vermelha',
    icon: 'Leaf',
    defaultTarget: 3,
    defaultUnit: 'per_week',
    keywords: ['carne', 'bife', 'picanha', 'costela', 'churrasco', 'bacon', 'linguiça', 'salsicha', 'carne moída', 'filé mignon', 'alcatra'],
    color: '#059669',
  },
  home_cooking: {
    label: 'Origem do Alimento',
    description: 'Cozinhe em casa com mais frequência',
    icon: 'ChefHat',
    defaultTarget: 5,
    defaultUnit: 'per_week',
    keywords: ['caseiro', 'feito em casa', 'homemade'],
    color: '#8B5CF6',
  },
} as const;

export type ObjectiveKey = keyof typeof OBJECTIVE_CATALOG;

export const useObjectives = () => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<UserObjective[]>([]);
  const [progress, setProgress] = useState<ObjectiveProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchObjectives = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_objectives')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);
    if (!error && data) {
      setObjectives(data as unknown as UserObjective[]);
    }
  }, [user]);

  const calculateProgress = useCallback(async (objs: UserObjective[]) => {
    if (!user || objs.length === 0) {
      setProgress([]);
      setLoading(false);
      return;
    }

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    // Fetch meals for the week
    const { data: meals } = await supabase
      .from('meal_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('meal_time', weekStart.toISOString())
      .lte('meal_time', weekEnd.toISOString());

    // Fetch exercises for the week
    const { data: exercises } = await supabase
      .from('exercise_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr);

    // Fetch daily goals
    const { data: goalsData } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const dailyGoal = goalsData?.[0];
    const mealsList = meals || [];
    const exercisesList = exercises || [];

    const results: ObjectiveProgress[] = objs.map((obj) => {
      const catalog = OBJECTIVE_CATALOG[obj.objective_key as ObjectiveKey];
      if (!catalog) {
        return {
          objective: obj,
          currentValue: 0,
          targetValue: obj.target_value,
          isWithinGoal: true,
          label: obj.objective_key,
          description: '',
        };
      }

      let currentValue = 0;
      const keywords = obj.custom_keywords?.length ? obj.custom_keywords : catalog.keywords;

      switch (obj.objective_key) {
        case 'limit_snacks': {
          currentValue = mealsList.filter((m: any) => {
            const type = (m.meal_type || '').toLowerCase();
            const name = (m.food_name || '').toLowerCase();
            return type === 'lanche' || keywords.some(k => name.includes(k.toLowerCase()));
          }).length;
          break;
        }
        case 'limit_fast_food':
        case 'limit_sugar':
        case 'reduce_meat': {
          currentValue = mealsList.filter((m: any) => {
            const name = (m.food_name || '').toLowerCase();
            return keywords.some(k => name.includes(k.toLowerCase()));
          }).length;
          break;
        }
        case 'no_overeating': {
          if (dailyGoal) {
            // Count days within calorie goal
            const dayMap: Record<string, number> = {};
            mealsList.forEach((m: any) => {
              const day = format(parseISO(m.meal_time), 'yyyy-MM-dd');
              dayMap[day] = (dayMap[day] || 0) + Number(m.calories);
            });
            currentValue = Object.values(dayMap).filter(cal => cal <= dailyGoal.calories).length;
          }
          break;
        }
        case 'healthy_eating': {
          if (dailyGoal) {
            const dayMap: Record<string, number> = {};
            mealsList.forEach((m: any) => {
              const day = format(parseISO(m.meal_time), 'yyyy-MM-dd');
              dayMap[day] = (dayMap[day] || 0) + Number(m.proteins);
            });
            currentValue = Object.values(dayMap).filter(p => p >= dailyGoal.proteins).length;
          }
          break;
        }
        case 'start_exercising': {
          currentValue = exercisesList.length;
          break;
        }
        case 'home_cooking': {
          currentValue = mealsList.filter((m: any) => {
            const name = (m.food_name || '').toLowerCase();
            return keywords.some(k => name.includes(k.toLowerCase()));
          }).length;
          break;
        }
      }

      // For limit objectives, within goal = current <= target
      // For positive objectives (no_overeating, healthy_eating, start_exercising, home_cooking), within goal = current >= target
      const isPositive = ['no_overeating', 'healthy_eating', 'start_exercising', 'home_cooking'].includes(obj.objective_key);
      const isWithinGoal = isPositive ? currentValue >= obj.target_value : currentValue <= obj.target_value;

      return {
        objective: obj,
        currentValue,
        targetValue: obj.target_value,
        isWithinGoal,
        label: catalog.label,
        description: catalog.description,
      };
    });

    setProgress(results);
    setLoading(false);
  }, [user]);

  const addObjective = async (key: ObjectiveKey, targetValue: number, targetUnit: string = 'per_week', customKeywords?: string[]) => {
    if (!user) return;
    const { error } = await supabase.from('user_objectives').insert({
      user_id: user.id,
      objective_key: key,
      target_value: targetValue,
      target_unit: targetUnit,
      custom_keywords: customKeywords || null,
    } as any);
    if (!error) await fetchObjectives();
    return error;
  };

  const removeObjective = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_objectives').delete().eq('id', id);
    if (!error) await fetchObjectives();
  };

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  useEffect(() => {
    if (objectives.length > 0) {
      calculateProgress(objectives);
    } else {
      setProgress([]);
      setLoading(false);
    }
  }, [objectives, calculateProgress]);

  return { objectives, progress, loading, addObjective, removeObjective, fetchObjectives };
};
