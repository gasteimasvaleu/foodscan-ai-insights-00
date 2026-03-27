import React, { useEffect } from 'react';
import { Heart, Footprints, Flame, RefreshCw, Scale, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HealthKitDashboardProps {
  dailySteps: number;
  dailyCalories: number;
  weight: number | null;
  isLoading: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
}

export const HealthKitDashboard: React.FC<HealthKitDashboardProps> = ({
  dailySteps,
  dailyCalories,
  weight,
  isLoading,
  onRefresh,
  onDisconnect,
}) => {
  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 p-1.5 rounded-lg">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <h3 className="font-bold text-foreground">Apple Health</h3>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
              Conectado
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDisconnect}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Unlink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center">
            <Footprints className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {isLoading ? '...' : dailySteps.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Passos hoje</div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {isLoading ? '...' : dailyCalories.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">kcal queimadas</div>
          </div>

          {weight !== null && (
            <div className="col-span-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 text-center">
              <Scale className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {isLoading ? '...' : `${weight.toFixed(1)} kg`}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Peso mais recente</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
