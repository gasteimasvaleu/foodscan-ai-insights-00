
import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { NutritionResults } from '@/components/NutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';

export interface NutritionData {
  foodName: string;
  description: string;
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const webhookUrl = 'https://hook.us2.make.com/wc5k9emyfv4xn9650bufvdwyi1drenof';

  const parseNutritionValue = (value: any): number => {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      // Remove unidades como "kcal", "g", "mg" e converte para número
      const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
  };

  const handleImageAnalysis = async (imageFile: File) => {
    setIsAnalyzing(true);
    console.log("Iniciando análise da imagem:", imageFile.name);

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(imageFile);
      
      const payload = {
        image_data: base64Image,
        image_name: imageFile.name,
        timestamp: new Date().toISOString(),
        user_id: "user_" + Date.now()
      };

      console.log("Enviando dados para webhook:", webhookUrl);
      console.log("Payload preparado, tamanho:", JSON.stringify(payload).length);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro HTTP:", response.status, errorText);
        throw new Error(`Erro do servidor (${response.status}): ${errorText}`);
      }

      const responseText = await response.text();
      console.log("Response recebida:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("JSON parsed:", data);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Resposta inválida do servidor");
      }

      // Simplificar o processamento dos dados
      let processedData: NutritionData | null = null;

      if (data && typeof data === 'object') {
        console.log("Processando dados recebidos...");
        
        // Criar dados padrão com fallbacks seguros
        processedData = {
          foodName: data.alimento || data.foodName || data.food || data.name || "Alimento identificado",
          description: data.descricao || data.description || "Informações nutricionais do alimento identificado.",
          nutrition: {
            calories: parseNutritionValue(data.calorias || data.calories || data.nutrientes?.calorias || 0),
            carbohydrates: parseNutritionValue(data.carboidratos || data.carbohydrates || data.nutrientes?.carboidratos || 0),
            proteins: parseNutritionValue(data.proteinas || data.proteins || data.nutrientes?.proteinas || 0),
            fats: parseNutritionValue(data.gorduras || data.fats || data.nutrientes?.gorduras || 0),
            fiber: parseNutritionValue(data.fibras || data.fiber || data.nutrientes?.fibras || 0),
            sodium: parseNutritionValue(data.sodio || data.sodium || data.nutrientes?.sodio || 0)
          }
        };

        console.log("Dados processados:", processedData);
      }

      if (processedData) {
        setNutritionData(processedData);
        
        toast({
          title: "Análise concluída!",
          description: "Os dados nutricionais foram identificados com sucesso.",
        });
      } else {
        console.error("Não foi possível processar os dados:", data);
        throw new Error("Dados nutricionais não encontrados na resposta");
      }

    } catch (error) {
      console.error("Erro completo:", error);
      
      let errorMessage = "Erro desconhecido na análise da imagem.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Erro ao converter imagem"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    });
  };

  const handleReset = () => {
    setNutritionData(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary font-inter">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Content */}
          {isAnalyzing ? (
            <LoadingState />
          ) : nutritionData ? (
            <NutritionResults data={nutritionData} onReset={handleReset} />
          ) : (
            <div className="space-y-8">
              <EmptyState />
              <ImageUpload onImageSelect={handleImageAnalysis} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
