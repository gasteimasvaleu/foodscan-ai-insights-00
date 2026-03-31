import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Clock, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const RecentScans: React.FC = () => {
  const { user } = useAuth();

  const { data: recentMeals, isLoading } = useQuery({
    queryKey: ['recent-scans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('meal_records')
        .select('id, food_name, calories, created_at, image_url')
        .eq('user_id', user.id)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
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
            className="w-full flex flex-row items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/30 p-2 overflow-hidden"
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
    </div>
  );
};
