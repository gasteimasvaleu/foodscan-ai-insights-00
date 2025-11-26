
import React from 'react';
import { Target, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyGoal, MealRecord } from '@/pages/DailyControl';

interface DailyGoalsProps {
  goals: DailyGoal;
  meals: MealRecord[];
  onEditGoals: () => void;
}

export const DailyGoals: React.FC<DailyGoalsProps> = ({ goals, meals, onEditGoals }) => {
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

  const progressItems = [
    {
      label: 'Calorias',
      consumed: consumed.calories,
      goal: goals.calories,
      unit: 'kcal',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Carboidratos',
      consumed: consumed.carbohydrates,
      goal: goals.carbohydrates,
      unit: 'g',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Proteínas',
      consumed: consumed.proteins,
      goal: goals.proteins,
      unit: 'g',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Gorduras',
      consumed: consumed.fats,
      goal: goals.fats,
      unit: 'g',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl py-8 px-4 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 rounded-full p-3">
            <Target className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Metas Diárias</h3>
            <p className="text-gray-600">{goals.diet_objective}</p>
          </div>
        </div>
        <Button
          onClick={onEditGoals}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {progressItems.map((item) => {
          const percentage = Math.min((item.consumed / item.goal) * 100, 100);
          const remaining = Math.max(item.goal - item.consumed, 0);

          return (
            <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
              <div className="text-center space-y-2">
                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {item.label}
                </h4>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${item.color}`}>
                    {Math.round(item.consumed)}
                  </div>
                  <div className="text-sm text-gray-500">
                    de {item.goal} {item.unit}
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.bgColor.replace('bg-', 'bg-')} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Restam: {Math.round(remaining)} {item.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
