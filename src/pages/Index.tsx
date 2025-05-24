
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
      // Validar arquivo antes de enviar
      if (imageFile.size > 10 * 1024 * 1024) { // 10MB
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
      console.log("URL:", webhookUrl);
      console.log("Payload criado:");
      console.log("- image_name:", payload.image_name);
      console.log("- timestamp:", payload.timestamp);
      console.log("- user_id:", payload.user_id);
      console.log("- image_data length:", payload.image_data.length);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };

      console.log("Fazendo requisição...");
      const response = await fetch(webhookUrl, requestOptions);

      console.log("=== RESPOSTA RECEBIDA ===");
      console.log("Status:", response.status);
      console.log("Status text:", response.statusText);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      // Ler o response uma única vez
      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (!response.ok) {
        console.error("=== ERRO HTTP ===");
        console.error("Status:", response.status);
        console.error("Response:", responseText);
        
        let errorMessage = `Erro ${response.status}`;
        if (responseText) {
          errorMessage += `: ${responseText}`;
        }
        
        // Mensagens específicas para erros comuns
        if (response.status === 500) {
          errorMessage = "Erro interno do servidor Make.com. Verifique se o cenário está configurado corretamente.";
        } else if (response.status === 404) {
          errorMessage = "Webhook não encontrado. Verifique a URL do Make.com.";
        } else if (response.status === 413) {
          errorMessage = "Imagem muito grande. Tente com uma imagem menor.";
        }
        
        throw new Error(errorMessage);
      }

      console.log("=== PROCESSANDO RESPOSTA ===");
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("JSON parsed com sucesso:", data);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        console.error("Response text era:", responseText);
        
        // Se não conseguir fazer parse, vamos tentar usar a resposta como texto
        if (responseText.trim()) {
          console.log("Tentando processar como texto simples...");
          data = { message: responseText };
        } else {
          throw new Error("Resposta vazia do servidor");
        }
      }

      // Processar dados de forma mais flexível
      console.log("Tentando extrair dados nutricionais...");
      
      const processedData: NutritionData = {
        foodName: data.alimento || data.foodName || data.food || data.nome || "Alimento identificado",
        description: data.descricao || data.description || data.message || "Informações nutricionais do alimento analisado.",
        nutrition: {
          calories: parseNutritionValue(data.calorias || data.calories || 0),
          carbohydrates: parseNutritionValue(data.carboidratos || data.carbohydrates || 0),
          proteins: parseNutritionValue(data.proteinas || data.proteins || 0),
          fats: parseNutritionValue(data.gorduras || data.fats || 0),
          fiber: parseNutritionValue(data.fibras || data.fiber || 0),
          sodium: parseNutritionValue(data.sodio || data.sodium || 0)
        }
      };

      console.log("=== DADOS PROCESSADOS ===");
      console.log("Dados finais:", processedData);

      setNutritionData(processedData);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram identificados com sucesso.",
      });

    } catch (error) {
      console.error("=== ERRO COMPLETO ===");
      console.error("Tipo do erro:", typeof error);
      console.error("Erro:", error);
      
      let errorMessage = "Erro desconhecido na análise da imagem.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Stack trace:", error.stack);
      }
      
      console.error("Mensagem final do erro:", errorMessage);
      
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("=== FINALIZANDO ANÁLISE ===");
      setIsAnalyzing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log("Iniciando conversão para base64...");
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result) {
          console.log("Conversão base64 concluída com sucesso");
          resolve(reader.result as string);
        } else {
          console.error("Resultado da conversão é null");
          reject(new Error("Erro ao converter imagem para base64"));
        }
      };
      
      reader.onerror = (error) => {
        console.error("Erro no FileReader:", error);
        reject(new Error("Erro ao ler arquivo de imagem"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleReset = () => {
    console.log("Resetando aplicação...");
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
