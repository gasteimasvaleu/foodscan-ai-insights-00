
import React, { useState } from 'react';
import { RotateCcw, Save, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortionSelector } from './PortionSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface NutritionData {
  foodName: string;
  description: string;
  quantity: string;
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

interface FoodNutritionResultsProps {
  data: NutritionData;
  onReset: () => void;
}

export const FoodNutritionResults: React.FC<FoodNutritionResultsProps> = ({ data, onReset }) => {
  const { user } = useAuth();
  const [currentPortion, setCurrentPortion] = useState<string>('');
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [isSaving, setIsSaving] = useState(false);

  const handlePortionChange = (portion: string, grams: number) => {
    setCurrentPortion(portion);
    setPortionGrams(grams);
  };

  const calculateNutrition = (baseValue: number) => {
    const multiplier = portionGrams / 100;
    return Math.round(baseValue * multiplier);
  };

  const calories = calculateNutrition(data.nutrition.calories);
  const carbohydrates = calculateNutrition(data.nutrition.carbohydrates);
  const proteins = calculateNutrition(data.nutrition.proteins);
  const fats = calculateNutrition(data.nutrition.fats);

  const handleSaveMeal = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: savedData, error } = await supabase.from('meal_records').insert([
        {
          food_name: data.foodName,
          calories: calories,
          carbohydrates: carbohydrates,
          proteins: proteins,
          fats: fats,
          portion: currentPortion || `${portionGrams}g`,
          meal_time: new Date().toLocaleTimeString(),
          user_id: user.id,
        },
      ]).select().single();

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Refeição salva com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar refeição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 rounded-full p-3">
          <Utensils className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{data.foodName}</h3>
          <p className="text-gray-600">{data.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <PortionSelector
          currentPortion={currentPortion}
          onPortionChange={handlePortionChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Calorias
          </h4>
          <div className="text-2xl font-bold text-red-600">{calories} kcal</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Carboidratos
          </h4>
          <div className="text-2xl font-bold text-orange-600">{carbohydrates} g</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Proteínas
          </h4>
          <div className="text-2xl font-bold text-blue-600">{proteins} g</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Gorduras
          </h4>
          <div className="text-2xl font-bold text-yellow-600">{fats} g</div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-xl px-6 py-3 font-semibold"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Nova Análise
        </Button>
        
        <Button
          onClick={handleSaveMeal}
          disabled={isSaving}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Salvando...
            </div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Salvar Refeição
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
