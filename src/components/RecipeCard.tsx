import { Clock, Users, Flame, Drumstick, Wheat, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RecipeCardProps {
  recipe: {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number;
    servings?: number;
    nutrition?: {
      nutrients: Array<{ name: string; amount: number; unit: string }>;
    };
  };
  onClick: (id: number) => void;
}

const getNutrient = (nutrients: Array<{ name: string; amount: number; unit: string }>, name: string) => {
  return nutrients?.find(n => n.name === name)?.amount ?? 0;
};

export const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
  const nutrients = recipe.nutrition?.nutrients || [];
  const calories = Math.round(getNutrient(nutrients, 'Calories'));
  const protein = Math.round(getNutrient(nutrients, 'Protein'));
  const carbs = Math.round(getNutrient(nutrients, 'Carbohydrates'));
  const fat = Math.round(getNutrient(nutrients, 'Fat'));

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-border/50"
      onClick={() => onClick(recipe.id)}
    >
      <div className="relative aspect-video">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {recipe.readyInMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {recipe.readyInMinutes} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {recipe.servings}
            </span>
          )}
        </div>

        {calories > 0 && (
          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold text-foreground">{calories}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">kcal</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Drumstick className="w-3 h-3 text-red-500" />
                <span className="text-xs font-bold text-foreground">{protein}g</span>
              </div>
              <span className="text-[10px] text-muted-foreground">prot</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Wheat className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-bold text-foreground">{carbs}g</span>
              </div>
              <span className="text-[10px] text-muted-foreground">carb</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Droplets className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-bold text-foreground">{fat}g</span>
              </div>
              <span className="text-[10px] text-muted-foreground">gord</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
