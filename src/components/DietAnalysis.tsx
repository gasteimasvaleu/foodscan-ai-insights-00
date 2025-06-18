
import React, { useState } from 'react';
import { Brain, MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/ui/save-button';
import { TruthMoment } from './TruthMoment';
import { toast } from '@/hooks/use-toast';

interface DietAnalysisProps {
  analysis: string;
  isLoading: boolean;
}

interface TruthMomentData {
  score: number;
  feedback: string;
}

export const DietAnalysis: React.FC<DietAnalysisProps> = ({ analysis, isLoading }) => {
  const [truthMoment, setTruthMoment] = useState<TruthMomentData | null>(null);
  const [isTruthLoading, setIsTruthLoading] = useState(false);

  const handleWhatsAppShare = () => {
    const message = `🍎 *Análise da Minha Dieta*\n\n${analysis}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTruthMoment = async () => {
    setIsTruthLoading(true);
    
    try {
      // Simular chamada para IA - aqui você pode integrar com uma API real
      const prompt = `Analise esta análise nutricional e dê uma nota de 0 a 10 baseada no desempenho do usuário em relação às suas metas. Considere se ele ficou próximo às metas, se teve uma alimentação equilibrada, etc. Seja divertido e motivacional no feedback.

Análise: ${analysis}

Responda APENAS um JSON no formato:
{
  "score": número_de_0_a_10,
  "feedback": "feedback_motivacional_divertido"
}`;

      // Por enquanto, vamos simular uma resposta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulação de análise baseada no conteúdo
      const mockResponse = {
        score: Math.floor(Math.random() * 6) + 4, // Entre 4 e 9
        feedback: "🎯 Ei, guerreiro da dieta! Vamos conversar sério aqui...\n\nVocê está no caminho certo, mas ainda tem espaço para melhorar! 💪 Vejo que você está tentando, e isso já é meio caminho andado.\n\n🔥 Dicas para arrasar amanhã:\n• Não desista! Roma não foi construída em um dia\n• Cada pequeno passo conta\n• Você é mais forte do que imagina\n\n🚀 Amanhã é uma nova oportunidade para mostrar do que você é capaz! Vamos que vamos! 💙"
      };

      setTruthMoment(mockResponse);
      
      toast({
        title: "Hora da Verdade Revelada! 🎭",
        description: "Sua análise está pronta. Confira abaixo!"
      });
      
    } catch (error) {
      console.error('Erro na análise da Hora da Verdade:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar análise. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsTruthLoading(false);
    }
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
    <>
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

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleWhatsAppShare}
            className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Enviar pelo Whatsapp
          </Button>
          
          <SaveButton
            text={{
              idle: "Hora da Verdade 🎭",
              saving: "Analisando...",
              saved: "Análise Completa!"
            }}
            onSave={handleTruthMoment}
          />
        </div>
      </div>

      <TruthMoment 
        score={truthMoment?.score || 0}
        feedback={truthMoment?.feedback || ''}
        isLoading={isTruthLoading}
      />
    </>
  );
};
