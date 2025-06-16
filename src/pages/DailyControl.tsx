
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { DailyGoals } from '@/components/DailyGoals';
import { MealsList } from '@/components/MealsList';
import { GoalsForm } from '@/components/GoalsForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DailyGoal {
  id?: string;
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  diet_objective: string;
  created_at?: string;
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
}

const DailyControl = () => {
  const [goals, setGoals] = useState<DailyGoal | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Carregar metas do usuário
      const { data: goalsData, error: goalsError } = await supabase
        .from('daily_goals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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

  const handleSaveGoals = async (newGoals: Omit<DailyGoal, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .insert([newGoals])
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
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyControl;
