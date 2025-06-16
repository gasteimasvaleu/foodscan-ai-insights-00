
import React from 'react';
import { Brain, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DietAnalysisProps {
  analysis: string;
  isLoading: boolean;
}

export const DietAnalysis: React.FC<DietAnalysisProps> = ({ analysis, isLoading }) => {
  const handleWhatsAppShare = () => {
    const message = `🍎 *Análise da Minha Dieta*\n\n${analysis}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 rounded-full p-3">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Análise do Dia</h3>
            <p className="text-gray-600">Analisando sua dieta...</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Nossa IA está analisando seus dados nutricionais...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 rounded-full p-3">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Análise do Dia</h3>
          <p className="text-gray-600">Feedback sobre sua alimentação</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </p>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={handleWhatsAppShare}
          className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Enviar pelo Whatsapp
        </Button>
      </div>
    </div>
  );
};
