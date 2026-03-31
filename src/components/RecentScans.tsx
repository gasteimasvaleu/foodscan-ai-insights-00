import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface MealRecord {
  id: string;
  food_name: string;
  calories: number;
  created_at: string;
  image_url: string | null;
  proteins: number;
  carbohydrates: number;
  fats: number;
  portion: string;
  meal_type: string | null;
  meal_time: string;
}

const mealTypeLabels: Record<string, string> = {
  cafe_da_manha: 'Café da Manhã',
  almoco: 'Almoço',
  jantar: 'Jantar',
  lanche: 'Lanche',
  outro: 'Outro',
};

export const RecentScans: React.FC = () => {
  const { user } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState<MealRecord | null>(null);

  const { data: recentMeals, isLoading } = useQuery({
    queryKey: ['recent-scans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('meal_records')
        .select('id, food_name, calories, created_at, image_url, proteins, carbohydrates, fats, portion, meal_type, meal_time')
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []) as MealRecord[];
    },
    enabled: !!user,
  });

  if (isLoading || !recentMeals || recentMeals.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 px-1">
        Últimas Análises
      </h3>
      <div className="flex flex-col gap-3">
        {recentMeals.map((meal) => (
          <div
            key={meal.id}
            onClick={() => setSelectedMeal(meal)}
            className="w-full flex flex-row items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/30 p-2 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          >
            <img
              src={meal.image_url!}
              alt={meal.food_name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {meal.food_name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {meal.calories} kcal
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(meal.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl p-0 gap-0">
          <DialogTitle className="sr-only">Detalhes da refeição</DialogTitle>
          {selectedMeal && (
            <div className="flex flex-col">
              {selectedMeal.image_url && (
                <img
                  src={selectedMeal.image_url}
                  alt={selectedMeal.food_name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
              )}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedMeal.food_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {selectedMeal.meal_type && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                        {mealTypeLabels[selectedMeal.meal_type] || selectedMeal.meal_type}
                      </span>
                    )}
                    <span>{selectedMeal.portion}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Calorias</p>
                      <p className="text-sm font-bold text-foreground">{selectedMeal.calories} kcal</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 rounded-xl p-3">
                    <Beef className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Proteínas</p>
                      <p className="text-sm font-bold text-foreground">{selectedMeal.proteins}g</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3">
                    <Wheat className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Carboidratos</p>
                      <p className="text-sm font-bold text-foreground">{selectedMeal.carbohydrates}g</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gorduras</p>
                      <p className="text-sm font-bold text-foreground">{selectedMeal.fats}g</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {format(new Date(selectedMeal.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
