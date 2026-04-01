import React from 'react';
import { motion } from 'framer-motion';
import { ObjectiveProgress, OBJECTIVE_CATALOG, ObjectiveKey } from '@/hooks/useObjectives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, Cookie, Pizza, Candy, ShieldCheck, Apple, Dumbbell, Leaf, ChefHat } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Cookie, Pizza, Candy, ShieldCheck, Apple, Dumbbell, Leaf, ChefHat,
};

interface ObjectiveCardProps {
  data: ObjectiveProgress;
  onRemove: (id: string) => void;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ data, onRemove }) => {
  const catalog = OBJECTIVE_CATALOG[data.objective.objective_key as ObjectiveKey];
  const IconComponent = catalog ? ICON_MAP[catalog.icon] : Cookie;
  const color = catalog?.color || '#FD46A1';

  const isPositive = ['no_overeating', 'healthy_eating', 'start_exercising', 'home_cooking'].includes(data.objective.objective_key);

  // For limit goals: progress = current/target (over 100% is bad)
  // For positive goals: progress = current/target (over 100% is good)
  const progressPercent = data.targetValue > 0
    ? Math.min((data.currentValue / data.targetValue) * 100, 100)
    : 0;

  const statusLabel = data.isWithinGoal ? 'Meta cumprida ✅' : 'Meta não cumprida ❌';
  const unitLabel = data.objective.target_unit === 'per_week' ? '/semana' : '/dia';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#FFD1E7] rounded-3xl p-4 shadow-xl relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(data.objective.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {IconComponent && <IconComponent className="h-5 w-5" style={{ color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground truncate">{data.label}</h3>
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-semibold">
            {isPositive
              ? `${data.currentValue}/${data.targetValue} dias`
              : `${data.currentValue}/${data.targetValue} vezes`}
            <span className="text-xs text-muted-foreground ml-1">{unitLabel}</span>
          </span>
          <Badge
            variant={data.isWithinGoal ? 'default' : 'destructive'}
            className={data.isWithinGoal ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
          >
            {statusLabel}
          </Badge>
        </div>

        <Progress
          value={progressPercent}
          className="h-2.5 bg-white/60"
        />
      </div>
    </motion.div>
  );
};
