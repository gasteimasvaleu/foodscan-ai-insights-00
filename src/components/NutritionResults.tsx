import React, { useState } from 'react';
import { Save, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortionSelector } from './PortionSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHealthKit } from '@/hooks/useHealthKit';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MealTypeSelector } from './MealTypeSelector';

interface NutritionData {
  nome_alimento: string;
  descricao: string;
  quantidade_referencia: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  fibras: number;
  sodio: number;
}

interface NutritionResultsProps {
  nutritionData: NutritionData;
  onSave?: () => void;
  onClose?: () => void;
}

export const NutritionResults: React.FC<NutritionResultsProps> = ({ nutritionData, onSave, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnected: hkConnected, saveMealCalories } = useHealthKit();
  const [currentPortion, setCurrentPortion] = useState<string>('');
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [mealType, setMealType] = useState<string>('almoco');
  const [isSaving, setIsSaving] = useState(false);

  const handlePortionChange = (portion: string, grams: number) => {
    setCurrentPortion(portion);
    setPortionGrams(grams);
  };

  const calculateNutrition = (baseValue: number) => {
    const multiplier = portionGrams / 100;
    return Math.round(baseValue * multiplier);
  };

  const calories = calculateNutrition(nutritionData.calorias);
  const carbohydrates = calculateNutrition(nutritionData.carboidratos);
  const proteins = calculateNutrition(nutritionData.proteinas);
  const fats = calculateNutrition(nutritionData.gorduras);

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
      const { data, error } = await supabase.from('meal_records').insert([
        {
          food_name: nutritionData.nome_alimento,
          calories: calories,
          carbohydrates: carbohydrates,
          proteins: proteins,
          fats: fats,
          portion: currentPortion || `${portionGrams}g`,
          meal_time: new Date().toISOString(),
          meal_type: mealType,
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

      // Sync with Apple Health if connected
      if (hkConnected) {
        const saved = await saveMealCalories(calories);
        if (saved) {
          toast({
            title: "🍎 Apple Health",
            description: "Calorias sincronizadas com Apple Health",
          });
        }
      }

      onSave?.();
      navigate('/controle-diario');

    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar refeição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      onClose?.();
    }
  };

  return (
    <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 rounded-full p-3">
          <Utensils className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{nutritionData.nome_alimento}</h3>
          <p className="text-gray-600">{nutritionData.descricao}</p>
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

      <MealTypeSelector value={mealType} onChange={setMealType} />

      <div className="flex justify-center">
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
