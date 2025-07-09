import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NutritionData {
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

const FoodAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);

  const handleImageAnalysis = async (imageFile: File) => {
    setIsAnalyzing(true);
    
    try {
      const base64Image = await convertToBase64(imageFile);
      
      const { data, error } = await supabase.functions.invoke('food-analysis', {
        body: {
          image: base64Image,
          type: 'food'
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro na análise');
      }

      setNutritionData(data);
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram identificados com sucesso."
      });
    } catch (error) {
      console.error("Erro na análise:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Erro ao converter imagem para base64"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo de imagem"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReset = () => {
    setNutritionData(null);
    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    return <LoadingState />;
  }

  if (nutritionData) {
    return <FoodNutritionResults data={nutritionData} onReset={handleReset} />;
  }

  return (
    <div className="space-y-6">
      <ImageUpload onImageSelect={handleImageAnalysis} />
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Nossa IA analisará a imagem e fornecerá estimativas nutricionais do alimento
        </p>
      </div>
    </div>
  );
};

export default FoodAnalysis;