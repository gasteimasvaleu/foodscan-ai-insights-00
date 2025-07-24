import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthCard } from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NutritionData, FoodElement } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';

const FoodScan = () => {
  const { user, loading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const openaiApiKey = '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';
  const webhookUrl = 'https://hook.us2.make.com/nlo14ull4syuj9t7nip92nukiegg1n2g';

  // Show loading while checking authentication
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Acesso Restrito
                </h1>
                <p className="text-gray-600 mb-8">
                  Você precisa estar logado para acessar o FoodScan
                </p>
              </div>
              <AuthCard mode="login" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
    if (!openaiApiKey.trim()) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua chave da OpenAI primeiro.",
        variant: "destructive"
      });
      return;
    }
    setIsDescribing(true);
    console.log("=== INICIANDO DESCRIÇÃO DA IMAGEM ===");
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
    console.log("Enviando para OpenAI...");
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
    console.log("=== INICIANDO ANÁLISE NUTRICIONAL ===");

    try {
      // Usar edge function diretamente em vez do webhook externo
      const { data, error } = await supabase.functions.invoke('analyze-nutrition', {
        body: { description: imageDescription }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Dados da edge function:", data);
      setNutritionData(data);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram calculados com sucesso.",
      });
    } catch (error) {
      console.error("Erro na análise nutricional:", error);
      toast({
        title: "Erro na análise nutricional",
        description: "Não foi possível analisar os dados nutricionais. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processOpenAIResponse = (responseText: string): NutritionData => {
    console.log("=== PROCESSANDO RESPOSTA DA OPENAI ===");
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("JSON parseado com sucesso:", data);
    } catch (parseError) {
      console.log("Não é JSON válido, processando como texto simples");
      data = parseTextResponse(responseText);
    }

    const processedData: NutritionData = {
      foodName: extractFoodName(data, responseText),
      description: extractDescription(data, responseText),
      quantity: extractQuantity(data, responseText),
      elements: extractElements(data), // Nova função para extrair elementos
      nutrition: {
        calories: extractNutritionValue(data, responseText, ['calories', 'calorias', 'kcal']),
        carbohydrates: extractNutritionValue(data, responseText, ['carbohydrates', 'carboidratos', 'carbs']),
        proteins: extractNutritionValue(data, responseText, ['proteins', 'proteinas', 'protein']),
        fats: extractNutritionValue(data, responseText, ['fats', 'gorduras', 'fat', 'lipids']),
        fiber: extractNutritionValue(data, responseText, ['fiber', 'fibras', 'fibre']),
        sodium: extractNutritionValue(data, responseText, ['sodium', 'sodio', 'salt'])
      }
    };
    
    console.log("=== DADOS PROCESSADOS FINAL ===", processedData);
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

  const extractElements = (data: any): FoodElement[] | undefined => {
    console.log("=== EXTRAINDO ELEMENTOS ===", data);
    
    // Verificar se data é válido e tem a propriedade elementos
    if (data && typeof data === 'object' && data.elementos && Array.isArray(data.elementos)) {
      console.log("Elementos encontrados:", data.elementos);
      
      return data.elementos.map((elemento: any) => ({
        name: elemento.nome || elemento.name || "Elemento",
        nutrition: {
          calories: parseNutritionValue(elemento.calorias || elemento.calories || 0),
          carbohydrates: parseNutritionValue(elemento.carboidratos || elemento.carbohydrates || 0),
          proteins: parseNutritionValue(elemento.proteinas || elemento.proteins || 0),
          fats: parseNutritionValue(elemento.gorduras || elemento.fats || 0),
          fiber: parseNutritionValue(elemento.fibras || elemento.fiber || 0),
          sodium: parseNutritionValue(elemento.sodio || elemento.sodium || 0)
        }
      }));
    }
    
    // Se data é inválido ou não tem elementos, retornar undefined
    console.log("Nenhum elemento múltiplo detectado - data:", typeof data, data);
    return undefined;
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {isAnalyzing ? (
              <div data-results-section>
                <LoadingState />
              </div>
            ) : nutritionData ? (
              <div data-results-section>
                <FoodNutritionResults data={nutritionData} onReset={handleReset} />
              </div>
            ) : (
              <div className="space-y-8">
                <EmptyState />
                <ImageUpload onImageSelect={handleImageAnalysis} />
                
                {(selectedImage || imageDescription) && (
                  <div data-description-section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Descrição da Imagem
                    </h3>
                    
                    {selectedImage && (
                      <div className="mb-4 flex flex-col md:flex-row gap-4">
                        <img src={selectedImage} alt="Imagem selecionada" className="w-32 h-32 object-cover rounded-lg" />
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex-1">
                          <div className="flex">
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                💡 <strong>Dica:</strong> Para uma análise mais refinada, você pode adicionar informações específicas no campo abaixo. 
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
                          className="min-h-[200px] md:min-h-[250px] mb-4"
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
      <Footer />
    </>
  );
};

export default FoodScan;
