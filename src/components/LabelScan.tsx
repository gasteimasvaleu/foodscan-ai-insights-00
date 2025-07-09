import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Scan } from 'lucide-react';

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
  
  const openaiApiKey = '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';

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

  const handleLabelAnalysis = async (imageFile: File) => {
    if (!openaiApiKey.trim()) {
      toast({
        title: "API Key necessária",
        description: "Por favor, configure a chave da OpenAI.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const base64Image = await convertToBase64(imageFile);
      const nutritionInfo = await analyzeLabelWithOpenAI(base64Image);
      setNutritionData(nutritionInfo);
      
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

  const analyzeLabelWithOpenAI = async (base64Image: string): Promise<NutritionData> => {
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
            text: `Analise este rótulo nutricional e extraia as informações nutricionais EXATAS que aparecem no rótulo.

IMPORTANTE: 
- Extraia apenas os valores que estão claramente visíveis no rótulo
- Se a porção for por 100g, mantenha os valores para 100g
- Se a porção for diferente (ex: 1 fatia, 1 xícara), use exatamente essa porção
- NÃO invente valores, use apenas o que está escrito

Retorne APENAS um JSON válido no formato:
{
  "nome_alimento": "Nome do produto conforme aparece no rótulo",
  "descricao": "Descrição do produto e informações adicionais",
  "quantidade_referencia": "Porção conforme aparece no rótulo (ex: 100g, 1 fatia (30g), 1 xícara (240ml))",
  "calorias": valor_numerico,
  "carboidratos": valor_numerico,
  "proteinas": valor_numerico,
  "gorduras": valor_numerico,
  "fibras": valor_numerico,
  "sodio": valor_numerico_em_mg
}

Todos os valores devem ser números baseados na porção especificada no rótulo.`
          }, {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }]
        }],
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`Erro da OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const nutritionInfo = JSON.parse(content);
      
      return {
        foodName: nutritionInfo.nome_alimento || "Produto analisado",
        description: nutritionInfo.descricao || "Informações nutricionais do produto",
        quantity: nutritionInfo.quantidade_referencia || "100g",
        nutrition: {
          calories: parseNutritionValue(nutritionInfo.calorias),
          carbohydrates: parseNutritionValue(nutritionInfo.carboidratos),
          proteins: parseNutritionValue(nutritionInfo.proteinas),
          fats: parseNutritionValue(nutritionInfo.gorduras),
          fiber: parseNutritionValue(nutritionInfo.fibras),
          sodium: parseNutritionValue(nutritionInfo.sodio)
        }
      };
    } catch (parseError) {
      throw new Error("Não foi possível extrair os dados do rótulo. Verifique se a imagem está nítida.");
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