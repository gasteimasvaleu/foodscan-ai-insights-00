
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Flame, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface DailyData {
  goalCalories: number;
  goalCarbs: number;
  goalProteins: number;
  goalFats: number;
  consumedCalories: number;
  consumedCarbs: number;
  consumedProteins: number;
  consumedFats: number;
  burnedCalories: number;
}

export const DailyCalorieSummaryCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DailyData | null>(null);
  const [hasGoals, setHasGoals] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');

      const [goalsRes, mealsRes, exerciseRes] = await Promise.all([
        supabase
          .from('daily_goals')
          .select('calories, carbohydrates, proteins, fats')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('meal_records')
          .select('calories, carbohydrates, proteins, fats')
          .eq('user_id', user.id)
          .gte('meal_time', `${today}T00:00:00`)
          .lte('meal_time', `${today}T23:59:59`),
        supabase
          .from('exercise_records')
          .select('calories_burned')
          .eq('user_id', user.id)
          .eq('date', today),
      ]);

      const goal = goalsRes.data?.[0];
      if (!goal) {
        setHasGoals(false);
        return;
      }

      const meals = mealsRes.data || [];
      const exercises = exerciseRes.data || [];

      const consumedCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const consumedCarbs = meals.reduce((sum, m) => sum + Number(m.carbohydrates || 0), 0);
      const consumedProteins = meals.reduce((sum, m) => sum + Number(m.proteins || 0), 0);
      const consumedFats = meals.reduce((sum, m) => sum + Number(m.fats || 0), 0);
      const burnedCalories = exercises.reduce((sum, e) => sum + Number(e.calories_burned || 0), 0);

      setData({
        goalCalories: goal.calories,
        goalCarbs: goal.carbohydrates,
        goalProteins: goal.proteins,
        goalFats: goal.fats,
        consumedCalories,
        consumedCarbs,
        consumedProteins,
        consumedFats,
        burnedCalories,
      });
      setHasGoals(true);
    };

    fetchData();
  }, [user?.id]);

  if (!user) return null;

  // CTA when no goals
  if (!hasGoals) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-xl">
        <Flame className="w-10 h-10 text-orange-500 mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">Configure suas metas</p>
        <p className="text-xs text-muted-foreground text-center mb-3">
          Defina suas calorias e macros diários para acompanhar seu progresso
        </p>
        <button
          onClick={() => navigate('/controle-diario')}
          className="text-xs font-medium text-primary underline"
        >
          Ir para Controle Diário
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl">
        <div className="animate-pulse text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const remaining = Math.max(0, data.goalCalories - data.consumedCalories);
  const consumedPercent = data.goalCalories > 0 ? Math.min(100, (data.consumedCalories / data.goalCalories) * 100) : 0;
  const carbsPercent = data.goalCarbs > 0 ? Math.min(100, (data.consumedCarbs / data.goalCarbs) * 100) : 0;
  const proteinsPercent = data.goalProteins > 0 ? Math.min(100, (data.consumedProteins / data.goalProteins) * 100) : 0;
  const fatsPercent = data.goalFats > 0 ? Math.min(100, (data.consumedFats / data.goalFats) * 100) : 0;

  // SVG ring params
  const ringSize = 80;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (consumedPercent / 100) * circumference;

  return (
    <div
      className="w-full h-full flex flex-col justify-between bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-xl cursor-pointer"
      onClick={() => navigate('/controle-diario')}
    >
      {/* Top row: remaining - ring - consumed */}
      <div className="flex items-center justify-between flex-1">
        {/* Remaining */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Restantes</span>
          <span className="text-lg font-bold text-foreground">{remaining}</span>
          <span className="text-[10px] text-muted-foreground">kcal</span>
        </div>

        {/* Circular ring */}
        <div className="relative flex items-center justify-center">
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-semibold text-foreground">{data.burnedCalories}</span>
          </div>
        </div>

        {/* Consumed */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Consumidas</span>
          <span className="text-lg font-bold text-foreground">{data.consumedCalories}</span>
          <span className="text-[10px] text-muted-foreground">kcal</span>
        </div>
      </div>

      {/* Macro progress bars */}
      <div className="space-y-1.5 mt-2">
        <MacroBar label="Carboidratos" current={data.consumedCarbs} goal={data.goalCarbs} percent={carbsPercent} color="bg-amber-400" />
        <MacroBar label="Proteínas" current={data.consumedProteins} goal={data.goalProteins} percent={proteinsPercent} color="bg-rose-400" />
        <MacroBar label="Gorduras" current={data.consumedFats} goal={data.goalFats} percent={fatsPercent} color="bg-blue-400" />
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center mt-2 gap-1">
        <span className="text-[10px] text-muted-foreground">Ver Controle Diário</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
      </div>
    </div>
  );
};

const MacroBar = ({ label, current, goal, percent, color }: { label: string; current: number; goal: number; percent: number; color: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-muted-foreground w-20 truncate">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
    <span className="text-[10px] text-muted-foreground w-14 text-right">
      {Math.round(current)}/{goal}g
    </span>
  </div>
);
