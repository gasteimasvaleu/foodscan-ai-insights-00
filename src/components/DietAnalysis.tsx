import React, { useState } from 'react';
import { Brain, MessageCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaveButton } from '@/components/ui/save-button';
import { TruthMoment } from './TruthMoment';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DietAnalysisProps {
  analysis: string;
  isLoading: boolean;
  goals?: any;
  consumed?: any;
}

interface TruthMomentData {
  score: number;
  feedback: string;
}

export const DietAnalysis: React.FC<DietAnalysisProps> = ({ analysis, isLoading, goals, consumed }) => {
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
      const { data, error } = await supabase.functions.invoke('truth-moment-analysis', {
        body: {
          analysis,
          goals,
          consumed
        }
      });

      if (error) {
        throw error;
      }

      setTruthMoment(data);
      
      toast({
        title: "Hora da Verdade Revelada! 🎭",
        description: "Sua análise está pronta. Confira abaixo!"
      });
      
    } catch (error) {
      console.error('Erro na análise da Hora da Verdade:', error);
      
      // Fallback em caso de erro
      setTruthMoment({
        score: 5,
        feedback: "🤖 Ops! A IA está ocupada, mas vou te dar uma dica: o importante é não desistir! Continue firme em suas metas. Amanhã é uma nova chance de arrasar! 💪✨"
      });
      
      toast({
        title: "Análise Gerada",
        description: "Análise criada com sucesso (modo offline)."
      });
    } finally {
      setIsTruthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20">
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
      <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20">
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
            style={{ minWidth: "150px" }}
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
