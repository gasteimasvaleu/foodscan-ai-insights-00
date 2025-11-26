import React from 'react';
import { Clock, Utensils, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealRecord } from '@/pages/DailyControl';

interface MealsListProps {
  meals: MealRecord[];
  onRefresh: () => void;
  onClearMeals: () => void;
}

export const MealsList: React.FC<MealsListProps> = ({ meals, onRefresh, onClearMeals }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl py-8 px-4 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded-full p-3">
            <Utensils className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Refeições de Hoje</h3>
            <p className="text-gray-600">{meals.length} refeição(ões) registrada(s)</p>
          </div>
        </div>
        <Button
          onClick={onClearMeals}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Utensils className="w-8 h-8 text-gray-400 mx-auto" />
          </div>
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma refeição registrada
          </h4>
          <p className="text-gray-500">
            Use o FoodScan para analisar seus alimentos e registrar suas refeições
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <div
              key={meal.id || index}
              className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {meal.food_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Porção: {meal.portion}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(meal.meal_time)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {meal.calories}
                  </div>
                  <div className="text-xs text-gray-500">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {meal.carbohydrates}g
                  </div>
                  <div className="text-xs text-gray-500">Carboidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {meal.proteins}g
                  </div>
                  <div className="text-xs text-gray-500">Proteínas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {meal.fats}g
                  </div>
                  <div className="text-xs text-gray-500">Gorduras</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
