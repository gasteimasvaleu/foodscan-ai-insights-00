
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { DailyGoals } from '@/components/DailyGoals';
import { MealsList } from '@/components/MealsList';
import { GoalsForm } from '@/components/GoalsForm';
import { DietAnalysis } from '@/components/DietAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyGoal {
  id?: string;
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  diet_objective: string;
  created_at?: string;
  user_id?: string;
}

export interface MealRecord {
  id?: string;
  food_name: string;
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  portion: string;
  meal_time: string;
  created_at?: string;
  user_id?: string;
}

const DailyControl = () => {
  const { user, profile } = useAuth();
  const [goals, setGoals] = useState<DailyGoal | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const webhookUrl = 'https://hook.us2.make.com/vjfnqzqryuq9hyay7698pztkyt06chj7';

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

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

  const handleSaveGoals = async (newGoals: Omit<DailyGoal, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .insert([{ ...newGoals, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setGoals(data);
      setShowGoalsForm(false);
      toast({
        title: "Sucesso",
        description: "Metas diárias salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar metas diárias",
        variant: "destructive",
      });
    }
  };

  const handleEndDay = async () => {
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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Controle Diário
              </h1>
              <p className="text-gray-600">
                Acompanhe suas metas nutricionais e registre suas refeições
              </p>
              {profile && (
                <div className="mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg inline-block">
                  <p className="text-lg text-gray-700">
                    Olá, <span className="font-semibold text-primary-600">{profile.name}</span>! 
                    Como está sendo seu dia nutricional? 🍽️
                  </p>
                </div>
              )}
            </div>

            {goals ? (
              <DailyGoals 
                goals={goals} 
                meals={meals}
                onEditGoals={() => setShowGoalsForm(true)}
              />
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Configure suas Metas Diárias
                </h3>
                <p className="text-gray-600 mb-6">
                  Defina seus objetivos nutricionais para começar o controle
                </p>
                <button
                  onClick={() => setShowGoalsForm(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Configurar Metas
                </button>
              </div>
            )}

            {showGoalsForm && (
              <GoalsForm
                onSave={handleSaveGoals}
                onCancel={() => setShowGoalsForm(false)}
                initialGoals={goals}
              />
            )}

            <MealsList meals={meals} onRefresh={loadUserData} />

            {/* Botão Encerrar Dia */}
            {goals && meals.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={handleEndDay}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analisando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Encerrar Dia
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Componente de Análise */}
            <DietAnalysis analysis={analysis} isLoading={isAnalyzing} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyControl;
