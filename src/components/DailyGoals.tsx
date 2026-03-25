
import React from 'react';
import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyGoal, MealRecord } from '@/pages/DailyControl';
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';

interface DailyGoalsProps {
  goals: DailyGoal;
  meals: MealRecord[];
  onEditGoals: () => void;
}

const AnimatedCounter: React.FC<{ value: number; className?: string; delay?: number }> = ({ 
  value, 
  className,
  delay = 0 
}) => {
  const animatedValue = useCountUp(value, 1500);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {Math.round(animatedValue)}
    </motion.div>
  );
};

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
    <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20">
      <div className="flex flex-col items-center mb-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800">Metas Diárias</h3>
          <p className="text-gray-600">{goals.diet_objective}</p>
        </div>
        <Button
          onClick={onEditGoals}
          variant="outline"
          size="sm"
          className="rounded-xl w-full mt-4"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {progressItems.map((item, index) => {
          const percentage = Math.min((item.consumed / item.goal) * 100, 100);
          const remaining = Math.max(item.goal - item.consumed, 0);
          const delay = index * 0.1;

          return (
            <motion.div 
              key={item.label} 
              className="bg-gray-50 rounded-2xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
            >
              <div className="text-center space-y-2">
                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {item.label}
                </h4>
                <div className="space-y-1">
                  <AnimatedCounter 
                    value={item.consumed} 
                    className={`text-2xl font-bold ${item.color}`}
                    delay={delay}
                  />
                  <div className="text-sm text-gray-500">
                    de {item.goal} {item.unit}
                  </div>
                </div>
                
                {/* Barra de progresso animada */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`${item.bgColor.replace('bg-', 'bg-')} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      duration: 1.5, 
                      ease: "easeOut",
                      delay: delay + 0.2 
                    }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  Restam: <AnimatedCounter value={remaining} delay={delay} /> {item.unit}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
