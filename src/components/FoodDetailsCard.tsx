import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Utensils, Eye, Award, Thermometer } from 'lucide-react';
import { FoodElement, CuisineAnalysis } from '@/types/nutrition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FoodDetailsCardProps {
  elements?: FoodElement[];
  analysisData?: {
    analysis_summary?: string;
    overall_confidence?: string;
    total_estimated_weight?: string;
    cuisine_analysis?: CuisineAnalysis;
    comprehensive_observations?: {
      hidden_ingredients?: string;
      cooking_sequence?: string;
      flavor_harmony?: string;
      visual_composition?: string;
    };
    dietary_compatibility?: {
      dietary_restrictions?: string;
      allergen_analysis?: string;
      nutritional_balance?: string;
    };
    serving_context?: {
      meal_type?: string;
      serving_style?: string;
      cultural_context?: string;
    };
  };
}

export const FoodDetailsCard: React.FC<FoodDetailsCardProps> = ({ elements, analysisData }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Debug logging
  console.log('FoodDetailsCard - elements:', elements);
  console.log('FoodDetailsCard - analysisData:', analysisData);

  if (!elements || elements.length === 0) {
    console.log('FoodDetailsCard - No elements, hiding card');
    return null;
  }

  const hasDetailedInfo = elements.some(element => 
    element.preparation_analysis || 
    element.quality_indicators || 
    element.nutritional_preview ||
    element.texture_analysis ||
    element.color_analysis ||
    element.detailed_description ||
    element.confidence_level
  );

  const hasAnyInfo = hasDetailedInfo || 
    analysisData?.analysis_summary || 
    analysisData?.overall_confidence ||
    analysisData?.total_estimated_weight ||
    analysisData?.cuisine_analysis;

  console.log('FoodDetailsCard - hasDetailedInfo:', hasDetailedInfo);
  console.log('FoodDetailsCard - hasAnyInfo:', hasAnyInfo);

  if (!hasAnyInfo) {
    console.log('FoodDetailsCard - No detailed info, hiding card');
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-blue-800">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Análise Detalhada</span>
                {analysisData?.overall_confidence && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Confiança: {analysisData.overall_confidence}
                  </Badge>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Resumo da Análise */}
            {analysisData?.analysis_summary && (
              <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Resumo da Análise
                </h4>
                <p className="text-gray-700 text-sm">{analysisData.analysis_summary}</p>
              </div>
            )}

            {/* Informações Gerais */}
            {(analysisData?.total_estimated_weight || analysisData?.cuisine_analysis) && (
              <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Utensils className="w-4 h-4 mr-2" />
                  Informações Culinárias
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {analysisData?.total_estimated_weight && (
                    <div>
                      <span className="font-medium text-gray-600">Peso Total Estimado:</span>
                      <p className="text-gray-700">{analysisData.total_estimated_weight}</p>
                    </div>
                  )}
                  {analysisData?.cuisine_analysis?.cooking_style && (
                    <div>
                      <span className="font-medium text-gray-600">Estilo Culinário:</span>
                      <p className="text-gray-700">{analysisData.cuisine_analysis.cooking_style}</p>
                    </div>
                  )}
                  {analysisData?.cuisine_analysis?.complexity_level && (
                    <div>
                      <span className="font-medium text-gray-600">Nível de Complexidade:</span>
                      <p className="text-gray-700">{analysisData.cuisine_analysis.complexity_level}</p>
                    </div>
                  )}
                  {analysisData?.cuisine_analysis?.presentation_quality && (
                    <div>
                      <span className="font-medium text-gray-600">Qualidade da Apresentação:</span>
                      <p className="text-gray-700">{analysisData.cuisine_analysis.presentation_quality}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detalhes por Elemento */}
            {elements.map((element, index) => (
              <div key={index} className="bg-white/70 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Utensils className="w-4 h-4 mr-2" />
                  {element.name}
                  {element.confidence_level && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {element.confidence_level}
                    </Badge>
                  )}
                </h4>

                {element.detailed_description && (
                  <p className="text-gray-700 text-sm mb-3 italic">
                    {element.detailed_description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Análise de Preparo */}
                  {element.preparation_analysis && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Método de Preparo
                      </h5>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">Método Principal:</span> {element.preparation_analysis.primary_method}</p>
                        {element.preparation_analysis.cooking_tools.length > 0 && (
                          <p><span className="font-medium">Utensílios:</span> {element.preparation_analysis.cooking_tools.join(', ')}</p>
                        )}
                        {element.preparation_analysis.estimated_cooking_time && (
                          <p><span className="font-medium">Tempo Estimado:</span> {element.preparation_analysis.estimated_cooking_time}</p>
                        )}
                        {element.preparation_analysis.cooking_level && (
                          <p><span className="font-medium">Nível de Cocção:</span> {element.preparation_analysis.cooking_level}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Análise Sensorial */}
                  {(element.texture_analysis || element.color_analysis) && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700 flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        Análise Sensorial
                      </h5>
                      <div className="space-y-1 text-gray-600">
                        {element.texture_analysis && (
                          <p><span className="font-medium">Textura:</span> {element.texture_analysis}</p>
                        )}
                        {element.color_analysis && (
                          <p><span className="font-medium">Cor:</span> {element.color_analysis}</p>
                        )}
                        {element.size_reference && (
                          <p><span className="font-medium">Tamanho:</span> {element.size_reference}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Qualidade */}
                  {element.quality_indicators && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700 flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                        Indicadores de Qualidade
                      </h5>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">Frescor:</span> {element.quality_indicators.freshness_signs}</p>
                        <p><span className="font-medium">Qualidade do Preparo:</span> {element.quality_indicators.cooking_quality}</p>
                        <p><span className="font-medium">Apelo Visual:</span> {element.quality_indicators.visual_appeal}</p>
                      </div>
                    </div>
                  )}

                  {/* Preview Nutricional */}
                  {element.nutritional_preview && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700 flex items-center">
                        <Thermometer className="w-3 h-3 mr-1" />
                        Perfil Nutricional
                      </h5>
                      <div className="space-y-1 text-gray-600">
                        <p><span className="font-medium">Perfil:</span> {element.nutritional_preview.macronutrient_profile}</p>
                        <p><span className="font-medium">Densidade Calórica:</span> {element.nutritional_preview.caloric_density}</p>
                        <p><span className="font-medium">Indicadores de Saúde:</span> {element.nutritional_preview.health_indicators}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};