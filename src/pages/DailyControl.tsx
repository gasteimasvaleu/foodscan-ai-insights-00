import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';


import { DailyGoals } from '@/components/DailyGoals';
import { MealsList } from '@/components/MealsList';
import { GoalsForm } from '@/components/GoalsForm';
import { DietAnalysis } from '@/components/DietAnalysis';
import { AuthCard } from '@/components/AuthCard';
import { WeeklySummary, saveWeeklySummary } from '@/components/WeeklySummary';

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import VideoOverlay from '@/components/VideoOverlay';
export interface DailyGoal {
  id?: string;
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  diet_objective: string;
  user_id?: string;
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
  user_id?: string;
  created_at?: string;
}
const DailyControl = () => {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<DailyGoal | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const goalsFormRef = useRef<HTMLDivElement>(null);
  const webhookUrl = 'https://hook.us2.make.com/vjfnqzqryuq9hyay7698pztkyt06chj7';
  const [analysisData, setAnalysisData] = useState<{
    goals: any;
    consumed: any;
  } | null>(null);
  const [weeklyDataUpdateKey, setWeeklyDataUpdateKey] = useState(0);
  useEffect(() => {
    if (!authLoading && user) {
      loadUserData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);
  const loadUserData = async () => {
    if (!user) return;
    try {
      // Carregar metas do usuário
      const {
        data: goalsData,
        error: goalsError
      } = await supabase.from('daily_goals').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (goalsError) {
        console.error('Erro ao carregar metas:', goalsError);
      } else if (goalsData) {
        setGoals(goalsData);
      }

      // Carregar refeições do dia
      const today = new Date().toISOString().split('T')[0];
      const {
        data: mealsData,
        error: mealsError
      } = await supabase.from('meal_records').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00.000Z`).lt('created_at', `${today}T23:59:59.999Z`).order('created_at', {
        ascending: false
      });
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
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveGoals = async (newGoals: Omit<DailyGoal, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.from('daily_goals').insert([{
        ...newGoals,
        user_id: user.id
      }]).select().single();
      if (error) throw error;
      setGoals(data);
      setShowGoalsForm(false);
      toast({
        title: "Sucesso",
        description: "Metas diárias salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar metas diárias",
        variant: "destructive"
      });
    }
  };
  const handleEditGoals = () => {
    setShowGoalsForm(true);
    // Scroll suave até o formulário após um pequeno delay para garantir que ele seja renderizado
    setTimeout(() => {
      goalsFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };
  const handleEndDay = async () => {
    if (!goals) {
      toast({
        title: "Erro",
        description: "Metas diárias não configuradas",
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);

    // Calcular totais consumidos
    const consumed = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      carbohydrates: acc.carbohydrates + meal.carbohydrates,
      proteins: acc.proteins + meal.proteins,
      fats: acc.fats + meal.fats
    }), {
      calories: 0,
      carbohydrates: 0,
      proteins: 0,
      fats: 0
    });
    const payload = {
      date: new Date().toISOString().split('T')[0],
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.text();
        setAnalysis(result);

        // Salvar os dados para a análise da IA
        setAnalysisData({
          goals: payload.goals,
          consumed: payload.consumed
        });

        // Salvar dados do resumo semanal
        if (user) {
          await saveWeeklySummary(user.id, consumed);
          setWeeklyDataUpdateKey(prev => prev + 1); // Força atualização do componente semanal
        }

        toast({
          title: "Sucesso",
          description: "Análise do dia concluída!"
        });

        // Scroll suave até o card de análise
        setTimeout(() => {
          analysisRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao enviar dados para Make:', error);
      toast({
        title: "Erro",
        description: "Erro ao analisar a dieta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleClearMeals = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }
    try {
      // Deletar todas as refeições do dia atual do banco de dados
      const today = new Date().toISOString().split('T')[0];
      const {
        error
      } = await supabase.from('meal_records').delete().eq('user_id', user.id).gte('created_at', `${today}T00:00:00.000Z`).lt('created_at', `${today}T23:59:59.999Z`);
      if (error) {
        throw error;
      }

      // Limpar o estado local
      setMeals([]);
      toast({
        title: "Sucesso",
        description: "Refeições removidas permanentemente!"
      });
    } catch (error) {
      console.error('Erro ao limpar refeições:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover refeições. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  if (authLoading || isLoading) {
    return <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16 pb-28">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </>;
  }
  if (!user) {
    return <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16 pb-28">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Acesso Restrito
                </h1>
                <p className="text-gray-600 mb-8">
                  Você precisa estar logado para acessar o controle diário.
                </p>
              </div>
              <AuthCard mode="login" />
            </div>
          </div>
        </div>
      </>;
  }
  return (
    <>
      <VideoOverlay isVisible={isAnalyzing} message="Analisando seu dia..." subMessage="Calculando seus resultados nutricionais" />
      <Navbar />
      <div className="min-h-screen bg-gradient-primary pt-16 pb-28">
        <div className="container mx-auto px-4 py-8">
          
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Card */}
            <div className="mb-6 animate-fade-in">
              <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[#FD46A1]">Controle Diário</h1>
              </div>
            </div>

            {goals ? (
              <DailyGoals goals={goals} meals={meals} onEditGoals={handleEditGoals} />
            ) : (
              <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20 text-center">
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
              <div ref={goalsFormRef}>
                <GoalsForm 
                  onSave={handleSaveGoals} 
                  onCancel={() => setShowGoalsForm(false)} 
                  initialGoals={goals} 
                />
              </div>
            )}

            <MealsList 
              meals={meals} 
              onRefresh={loadUserData} 
              onClearMeals={handleClearMeals} 
            />

            {/* Botões de Ação */}
            {goals && (
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={() => navigate('/foodscan')} 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-xs"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Comer Mais
                </Button>
                
                {meals.length > 0 && (
                  <Button 
                    onClick={handleEndDay} 
                    disabled={isAnalyzing} 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-xs"
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
                )}
              </div>
            )}

            {/* Resumo Semanal - posicionado após os botões de ação */}
            {goals && (
              <WeeklySummary key={weeklyDataUpdateKey} className="shadow-xl" />
            )}

            {/* Componente de Análise */}
            <div ref={analysisRef}>
              <DietAnalysis 
                analysis={analysis} 
                isLoading={isAnalyzing} 
                goals={analysisData?.goals} 
                consumed={analysisData?.consumed} 
              />
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};
export default DailyControl;
