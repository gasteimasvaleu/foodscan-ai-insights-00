
import React from 'react';
import { DailyGoals } from '@/components/DailyGoals';
import { DailyGoal, MealRecord } from '@/types/daily-control';

interface GoalsSectionProps {
  goals: DailyGoal | null;
  meals: MealRecord[];
  onEditGoals: () => void;
  onShowGoalsForm: () => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  meals,
  onEditGoals,
  onShowGoalsForm
}) => {
  if (goals) {
    return (
      <DailyGoals 
        goals={goals} 
        meals={meals}
        onEditGoals={onEditGoals}
      />
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Configure suas Metas Diárias
      </h3>
      <p className="text-gray-600 mb-6">
        Defina seus objetivos nutricionais para começar o controle
      </p>
      <button
        onClick={onShowGoalsForm}
        className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Configurar Metas
      </button>
    </div>
  );
};
