import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthCard } from '@/components/AuthCard';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export interface NutritionData {
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

const FoodScan = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const openaiApiKey = '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';
  const webhookUrl = 'https://hook.us2.make.com/nlo14ull4syuj9t7nip92nukiegg1n2g';

  const handleImageUpload = (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setNutritionData(null);
    setImageDescription('');
  };

  const handleDescribeImage = async () => {
    if (!selectedImage) return;
    
    setIsDescribing(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Descreva esta imagem de comida em português de forma detalhada, incluindo os ingredientes visíveis e o método de preparo."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: selectedImage
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setImageDescription(data.choices[0].message.content);
      }
    } catch (error) {
      console.error('Erro ao descrever imagem:', error);
    } finally {
      setIsDescribing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analise esta imagem de comida e forneça as informações nutricionais detalhadas em formato JSON com os seguintes campos: foodName, description, quantity, nutrition (com calories, carbohydrates, proteins, fats, fiber, sodium). Forneça apenas o JSON, sem formatação adicional."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: selectedImage
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        try {
          const nutritionInfo = JSON.parse(data.choices[0].message.content);
          setNutritionData(nutritionInfo);
        } catch (parseError) {
          console.error('Erro ao analisar resposta:', parseError);
        }
      }
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!nutritionData) return;
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodName: nutritionData.foodName,
          description: nutritionData.description,
          quantity: nutritionData.quantity,
          calories: nutritionData.nutrition.calories,
          carbohydrates: nutritionData.nutrition.carbohydrates,
          proteins: nutritionData.nutrition.proteins,
          fats: nutritionData.nutrition.fats,
          fiber: nutritionData.nutrition.fiber,
          sodium: nutritionData.nutrition.sodium,
          image: selectedImage,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        console.log('Dados salvos com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <AuthCard />
            
            <div className="mt-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  FoodScan
                </h1>
                <p className="text-white/80">
                  Escaneie sua comida e descubra as informações nutricionais
                </p>
              </div>

              <ImageUpload onImageSelect={handleImageUpload} />

              {selectedImage && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleDescribeImage}
                      disabled={isDescribing}
                      className="flex-1"
                    >
                      {isDescribing ? 'Descrevendo...' : 'Descrever Imagem'}
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? 'Analisando...' : 'Analisar Nutrição'}
                    </Button>
                  </div>

                  {imageDescription && (
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Descrição da Imagem:</h3>
                      <Textarea
                        value={imageDescription}
                        onChange={(e) => setImageDescription(e.target.value)}
                        placeholder="Descrição da imagem..."
                        className="bg-white/10 text-white border-white/20"
                      />
                    </div>
                  )}
                </div>
              )}

              {isAnalyzing && <LoadingState />}
              
              {nutritionData && (
                <FoodNutritionResults
                  data={nutritionData}
                  onReset={() => {
                    setNutritionData(null);
                    setSelectedImage(null);
                    setImageDescription('');
                  }}
                />
              )}
              
              {!selectedImage && !isAnalyzing && !nutritionData && (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FoodScan;