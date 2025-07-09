import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthCard } from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import FoodAnalysis from '@/components/FoodAnalysis';
import LabelScan from '@/components/LabelScan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UtensilsCrossed, Tag, Sparkles } from 'lucide-react';

const FoodScan = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('food');

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                FoodScan AI
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubra os valores nutricionais de qualquer alimento ou produto através da análise inteligente de imagens
              </p>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="food" className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  Análise de Comida
                </TabsTrigger>
                <TabsTrigger value="label" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Análise de Rótulo
                </TabsTrigger>
              </TabsList>

              {/* Food Analysis Tab */}
              <TabsContent value="food" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-800">
                      Análise de Comida
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Fotografe qualquer alimento e descubra suas informações nutricionais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-6">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            <strong>Como funciona:</strong> Tire uma foto do alimento, nossa IA vai analisar a imagem e fornecer informações nutricionais estimadas baseadas no que consegue identificar visualmente.
                          </p>
                        </div>
                      </div>
                    </div>
                    <FoodAnalysis />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Label Analysis Tab */}
              <TabsContent value="label" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-800">
                      Análise de Rótulo
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Extraia informações nutricionais de rótulos de produtos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg mb-6">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-orange-700">
                            <strong>Como funciona:</strong> Fotografe a tabela nutricional de qualquer produto e nossa IA extrairá automaticamente os valores nutricionais exatos conforme aparecem no rótulo.
                          </p>
                        </div>
                      </div>
                    </div>
                    <LabelScan />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FoodScan;