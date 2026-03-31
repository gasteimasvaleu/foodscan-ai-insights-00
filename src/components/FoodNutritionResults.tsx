import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortionSelector } from './PortionSelector';
import { MultipleElementsPortionSelector } from './MultipleElementsPortionSelector';
import { FoodDetailsCard } from './FoodDetailsCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { NutritionData, ElementPortion } from '@/types/nutrition';
import { MealTypeSelector } from './MealTypeSelector';

interface FoodNutritionResultsProps {
  data: NutritionData;
  onReset: () => void;
}

export const FoodNutritionResults: React.FC<FoodNutritionResultsProps> = ({ data, onReset }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPortion, setCurrentPortion] = useState<string>('');
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [elementPortions, setElementPortions] = useState<ElementPortion[]>([]);
  const [mealType, setMealType] = useState<string>('almoco');
  const [isSaving, setIsSaving] = useState(false);

  const hasMultipleElements = data.elements && data.elements.length > 1;
  
  console.log("=== FOODNUTRITIONRESULTS DEBUG ===");
  console.log("data.elements:", data.elements);  
  console.log("hasMultipleElements:", hasMultipleElements);

  // Inicializar porções padrão para elementos múltiplos (100g cada)
  useEffect(() => {
    if (hasMultipleElements && data.elements && elementPortions.length === 0) {
      const defaultPortions: ElementPortion[] = data.elements.map(element => ({
        elementName: element.name,
        portion: `${element.estimated_weight || 100}g`,
        grams: element.estimated_weight || 100
      }));
      setElementPortions(defaultPortions);
    }
  }, [hasMultipleElements, data.elements, elementPortions.length]);

  const handlePortionChange = (portion: string, grams: number) => {
    setCurrentPortion(portion);
    setPortionGrams(grams);
  };

  const handleElementPortionsChange = (portions: ElementPortion[]) => {
    setElementPortions(portions);
  };

  const calculateNutrition = (baseValue: number) => {
    const multiplier = portionGrams / 100;
    return Math.round(baseValue * multiplier);
  };

  const calculateMultipleElementsNutrition = () => {
    if (!hasMultipleElements || !data.elements) {
      // Fallback para elemento único
      return {
        calories: calculateNutrition(data.nutrition.calories),
        carbohydrates: calculateNutrition(data.nutrition.carbohydrates),
        proteins: calculateNutrition(data.nutrition.proteins),
        fats: calculateNutrition(data.nutrition.fats)
      };
    }

    let totalCalories = 0;
    let totalCarbohydrates = 0;
    let totalProteins = 0;
    let totalFats = 0;

    data.elements.forEach((element, index) => {
      const portion = elementPortions[index];
      if (portion) {
        const multiplier = portion.grams / 100;
        totalCalories += Math.round(element.nutrition.calories * multiplier);
        totalCarbohydrates += Math.round(element.nutrition.carbohydrates * multiplier);
        totalProteins += Math.round(element.nutrition.proteins * multiplier);
        totalFats += Math.round(element.nutrition.fats * multiplier);
      }
    });

    return {
      calories: totalCalories,
      carbohydrates: totalCarbohydrates,
      proteins: totalProteins,
      fats: totalFats
    };
  };

  // Usar useMemo para recalcular automaticamente quando as porções mudarem
  const nutritionValues = useMemo(() => {
    return calculateMultipleElementsNutrition();
  }, [hasMultipleElements, data.elements, elementPortions, portionGrams, data.nutrition]);
  
  const { calories, carbohydrates, proteins, fats } = nutritionValues;

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
          portion: hasMultipleElements 
            ? elementPortions.map(ep => `${ep.elementName}: ${ep.portion}`).join(', ')
            : currentPortion || `${portionGrams}g`,
          meal_time: new Date().toISOString(),
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

      // Redirecionar para a página de Controle Diário
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
    }
  };

  return (
    <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{data.foodName}</h3>
          <p className="text-gray-600">{data.description}</p>
        </div>

      {hasMultipleElements && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Múltiplos elementos identificados</p>
              <p>Os valores nutricionais são calculados com base em 100g de cada elemento. Você pode ajustar as porções individuais no card abaixo para obter valores mais precisos.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        {hasMultipleElements ? (
          <MultipleElementsPortionSelector
            elements={data.elements || []}
            onPortionsChange={handleElementPortionsChange}
          />
        ) : (
          <PortionSelector
            currentPortion={currentPortion}
            onPortionChange={handlePortionChange}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Calorias
          </h4>
          <div className="text-2xl font-bold text-[#FD46A1]">{calories} kcal</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Carboidratos
          </h4>
          <div className="text-2xl font-bold text-[#FD46A1]">{carbohydrates} g</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Proteínas
          </h4>
          <div className="text-2xl font-bold text-[#FD46A1]">{proteins} g</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Gorduras
          </h4>
          <div className="text-2xl font-bold text-[#FD46A1]">{fats} g</div>
        </div>
      </div>

      {/* Card de Detalhes Expandível */}
        <FoodDetailsCard 
          elements={data.elements || data.foods_identified} 
          analysisData={{
            analysis_summary: data.analysis_summary,
            overall_confidence: data.overall_confidence,
            total_estimated_weight: data.total_estimated_weight,
            cuisine_analysis: data.cuisine_analysis,
            comprehensive_observations: data.comprehensive_observations,
            dietary_compatibility: data.dietary_compatibility,
            serving_context: data.serving_context
          }}
        />

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-xl px-6 py-3 font-semibold w-full sm:w-auto"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Nova Análise
        </Button>
        
        <Button
          onClick={handleSaveMeal}
          disabled={isSaving}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
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
