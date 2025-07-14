import React, { useState } from 'react';
import { RotateCcw, Save, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortionSelector } from './PortionSelector';

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
  const [selectedPortion, setSelectedPortion] = useState<string>('100g');
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);

  const handlePortionChange = (portion: string, grams: number) => {
    setSelectedPortion(portion);
    // Calcula o multiplicador baseado nos gramas (assumindo 100g como base)
    const multiplier = grams / 100;
    setPortionMultiplier(multiplier);
  };

  const adjustedNutrition = {
    calories: Math.round(data.nutrition.calories * portionMultiplier),
    carbohydrates: Math.round(data.nutrition.carbohydrates * portionMultiplier * 10) / 10,
    proteins: Math.round(data.nutrition.proteins * portionMultiplier * 10) / 10,
    fats: Math.round(data.nutrition.fats * portionMultiplier * 10) / 10,
    fiber: Math.round(data.nutrition.fiber * portionMultiplier * 10) / 10,
    sodium: Math.round(data.nutrition.sodium * portionMultiplier)
  };

  const handleSave = async () => {
    console.log('Dados nutricionais salvos:', {
      foodName: data.foodName,
      portion: selectedPortion,
      nutrition: adjustedNutrition
    });
    // Aqui você pode adicionar a lógica para salvar os dados
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-primary-300" />
          Análise Nutricional
        </h3>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="text-white border-white/30 hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Nova Análise
        </Button>
      </div>

      <div className="space-y-6">
        {/* Food Information */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="font-medium text-white mb-2">{data.foodName}</h4>
          <p className="text-white/80 text-sm">{data.description}</p>
          <p className="text-white/60 text-sm mt-2">Quantidade: {data.quantity}</p>
        </div>

        {/* Portion Selector */}
        <PortionSelector
          currentPortion={selectedPortion}
          onPortionChange={handlePortionChange}
        />

        {/* Nutrition Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-white/80 text-sm">Calorias</p>
            <p className="text-2xl font-bold text-white">{adjustedNutrition.calories}</p>
            <p className="text-white/60 text-xs">kcal</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-white/80 text-sm">Carboidratos</p>
            <p className="text-2xl font-bold text-white">{adjustedNutrition.carbohydrates}</p>
            <p className="text-white/60 text-xs">g</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-white/80 text-sm">Proteínas</p>
            <p className="text-2xl font-bold text-white">{adjustedNutrition.proteins}</p>
            <p className="text-white/60 text-xs">g</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-white/80 text-sm">Gorduras</p>
            <p className="text-2xl font-bold text-white">{adjustedNutrition.fats}</p>
            <p className="text-white/60 text-xs">g</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-white/80 text-sm">Fibras</p>
            <p className="text-2xl font-bold text-white">{adjustedNutrition.fiber}</p>
            <p className="text-white/60 text-xs">g</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-white/80 text-sm">Sódio</p>
            <p className="text-2xl font-bold text-white">{adjustedNutrition.sodium}</p>
            <p className="text-white/60 text-xs">mg</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar no Histórico
          </Button>
        </div>
      </div>
    </div>
  );
};