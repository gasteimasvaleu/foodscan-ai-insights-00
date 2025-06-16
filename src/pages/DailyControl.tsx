
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MealsList } from '@/components/MealsList';
import { GoalsForm } from '@/components/GoalsForm';
import { DietAnalysis } from '@/components/DietAnalysis';
import { DailyControlHeader } from '@/components/DailyControlHeader';
import { GoalsSection } from '@/components/GoalsSection';
import { EndDayButton } from '@/components/EndDayButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyData } from '@/hooks/useDailyData';
import { useDayAnalysis } from '@/hooks/useDayAnalysis';
import { DailyGoal } from '@/types/daily-control';

const DailyControl = () => {
  const { user, profile } = useAuth();
  const { goals, setGoals, meals, isLoading, loadUserData } = useDailyData(user);
  const { analysis, isAnalyzing, handleEndDay } = useDayAnalysis();
  const [showGoalsForm, setShowGoalsForm] = useState(false);

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

  const onEndDay = () => {
    if (goals) {
      handleEndDay(goals, meals, profile);
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
            <DailyControlHeader profile={profile} />

            <GoalsSection
              goals={goals}
              meals={meals}
              onEditGoals={() => setShowGoalsForm(true)}
              onShowGoalsForm={() => setShowGoalsForm(true)}
            />

            {showGoalsForm && (
              <GoalsForm
                onSave={handleSaveGoals}
                onCancel={() => setShowGoalsForm(false)}
                initialGoals={goals}
              />
            )}

            <MealsList meals={meals} onRefresh={loadUserData} />

            {goals && meals.length > 0 && (
              <EndDayButton
                onEndDay={onEndDay}
                isAnalyzing={isAnalyzing}
              />
            )}

            <DietAnalysis analysis={analysis} isLoading={isAnalyzing} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyControl;
