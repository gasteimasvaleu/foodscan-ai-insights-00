import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateHydrationNutritionTotals } from '@/data/hydrationCatalog';

interface DayMeal {
  id: string;
  food_name: string;
  meal_time: string;
  portion: string;
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
}

export interface WeeklySummaryData {
  id?: string;
  user_id: string;
  date: string;
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  created_at?: string;
}

interface WeeklySummaryProps {
  className?: string;
}

const DAYS_OF_WEEK = [
  { short: 'Dom', full: 'Domingo', index: 0 },
  { short: 'Seg', full: 'Segunda', index: 1 },
  { short: 'Ter', full: 'Terça', index: 2 },
  { short: 'Qua', full: 'Quarta', index: 3 },
  { short: 'Qui', full: 'Quinta', index: 4 },
  { short: 'Sex', full: 'Sexta', index: 5 },
  { short: 'Sáb', full: 'Sábado', index: 6 }
];

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ className }) => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklySummaryData[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [isLoading, setIsLoading] = useState(true);

  const [dayMeals, setDayMeals] = useState<DayMeal[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  useEffect(() => {
    if (user) {
      loadWeeklyData();
    }
  }, [user]);

  // Recarregar dados a cada 30 segundos
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadWeeklyData();
      loadDayMeals(selectedDay);
    }, 30000);
    return () => clearInterval(interval);
  }, [user, selectedDay]);

  // Carregar refeições quando o dia selecionado mudar
  useEffect(() => {
    if (user) {
      loadDayMeals(selectedDay);
    }
  }, [user, selectedDay]);

  const loadDayMeals = async (dayIndex: number) => {
    if (!user) return;
    setIsLoadingMeals(true);
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - today.getDay() + dayIndex);
      const dateString = targetDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('meal_records')
        .select('id, food_name, meal_time, portion, calories, carbohydrates, proteins, fats')
        .eq('user_id', user.id)
        .gte('meal_time', `${dateString}T00:00:00.000Z`)
        .lt('meal_time', `${dateString}T23:59:59.999Z`)
        .order('meal_time');

      if (error) {
        console.error('Erro ao buscar refeições do dia:', error);
        setDayMeals([]);
        return;
      }
      setDayMeals(data || []);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
      setDayMeals([]);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const formatMealTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta refeição?')) return;
    try {
      const { error } = await supabase
        .from('meal_records')
        .delete()
        .eq('id', mealId);
      if (error) throw error;
      toast({ title: 'Refeição excluída com sucesso' });
      loadDayMeals(selectedDay);
      loadWeeklyData();
    } catch (error) {
      console.error('Erro ao excluir refeição:', error);
      toast({ title: 'Erro ao excluir refeição', variant: 'destructive' });
    }
  };

  const loadWeeklyData = async () => {
    if (!user) return;

    try {
      // Calcular dados dos últimos 7 dias (refeições + hidratação)
      const weekDates = getCurrentWeekDates(new Date());
      const weekData: WeeklySummaryData[] = [];
      const firstDate = weekDates[0];
      const lastDate = weekDates[weekDates.length - 1];

      const [{ data: mealRecords, error: mealsError }, { data: hydrationRecords, error: hydrationError }] = await Promise.all([
        supabase
          .from('meal_records')
          .select('meal_time, calories, carbohydrates, proteins, fats')
          .eq('user_id', user.id)
          .gte('meal_time', `${firstDate}T00:00:00.000Z`)
          .lt('meal_time', `${lastDate}T23:59:59.999Z`),
        supabase
          .from('hydration_records')
          .select('consumption_date, beverage_key, volume_ml, calories')
          .eq('user_id', user.id)
          .gte('consumption_date', firstDate)
          .lte('consumption_date', lastDate),
      ]);

      if (mealsError) {
        console.error('Erro ao buscar refeições:', mealsError);
      }

      if (hydrationError) {
        console.error('Erro ao buscar hidratação:', hydrationError);
      }

      for (const date of weekDates) {
        const dayMeals = (mealRecords || []).filter((meal) => meal.meal_time.startsWith(date));
        const dayHydration = (hydrationRecords || []).filter((record) => record.consumption_date === date);

        const mealTotals = dayMeals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            carbohydrates: acc.carbohydrates + (meal.carbohydrates || 0),
            proteins: acc.proteins + (meal.proteins || 0),
            fats: acc.fats + (meal.fats || 0),
          }),
          { calories: 0, carbohydrates: 0, proteins: 0, fats: 0 }
        );

        const hydrationTotals = calculateHydrationNutritionTotals(dayHydration || []);

        const dailyData = {
          user_id: user.id,
          date,
          calories: mealTotals.calories + hydrationTotals.calories,
          carbohydrates: mealTotals.carbohydrates + hydrationTotals.carbohydrates,
          proteins: mealTotals.proteins,
          fats: mealTotals.fats,
        };

        if (dailyData.calories > 0 || dailyData.carbohydrates > 0 || dailyData.proteins > 0 || dailyData.fats > 0) {
          await supabase
            .from('weekly_summaries')
            .upsert(dailyData, { onConflict: 'user_id,date' });

          weekData.push(dailyData);
        }
      }

      setWeeklyData(weekData);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWeekDates = (date: Date): string[] => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day.toISOString().split('T')[0]);
    }

    return week;
  };

  const getDataForDay = (dayIndex: number): WeeklySummaryData | null => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - today.getDay() + dayIndex);
    const dateString = targetDate.toISOString().split('T')[0];
    
    return weeklyData.find(data => data.date === dateString) || null;
  };

  const selectedDayData = getDataForDay(selectedDay);
  const selectedDayName = DAYS_OF_WEEK[selectedDay];

  // Calcular médias semanais
  const weeklyAverages = {
    calories: Math.round(weeklyData.reduce((acc, day) => acc + day.calories, 0) / Math.max(weeklyData.length, 1)),
    carbohydrates: Math.round(weeklyData.reduce((acc, day) => acc + day.carbohydrates, 0) / Math.max(weeklyData.length, 1)),
    proteins: Math.round(weeklyData.reduce((acc, day) => acc + day.proteins, 0) / Math.max(weeklyData.length, 1)),
    fats: Math.round(weeklyData.reduce((acc, day) => acc + day.fats, 0) / Math.max(weeklyData.length, 1))
  };

  const today = new Date().getDay();

  if (isLoading) {
    return (
      <Card className={`bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-4">
        <div className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Resumo Semanal</CardTitle>
          <p className="text-gray-600">Acompanhe seu progresso da semana</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Switch de dias da semana */}
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
            {DAYS_OF_WEEK.map((day) => {
              const hasData = getDataForDay(day.index) !== null;
              const isToday = day.index === today;
              const isSelected = day.index === selectedDay;

              return (
                <Button
                  key={day.index}
                  onClick={() => setSelectedDay(day.index)}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`
                    relative px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200
                    ${isSelected 
                      ? 'bg-primary-500 text-white shadow-md' 
                      : hasData 
                        ? 'text-gray-700 hover:bg-gray-200' 
                        : 'text-gray-400'
                    }
                    ${isToday && !isSelected ? 'ring-2 ring-pink-300' : ''}
                  `}
                >
                  {day.short}
                  {hasData && (
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary-500'
                    }`} />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Dados do dia selecionado */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            {selectedDayName.full}
          </h4>

          {selectedDayData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FD46A1]">
                  {Math.round(selectedDayData.calories)}
                </div>
                <div className="text-sm text-gray-500">kcal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FD46A1]">
                  {Math.round(selectedDayData.carbohydrates)}
                </div>
                <div className="text-sm text-gray-500">Carboidratos (g)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FD46A1]">
                  {Math.round(selectedDayData.proteins)}
                </div>
                <div className="text-sm text-gray-500">Proteínas (g)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FD46A1]">
                  {Math.round(selectedDayData.fats)}
                </div>
                <div className="text-sm text-gray-500">Gorduras (g)</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum dado registrado para este dia</p>
            </div>
          )}
        </div>

        {/* Refeições do dia selecionado */}
        {dayMeals.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="text-base font-semibold text-gray-800 mb-3 text-center">
              Refeições de {selectedDayName.full}
            </h4>
            <div className="space-y-3">
              {dayMeals.map((meal) => (
                <div key={meal.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-gray-800 truncate flex-1">
                      {meal.food_name}
                    </h5>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatMealTime(meal.meal_time)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMeal(meal.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Porção: {meal.portion}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#FD46A1]">{meal.calories}</div>
                      <div className="text-[10px] text-gray-500">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#FD46A1]">{meal.carbohydrates}g</div>
                      <div className="text-[10px] text-gray-500">Carb</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#FD46A1]">{meal.proteins}g</div>
                      <div className="text-[10px] text-gray-500">Prot</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#FD46A1]">{meal.fats}g</div>
                      <div className="text-[10px] text-gray-500">Gord</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoadingMeals && (
          <div className="text-center py-4">
            <div className="animate-pulse text-sm text-gray-500">Carregando refeições...</div>
          </div>
        )}


        {weeklyData.length > 0 && (
          <div className="bg-[#F9FAFB] rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Médias da Semana ({weeklyData.length} dias registrados)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[#FD46A1]">
                  {weeklyAverages.calories}
                </div>
                <div className="text-sm text-gray-500">kcal/dia</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#FD46A1]">
                  {weeklyAverages.carbohydrates}
                </div>
                <div className="text-sm text-gray-500">Carb. (g/dia)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#FD46A1]">
                  {weeklyAverages.proteins}
                </div>
                <div className="text-sm text-gray-500">Prot. (g/dia)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#FD46A1]">
                  {weeklyAverages.fats}
                </div>
                <div className="text-sm text-gray-500">Gord. (g/dia)</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const saveWeeklySummary = async (
  userId: string,
  data: { calories: number; carbohydrates: number; proteins: number; fats: number }
): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const newRecord = {
      user_id: userId,
      date: today,
      calories: Math.round(data.calories),
      carbohydrates: Math.round(data.carbohydrates),
      proteins: Math.round(data.proteins),
      fats: Math.round(data.fats)
    };

    // Usar upsert para inserir ou atualizar o registro
    const { error } = await supabase
      .from('weekly_summaries')
      .upsert(newRecord, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      throw error;
    }

    console.log('Resumo semanal salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar resumo semanal:', error);
    throw error;
  }
};