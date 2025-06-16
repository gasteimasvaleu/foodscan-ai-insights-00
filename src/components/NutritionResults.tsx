
import React, { useState, useMemo } from 'react';
import { RotateCcw, Award, Info, Scale, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortionSelector } from '@/components/PortionSelector';
import { NutritionData } from '@/pages/Index';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface NutritionResultsProps {
  data: NutritionData;
  onReset: () => void;
}

export const NutritionResults: React.FC<NutritionResultsProps> = ({ data, onReset }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPortion, setSelectedPortion] = useState<string>(data.quantity);
  const [selectedGrams, setSelectedGrams] = useState<number>(100);
  const [isRegistering, setIsRegistering] = useState(false);

  // Extrair o valor numérico da quantidade original para calcular proporções
  const originalGrams = useMemo(() => {
    const match = data.quantity.match(/(\d+)/);
    return match ? parseInt(match[1]) : 100;
  }, [data.quantity]);

  // Calcular valores nutricionais ajustados
  const adjustedNutrition = useMemo(() => {
    const ratio = selectedGrams / originalGrams;
    return {
      calories: Math.round(data.nutrition.calories * ratio),
      carbohydrates: Math.round(data.nutrition.carbohydrates * ratio * 10) / 10,
      proteins: Math.round(data.nutrition.proteins * ratio * 10) / 10,
      fats: Math.round(data.nutrition.fats * ratio * 10) / 10,
      fiber: Math.round(data.nutrition.fiber * ratio * 10) / 10,
      sodium: Math.round(data.nutrition.sodium * ratio),
    };
  }, [data.nutrition, selectedGrams, originalGrams]);

  const handlePortionChange = (portion: string, grams: number) => {
    setSelectedPortion(portion);
    setSelectedGrams(grams);
  };

  const nutritionItems = [
    { label: 'Calorias', value: adjustedNutrition.calories, unit: 'kcal', color: 'text-red-600' },
    { label: 'Carboidratos', value: adjustedNutrition.carbohydrates, unit: 'g', color: 'text-orange-600' },
    { label: 'Proteínas', value: adjustedNutrition.proteins, unit: 'g', color: 'text-blue-600' },
    { label: 'Gorduras', value: adjustedNutrition.fats, unit: 'g', color: 'text-yellow-600' },
    { label: 'Fibras', value: adjustedNutrition.fiber, unit: 'g', color: 'text-green-600' },
    { label: 'Sódio', value: adjustedNutrition.sodium, unit: 'mg', color: 'text-purple-600' },
  ];

  const handleRegisterMeal = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar refeições.",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      const mealData = {
        food_name: data.foodName,
        calories: adjustedNutrition.calories,
        carbohydrates: adjustedNutrition.carbohydrates,
        proteins: adjustedNutrition.proteins,
        fats: adjustedNutrition.fats,
        portion: `${selectedPortion} (${selectedGrams}g)`,
        meal_time: new Date().toISOString(),
        user_id: user.id,
      };

      const { error } = await supabase
        .from('meal_records')
        .insert([mealData]);

      if (error) throw error;

      toast({
        title: "Refeição registrada!",
        description: "Sua refeição foi adicionada ao controle diário.",
      });

      // Navegar para a página de controle diário
      navigate('/controle-diario');
    } catch (error) {
      console.error('Erro ao registrar refeição:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar refeição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Header */}
      <div className="bg-success-50 border border-success-200 rounded-3xl p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-success-100 rounded-full p-3">
            <Award className="w-8 h-8 text-success-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-success-800 mb-2">
          Análise Concluída!
        </h2>
        <p className="text-success-700">
          Identificamos seu alimento e coletamos informações nutricionais detalhadas
        </p>
      </div>

      {/* Food Identification */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-gray-800">
            {data.foodName}
          </h3>
          <div className="flex items-start justify-center space-x-2 max-w-2xl mx-auto">
            <Info className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-600 leading-relaxed">
              {data.description}
            </p>
          </div>
        </div>
      </div>

      {/* Quantity Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-blue-100 rounded-full p-3">
            <Scale className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-semibold text-blue-800">
              Porção de Referência Original
            </h4>
            <p className="text-2xl font-bold text-blue-700">
              {data.quantity}
            </p>
            <p className="text-sm text-blue-600">
              Valores nutricionais da análise original
            </p>
          </div>
        </div>
      </div>

      {/* Portion Selector */}
      <PortionSelector
        currentPortion={selectedPortion}
        onPortionChange={handlePortionChange}
      />

      {/* Current Portion Display */}
      <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="bg-green-100 rounded-full p-3">
            <Scale className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-semibold text-green-800">
              Porção Selecionada
            </h4>
            <p className="text-2xl font-bold text-green-700">
              {selectedPortion} ({selectedGrams}g)
            </p>
            <p className="text-sm text-green-600">
              Os valores nutricionais abaixo são referentes a esta porção
            </p>
          </div>
        </div>
      </div>

      {/* Nutrition Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
        <h4 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Informações Nutricionais
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nutritionItems.map((item, index) => (
            <div
              key={item.label}
              className="bg-gradient-card border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {item.label}
                </h5>
                <div className="space-y-1">
                  <span className={`text-3xl font-bold ${item.color}`}>
                    {item.value}
                  </span>
                  <span className="text-lg text-gray-500 ml-1">
                    {item.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Table for larger screens */}
        <div className="hidden lg:block mt-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Nutriente
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Quantidade
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Unidade
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Porção ({selectedPortion})
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nutritionItems.map((item, index) => (
                  <tr key={item.label} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.label}
                    </td>
                    <td className={`px-6 py-4 text-center text-lg font-bold ${item.color}`}>
                      {item.value}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {selectedPortion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onReset}
          variant="outline"
          className="rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Analisar Outro Alimento
        </Button>
        
        <Button
          onClick={handleRegisterMeal}
          disabled={isRegistering || !user}
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isRegistering ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registrando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Refeição
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
