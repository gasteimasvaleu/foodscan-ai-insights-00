
import React, { useState } from 'react';
import { CheckCircle, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortionSelector } from '@/components/PortionSelector';
import { NutritionData } from '@/types/nutrition';

interface NutritionResultsProps {
  data: NutritionData;
}

export const NutritionResults: React.FC<NutritionResultsProps> = ({ data }) => {
  const [selectedPortion, setSelectedPortion] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const adjustedData = {
    ...data,
    calories: Math.round(data.calories * selectedPortion),
    carbohydrates: Math.round(data.carbohydrates * selectedPortion),
    proteins: Math.round(data.proteins * selectedPortion),
    fats: Math.round(data.fats * selectedPortion),
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simular salvamento
    setTimeout(() => {
      setIsSaving(false);
      // Aqui você implementaria o salvamento real
    }, 1500);
  };

  const handleNewAnalysis = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Success Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
        <div className="space-y-4">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Análise Concluída!
            </h2>
            <p className="text-gray-600">
              Identificamos seu alimento com {data.confidence}% de precisão
            </p>
          </div>
        </div>
      </div>

      {/* Nutrition Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              {data.food_name}
            </h3>
            <p className="text-gray-600">
              Informações nutricionais por porção
            </p>
          </div>

          {/* Portion Selector */}
          <PortionSelector
            selectedPortion={selectedPortion}
            onPortionChange={setSelectedPortion}
          />

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-2xl">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {adjustedData.calories}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Calorias
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-2xl">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {adjustedData.carbohydrates}g
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Carboidratos
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {adjustedData.proteins}g
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Proteínas
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-2xl">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {adjustedData.fats}g
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                Gorduras
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Refeição"}
            </Button>
            
            <Button
              onClick={handleNewAnalysis}
              variant="outline"
              className="flex-1 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 rounded-xl py-3 text-lg font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Nova Análise
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
