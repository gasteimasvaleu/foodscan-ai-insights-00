import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Lightbulb } from 'lucide-react';

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
  const [isDescribing, setIsDescribing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const openaiApiKey = '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';
  const webhookUrl = 'https://hook.us2.make.com/nlo14ull4syuj9t7nip92nukiegg1n2g';

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
    setSelectedImage(URL.createObjectURL(imageFile));
    if (!openaiApiKey.trim()) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua chave da OpenAI primeiro.",
        variant: "destructive"
      });
      return;
    }
    setIsDescribing(true);
    try {
      const base64Full = await convertToBase64(imageFile);
      const description = await analyzeImageWithOpenAI(base64Full);
      setImageDescription(description);
      toast({
        title: "Descrição gerada!",
        description: "Agora você pode enviar para análise nutricional."
      });
    } catch (error) {
      console.error("Erro na descrição:", error);
      toast({
        title: "Erro na descrição",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsDescribing(false);
    }
  };

  const analyzeImageWithOpenAI = async (base64Image: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: "Descreva detalhadamente este alimento. Identifique o que você vê: tipo de alimento, ingredientes visíveis, modo de preparo, características visuais. Seja muito específico e preciso."
          }, {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }]
        }],
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
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      const payload = {
        description: imageDescription,
        prompt: `Baseado nesta descrição detalhada de um alimento: "${imageDescription}"

Retorne APENAS um JSON válido no formato:
{
  "nome_alimento": "Nome específico do alimento",
  "descricao": "Descrição nutricional",
  "quantidade_referencia": "Porção típica (ex: 100g, 1 fatia média, 1 xícara, 1 unidade média)",
  "calorias": número_por_porção,
  "carboidratos": gramas_por_porção,
  "proteinas": gramas_por_porção,
  "gorduras": gramas_por_porção,
  "fibras": gramas_por_porção,
  "sodio": miligramas_por_porção
}

IMPORTANTE: Identifique uma porção típica realista do alimento (não apenas 100g) e calcule os valores nutricionais para essa porção específica. Por exemplo:
- Pizza: 1 fatia média (120g)
- Maçã: 1 unidade média (180g)
- Arroz: 1 xícara cozida (150g)
- Pão: 1 fatia (25g)

Todos os valores devem ser números reais baseados na porção identificada.`
      };
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }
      
      const processedData = processOpenAIResponse(responseText);
      setNutritionData(processedData);
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram identificados com sucesso."
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processOpenAIResponse = (responseText: string): NutritionData => {
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = parseTextResponse(responseText);
    }

    const processedData: NutritionData = {
      foodName: extractFoodName(data, responseText),
      description: extractDescription(data, responseText),
      quantity: extractQuantity(data, responseText),
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
    const lines = text.split('\n');
    const result: any = {};
    lines.forEach(line => {
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
    const foodMatch = text.match(/(?:alimento|food|nome):\s*([^\n]+)/i);
    return foodMatch ? foodMatch[1].trim() : "Alimento identificado";
  };

  const extractDescription = (data: any, text: string): string => {
    if (data && typeof data === 'object') {
      return data.description || data.descricao || data.analysis || "Informações nutricionais do alimento analisado.";
    }
    const firstLine = text.split('\n')[0];
    return firstLine || "Informações nutricionais do alimento analisado.";
  };

  const extractQuantity = (data: any, text: string): string => {
    if (data && typeof data === 'object') {
      return data.quantidade_referencia || data.quantity || data.porção || data.portion || "100g";
    }
    const quantityMatch = text.match(/(?:quantidade|porção|portion):\s*([^\n]+)/i);
    return quantityMatch ? quantityMatch[1].trim() : "100g";
  };

  const extractNutritionValue = (data: any, text: string, keys: string[]): number => {
    if (data && typeof data === 'object') {
      for (const key of keys) {
        if (data[key] !== undefined) {
          return parseNutritionValue(data[key]);
        }
      }
    }
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

  if (isAnalyzing) {
    return <LoadingState />;
  }

  if (nutritionData) {
    return <FoodNutritionResults data={nutritionData} onReset={handleReset} />;
  }

  return (
    <div className="space-y-6">
      <ImageUpload onImageSelect={handleImageAnalysis} />
      
      {(selectedImage || imageDescription) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Descrição da Imagem
          </h3>
          
          {selectedImage && (
            <div className="flex flex-col md:flex-row gap-4">
              <img src={selectedImage} alt="Imagem selecionada" className="w-32 h-32 object-cover rounded-lg" />
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex-1">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Dica:</strong> Para uma análise mais refinada, você pode adicionar informações específicas no campo abaixo. 
                      Por exemplo: "café sem açúcar", "pizza margherita", "salada com azeite", etc.
                    </p>
                  </div>
                </div>
              </div>
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
                className="min-h-[200px] md:min-h-[250px]"
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
  );
};

export default FoodAnalysis;