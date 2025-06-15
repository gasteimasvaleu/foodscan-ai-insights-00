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
  const webhookUrl = 'https://hook.us2.make.com/nlo14ull4syuj9t7nip92nukiegg1n2g';

  const parseNutritionValue = (value: any): number => {
    console.log("Parsing nutrition value:", value, "Type:", typeof value);
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
  };

  const handleImageAnalysis = async (imageFile: File) => {
    setIsAnalyzing(true);
    console.log("=== INICIANDO ANÁLISE ===");
    console.log("Nome do arquivo:", imageFile.name);
    console.log("Tamanho do arquivo:", imageFile.size, "bytes");
    console.log("Tipo do arquivo:", imageFile.type);

    try {
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error("Arquivo muito grande (máximo 10MB)");
      }

      console.log("Convertendo imagem para base64...");
      const base64Image = await convertToBase64(imageFile);
      console.log("Base64 gerado, tamanho:", base64Image.length);

      const payload = {
        image_data: base64Image,
        image_name: imageFile.name,
        timestamp: new Date().toISOString(),
        user_id: "user_" + Date.now()
      };

      console.log("=== ENVIANDO PARA WEBHOOK ===");
      console.log("URL do webhook:", webhookUrl);
      console.log("Payload keys:", Object.keys(payload));

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("=== RESPOSTA RECEBIDA ===");
      console.log("Status:", response.status);
      console.log("Status OK:", response.ok);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("=== RESPONSE TEXT COMPLETO ===");
      console.log("Tipo de resposta:", typeof responseText);
      console.log("Tamanho da resposta:", responseText.length);
      console.log("Primeiros 500 caracteres:", responseText.substring(0, 500));
      console.log("Últimos 500 caracteres:", responseText.substring(Math.max(0, responseText.length - 500)));
      console.log("Resposta completa:", responseText);

      if (!response.ok) {
        console.error("Erro HTTP:", response.status, responseText);
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      // Verificar se a resposta está vazia
      if (!responseText || responseText.trim() === '') {
        console.error("Resposta vazia do servidor");
        throw new Error("Resposta vazia do servidor");
      }

      let data;
      try {
        console.log("=== TENTANDO FAZER PARSE DO JSON ===");
        data = JSON.parse(responseText);
        console.log("=== JSON PARSEADO COM SUCESSO ===");
        console.log("Tipo de data:", typeof data);
        console.log("Data é array:", Array.isArray(data));
        console.log("Keys de data:", Object.keys(data));
        console.log("Data completo:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error("=== ERRO AO FAZER PARSE DO JSON ===");
        console.error("Erro de parse:", parseError);
        console.error("Response text que causou o erro:", responseText);
        throw new Error(`Resposta inválida do servidor - não é um JSON válido: ${parseError}`);
      }

      // Verificar se data é válido
      if (!data || typeof data !== 'object') {
        console.error("Data não é um objeto válido:", data);
        throw new Error("Resposta do servidor não contém dados válidos");
      }

      // Processar os dados recebidos do webhook com logs detalhados
      console.log("=== PROCESSANDO DADOS RECEBIDOS ===");
      console.log("Procurando food_name em:", data.food_name);
      console.log("Procurando foodName em:", data.foodName);
      console.log("Procurando alimento em:", data.alimento);

      const processedData: NutritionData = {
        foodName: data.food_name || data.foodName || data.alimento || "Alimento identificado",
        description: data.description || data.descricao || data.analysis || "Informações nutricionais do alimento analisado.",
        nutrition: {
          calories: parseNutritionValue(data.calories || data.calorias || 0),
          carbohydrates: parseNutritionValue(data.carbohydrates || data.carboidratos || 0),
          proteins: parseNutritionValue(data.proteins || data.proteinas || 0),
          fats: parseNutritionValue(data.fats || data.gorduras || 0),
          fiber: parseNutritionValue(data.fiber || data.fibras || 0),
          sodium: parseNutritionValue(data.sodium || data.sodio || 0)
        }
      };

      console.log("=== DADOS FINAIS PROCESSADOS ===");
      console.log("Dados finais:", JSON.stringify(processedData, null, 2));

      setNutritionData(processedData);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram identificados com sucesso.",
      });

    } catch (error) {
      console.error("=== ERRO COMPLETO ===");
      console.error("Erro:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A');
      
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
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
          const base64String = reader.result as string;
          const base64Pure = base64String.split(',')[1];
          resolve(base64Pure);
        } else {
          reject(new Error("Erro ao converter imagem para base64"));
        }
      };
      
      reader.onerror = (error) => {
        reject(new Error("Erro ao ler arquivo de imagem"));
      };
      
      reader.readAsDataURL(file);
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
