import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Scan } from 'lucide-react';

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

const LabelScan = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);

  const handleLabelAnalysis = async (imageFile: File) => {
    setIsAnalyzing(true);
    
    try {
      const base64Image = await convertToBase64(imageFile);
      
      const { data, error } = await supabase.functions.invoke('food-analysis', {
        body: {
          image: base64Image,
          type: 'label'
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro na análise');
      }

      setNutritionData(data);
      toast({
        title: "Rótulo analisado!",
        description: "Os valores nutricionais foram extraídos com sucesso.",
      });
    } catch (error) {
      console.error("Erro na análise do rótulo:", error);
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
      <div className="mb-6">
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Scan className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>Dica:</strong> Para melhores resultados, fotografe o rótulo com boa iluminação e certifique-se de que o texto esteja legível e completo.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ImageUpload onImageSelect={handleLabelAnalysis} />
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Os valores nutricionais serão extraídos exatamente conforme aparecem no rótulo
        </p>
      </div>
    </div>
  );
};

export default LabelScan;