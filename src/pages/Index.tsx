
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

      // Enviando apenas como "value" único com prompt melhorado
      const payload = {
        value: base64Image,
        prompt: `Analise esta imagem de alimento com precisão e retorne APENAS um JSON válido no seguinte formato:

{
  "nome_alimento": "Nome específico do alimento identificado",
  "descricao": "Descrição detalhada do que você vê na imagem",
  "calorias": número_de_calorias_por_100g,
  "carboidratos": gramas_de_carboidratos_por_100g,
  "proteinas": gramas_de_proteinas_por_100g,
  "gorduras": gramas_de_gorduras_por_100g,
  "fibras": gramas_de_fibras_por_100g,
  "sodio": miligramas_de_sodio_por_100g
}

INSTRUÇÕES IMPORTANTES:
- Identifique com PRECISÃO o alimento na imagem
- Se for uma pizza, identifique os ingredientes visíveis (massa, queijo, calabresa, etc.)
- Se for uma refeição completa, foque no item principal
- Use valores nutricionais reais e precisos por 100g do alimento
- Todos os valores devem ser números (sem texto adicional)
- Não inclua explicações, apenas o JSON
- Se houver múltiplos alimentos, identifique o principal/maior`
      };

      console.log("=== ENVIANDO PARA WEBHOOK ===");
      console.log("URL do webhook:", webhookUrl);
      console.log("Enviando com prompt melhorado");

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

      const responseText = await response.text();
      console.log("=== RESPONSE TEXT COMPLETO ===");
      console.log("Resposta completa:", responseText);

      if (!response.ok) {
        console.error("Erro HTTP:", response.status, responseText);
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      if (!responseText || responseText.trim() === '') {
        console.error("Resposta vazia do servidor");
        throw new Error("Resposta vazia do servidor");
      }

      // Processar resposta da OpenAI
      const processedData = processOpenAIResponse(responseText);
      
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
      
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processOpenAIResponse = (responseText: string): NutritionData => {
    console.log("=== PROCESSANDO RESPOSTA DA OPENAI ===");
    
    // Tentar fazer parse como JSON primeiro
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("JSON parseado com sucesso:", data);
    } catch (parseError) {
      console.log("Não é JSON válido, processando como texto simples");
      // Se não for JSON, processar como texto
      data = parseTextResponse(responseText);
    }

    // Extrair informações nutricionais
    const processedData: NutritionData = {
      foodName: extractFoodName(data, responseText),
      description: extractDescription(data, responseText),
      nutrition: {
        calories: extractNutritionValue(data, responseText, ['calories', 'calorias', 'kcal']),
        carbohydrates: extractNutritionValue(data, responseText, ['carbohydrates', 'carboidratos', 'carbs']),
        proteins: extractNutritionValue(data, responseText, ['proteins', 'proteinas', 'protein']),
        fats: extractNutritionValue(data, responseText, ['fats', 'gorduras', 'fat', 'lipids']),
        fiber: extractNutritionValue(data, responseText, ['fiber', 'fibras', 'fibre']),
        sodium: extractNutritionValue(data, responseText, ['sodium', 'sodio', 'salt'])
      }
    };

    return processedData;
  };

  const parseTextResponse = (text: string) => {
    // Processar resposta como texto simples
    const lines = text.split('\n');
    const result: any = {};
    
    lines.forEach(line => {
      // Procurar por padrões como "Calorias: 250" ou "Proteínas: 15g"
      const match = line.match(/([^:]+):\s*(\d+(?:\.\d+)?)/i);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const value = parseFloat(match[2]);
        result[key] = value;
      }
    });
    
    return result;
  };

  const extractFoodName = (data: any, text: string): string => {
    if (data && typeof data === 'object') {
      return data.food_name || data.foodName || data.nome || data.alimento || "Alimento identificado";
    }
    
    // Tentar extrair do texto
    const foodMatch = text.match(/(?:alimento|food|nome):\s*([^\n]+)/i);
    return foodMatch ? foodMatch[1].trim() : "Alimento identificado";
  };

  const extractDescription = (data: any, text: string): string => {
    if (data && typeof data === 'object') {
      return data.description || data.descricao || data.analysis || "Informações nutricionais do alimento analisado.";
    }
    
    // Usar primeira linha como descrição se não encontrar
    const firstLine = text.split('\n')[0];
    return firstLine || "Informações nutricionais do alimento analisado.";
  };

  const extractNutritionValue = (data: any, text: string, keys: string[]): number => {
    // Primeiro tentar encontrar no objeto JSON
    if (data && typeof data === 'object') {
      for (const key of keys) {
        if (data[key] !== undefined) {
          return parseNutritionValue(data[key]);
        }
      }
    }
    
    // Tentar extrair do texto
    for (const key of keys) {
      const regex = new RegExp(`${key}[^\\d]*([\\d,\\.]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        return parseNutritionValue(match[1]);
      }
    }
    
    return 0;
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
