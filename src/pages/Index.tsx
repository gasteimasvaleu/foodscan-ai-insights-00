import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { NutritionResults } from '@/components/NutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
  const [isDescribing, setIsDescribing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const openaiApiKey = 'sk-proj-4pFVfVOtEJSq1eTllrJKWFRFhVRMo3lRWWZLgdwOE15KpTWc6hnwzYmq_tT3BlbkFJh_h-IJ5JlUYhOZDUnUaQA';
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
    setSelectedImage(URL.createObjectURL(imageFile));
    
    setIsDescribing(true);
    console.log("=== INICIANDO DESCRIÇÃO DA IMAGEM ===");

    try {
      // Converter imagem para base64
      const base64Full = await convertToBase64(imageFile);
      
      // Fazer análise direta com a OpenAI
      const description = await analyzeImageWithOpenAI(base64Full);
      setImageDescription(description);
      
      toast({
        title: "Descrição gerada!",
        description: "Agora você pode enviar para análise nutricional.",
      });

    } catch (error) {
      console.error("Erro na descrição:", error);
      toast({
        title: "Erro na descrição",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsDescribing(false);
    }
  };

  const analyzeImageWithOpenAI = async (base64Image: string): Promise<string> => {
    console.log("Enviando para OpenAI...");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Descreva detalhadamente este alimento. Identifique o que você vê: tipo de alimento, ingredientes visíveis, modo de preparo, características visuais. Seja muito específico e preciso."
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Erro da OpenAI: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleNutritionAnalysis = async () => {
    if (!imageDescription.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, gere a descrição da imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    console.log("=== ENVIANDO DESCRIÇÃO PARA MAKE ===");

    try {
      const payload = {
        description: imageDescription,
        prompt: `Baseado nesta descrição detalhada de um alimento: "${imageDescription}"

Retorne APENAS um JSON válido no formato:
{
  "nome_alimento": "Nome específico do alimento",
  "descricao": "Descrição nutricional",
  "calorias": número_por_100g,
  "carboidratos": gramas_por_100g,
  "proteinas": gramas_por_100g,
  "gorduras": gramas_por_100g,
  "fibras": gramas_por_100g,
  "sodio": miligramas_por_100g
}

Todos os valores devem ser números reais baseados no alimento descrito.`
      };

      console.log("Enviando payload:", payload);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Resposta:", responseText);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      const processedData = processOpenAIResponse(responseText);
      setNutritionData(processedData);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram identificados com sucesso.",
      });

    } catch (error) {
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
      return data.food_name || data.foodName || data.nome || data.alimento || data.nome_alimento || "Alimento identificado";
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
    setImageDescription('');
    setSelectedImage(null);
    setIsAnalyzing(false);
    setIsDescribing(false);
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
              
              {/* Seção de Descrição */}
              {(selectedImage || imageDescription) && (
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Descrição da Imagem
                  </h3>
                  
                  {selectedImage && (
                    <div className="mb-4">
                      <img
                        src={selectedImage}
                        alt="Imagem selecionada"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {isDescribing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                      <span className="text-gray-600">Analisando imagem...</span>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={imageDescription}
                        onChange={(e) => setImageDescription(e.target.value)}
                        placeholder="A descrição da imagem aparecerá aqui..."
                        className="min-h-[120px] mb-4"
                      />
                      
                      {imageDescription && (
                        <Button
                          onClick={handleNutritionAnalysis}
                          className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8"
                        >
                          Analisar Nutrição
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
