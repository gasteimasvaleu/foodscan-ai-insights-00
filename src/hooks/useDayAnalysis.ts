
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { DailyGoal, MealRecord } from '@/types/daily-control';

export const useDayAnalysis = () => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const webhookUrl = 'https://hook.us2.make.com/vjfnqzqryuq9hyay7698pztkyt06chj7';

  const handleEndDay = async (goals: DailyGoal, meals: MealRecord[], profile: any) => {
    if (!goals) {
      toast({
        title: "Erro",
        description: "Metas diárias não configuradas",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Calcular totais consumidos
    const consumed = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        carbohydrates: acc.carbohydrates + meal.carbohydrates,
        proteins: acc.proteins + meal.proteins,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, carbohydrates: 0, proteins: 0, fats: 0 }
    );

    const payload = {
      date: new Date().toISOString().split('T')[0],
      user_name: profile?.name || 'Usuário',
      goals: {
        calories: goals.calories,
        carbohydrates: goals.carbohydrates,
        proteins: goals.proteins,
        fats: goals.fats,
        diet_objective: goals.diet_objective
      },
      consumed: {
        calories: Math.round(consumed.calories),
        carbohydrates: Math.round(consumed.carbohydrates),
        proteins: Math.round(consumed.proteins),
        fats: Math.round(consumed.fats)
      },
      meals: meals.map(meal => ({
        food_name: meal.food_name,
        calories: meal.calories,
        carbohydrates: meal.carbohydrates,
        proteins: meal.proteins,
        fats: meal.fats,
        portion: meal.portion,
        meal_time: meal.meal_time
      })),
      summary: {
        total_meals: meals.length,
        calorie_difference: consumed.calories - goals.calories,
        carb_difference: consumed.carbohydrates - goals.carbohydrates,
        protein_difference: consumed.proteins - goals.proteins,
        fat_difference: consumed.fats - goals.fats
      }
    };

    try {
      console.log('Enviando dados para Make:', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.text();
        setAnalysis(result);
        toast({
          title: "Sucesso",
          description: "Análise do dia concluída!",
        });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao enviar dados para Make:', error);
      toast({
        title: "Erro",
        description: "Erro ao analisar a dieta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analysis, isAnalyzing, handleEndDay };
};
