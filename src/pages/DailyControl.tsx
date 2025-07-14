import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Target, Utensils, BarChart3 } from 'lucide-react';

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

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbohydrates, 0);
  const totalProteins = meals.reduce((sum, meal) => sum + meal.proteins, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

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
                  onClick={() => setShowGoalsForm(!showGoalsForm)}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Definir Metas
                </Button>
              </div>

              <div className="text-center py-8 text-white/80">
                <Target className="w-16 h-16 mx-auto mb-4 text-primary-300" />
                <h2 className="text-2xl font-semibold mb-2">Controle Diário</h2>
                <p className="mb-4">Acompanhe suas refeições e metas nutricionais</p>
                
                {goals && (
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium mb-2">Suas Metas</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Calorias: {goals.calories}</div>
                      <div>Carboidratos: {goals.carbohydrates}g</div>
                      <div>Proteínas: {goals.proteins}g</div>
                      <div>Gorduras: {goals.fats}g</div>
                    </div>
                  </div>
                )}

                {meals.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium mb-2">Consumo Atual</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Calorias: {totalCalories}</div>
                      <div>Carboidratos: {totalCarbs.toFixed(1)}g</div>
                      <div>Proteínas: {totalProteins.toFixed(1)}g</div>
                      <div>Gorduras: {totalFats.toFixed(1)}g</div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-white/60">
                  <p>Esta é uma versão simplificada do controle diário.</p>
                  <p>Use o FoodScan para analisar suas refeições.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DailyControl;