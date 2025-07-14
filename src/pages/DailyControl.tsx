import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { DailyGoals } from '@/components/DailyGoals';
import { MealsList } from '@/components/MealsList';
import { GoalsForm } from '@/components/GoalsForm';
import { DietAnalysis } from '@/components/DietAnalysis';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

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
  const [goals, setGoals] = useState<DailyGoal | null>(null);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [showGoalsForm, setShowGoalsForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGoalsSubmit = (goalsData: DailyGoal) => {
    setGoals(goalsData);
    setShowGoalsForm(false);
    console.log('Metas salvas:', goalsData);
  };

  const handleMealAdd = (meal: MealRecord) => {
    setMeals([...meals, meal]);
    console.log('Refeição adicionada:', meal);
  };

  const handleMealDelete = (mealId: string) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
    console.log('Refeição removida:', mealId);
  };

  const handleAnalyzeDay = async () => {
    if (!goals || meals.length === 0) return;

    setIsAnalyzing(true);
    
    // Simular análise
    setTimeout(() => {
      const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbohydrates, 0);
      const totalProteins = meals.reduce((sum, meal) => sum + meal.proteins, 0);
      const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

      const analysisText = `
        Análise do seu dia:
        
        Calorias: ${totalCalories}/${goals.calories} (${((totalCalories/goals.calories)*100).toFixed(1)}%)
        Carboidratos: ${totalCarbs.toFixed(1)}g/${goals.carbohydrates}g
        Proteínas: ${totalProteins.toFixed(1)}g/${goals.proteins}g
        Gorduras: ${totalFats.toFixed(1)}g/${goals.fats}g
        
        ${totalCalories > goals.calories ? 'Você excedeu sua meta calórica.' : 'Você está dentro da meta calórica.'}
      `;

      setAnalysis(analysisText);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <AuthCard />
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-primary-300" />
                  Controle Diário
                </h1>
                <Button
                  onClick={() => setShowGoalsForm(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Definir Metas
                </Button>
              </div>

              <WelcomeMessage />

              {showGoalsForm && (
                <div className="mt-6">
                  <GoalsForm
                    onSubmit={handleGoalsSubmit}
                    onCancel={() => setShowGoalsForm(false)}
                    currentGoals={goals}
                  />
                </div>
              )}

              {goals && (
                <div className="mt-6">
                  <DailyGoals
                    goals={goals}
                    currentIntake={{
                      calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
                      carbohydrates: meals.reduce((sum, meal) => sum + meal.carbohydrates, 0),
                      proteins: meals.reduce((sum, meal) => sum + meal.proteins, 0),
                      fats: meals.reduce((sum, meal) => sum + meal.fats, 0),
                    }}
                  />
                </div>
              )}

              <div className="mt-6">
                <MealsList
                  meals={meals}
                  onMealAdd={handleMealAdd}
                  onMealDelete={handleMealDelete}
                />
              </div>

              {goals && meals.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-center">
                    <Button
                      onClick={handleAnalyzeDay}
                      disabled={isAnalyzing}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      {isAnalyzing ? 'Analisando...' : 'Analisar Dia'}
                    </Button>
                  </div>
                  
                  {analysis && (
                    <div className="mt-6">
                      <DietAnalysis analysis={analysis} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DailyControl;