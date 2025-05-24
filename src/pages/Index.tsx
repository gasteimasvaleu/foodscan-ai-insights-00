
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
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove unidades como "kcal", "g", "mg" e converte para número
      const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      return parseFloat(numericValue) || 0;
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
      console.log("Payload size:", JSON.stringify(payload).length);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Response raw text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        throw new Error("Resposta não é um JSON válido");
      }

      console.log("Resposta parsed:", data);

      // Tentar diferentes formatos de resposta
      let processedData: NutritionData | null = null;

      // Formato 1: Resposta direta do Make.com
      if (data && data.status === "sucesso" && data.alimento && data.nutrientes) {
        console.log("Processando formato 1 - Make.com direto");
        processedData = {
          foodName: data.alimento,
          description: data.descricao || "Informações nutricionais do alimento identificado.",
          nutrition: {
            calories: parseNutritionValue(data.nutrientes.calorias),
            carbohydrates: parseNutritionValue(data.nutrientes.carboidratos),
            proteins: parseNutritionValue(data.nutrientes.proteinas),
            fats: parseNutritionValue(data.nutrientes.gorduras),
            fiber: parseNutritionValue(data.nutrientes.fibras),
            sodium: parseNutritionValue(data.nutrientes.sodio)
          }
        };
      }
      // Formato 2: Resposta já no formato esperado
      else if (data && data.foodName && data.nutrition) {
        console.log("Processando formato 2 - Formato direto");
        processedData = data;
      }
      // Formato 3: Resposta com outros campos possíveis
      else if (data && (data.food || data.name || data.alimento)) {
        console.log("Processando formato 3 - Campos alternativos");
        const foodName = data.food || data.name || data.alimento || "Alimento não identificado";
        processedData = {
          foodName,
          description: data.description || data.descricao || "Informações nutricionais identificadas.",
          nutrition: {
            calories: parseNutritionValue(data.calories || data.calorias || 0),
            carbohydrates: parseNutritionValue(data.carbohydrates || data.carboidratos || 0),
            proteins: parseNutritionValue(data.proteins || data.proteinas || 0),
            fats: parseNutritionValue(data.fats || data.gorduras || 0),
            fiber: parseNutritionValue(data.fiber || data.fibras || 0),
            sodium: parseNutritionValue(data.sodium || data.sodio || 0)
          }
        };
      }

      if (processedData) {
        console.log("Dados processados com sucesso:", processedData);
        setNutritionData(processedData);
        
        toast({
          title: "Análise concluída!",
          description: "Os dados nutricionais foram identificados com sucesso.",
        });
      } else {
        console.error("Nenhum formato de resposta reconhecido:", data);
        throw new Error("Formato de resposta não reconhecido");
      }

    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido na análise da imagem.",
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
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
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
