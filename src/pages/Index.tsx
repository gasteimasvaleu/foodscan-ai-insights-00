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

  const parseNutritionValue = (value: string): number => {
    // Remove unidades como "kcal", "g", "mg" e converte para número
    const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
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

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta recebida do webhook:", data);

      // Processar a resposta do Make.com que vem no formato específico
      if (data && data.status === "sucesso" && data.alimento && data.nutrientes) {
        const processedData: NutritionData = {
          foodName: data.alimento,
          description: data.descricao || "Informações nutricionais do alimento identificado.",
          nutrition: {
            calories: parseNutritionValue(data.nutrientes.calorias || "0"),
            carbohydrates: parseNutritionValue(data.nutrientes.carboidratos || "0"),
            proteins: parseNutritionValue(data.nutrientes.proteinas || "0"),
            fats: parseNutritionValue(data.nutrientes.gorduras || "0"),
            fiber: parseNutritionValue(data.nutrientes.fibras || "0"),
            sodium: parseNutritionValue(data.nutrientes.sodio || "0")
          }
        };

        setNutritionData(processedData);
        
        toast({
          title: "Análise concluída!",
          description: "Os dados nutricionais foram identificados com sucesso.",
        });
      } else {
        console.error("Formato de resposta inesperado:", data);
        throw new Error("Resposta do webhook não contém dados válidos");
      }

    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a imagem. Verifique se o webhook está configurado corretamente.",
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
