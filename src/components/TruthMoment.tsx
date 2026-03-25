
import React from 'react';
import { Star, Trophy, Zap, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TruthMomentProps {
  score: number;
  feedback: string;
  isLoading: boolean;
}

export const TruthMoment: React.FC<TruthMomentProps> = ({ score, feedback, isLoading }) => {
  const getScoreIcon = () => {
    if (score >= 8) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (score >= 6) return <Star className="w-8 h-8 text-blue-500" />;
    if (score >= 4) return <Zap className="w-8 h-8 text-orange-500" />;
    return <Frown className="w-8 h-8 text-red-500" />;
  };

  const getScoreColor = () => {
    if (score >= 8) return 'text-yellow-600 bg-yellow-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTitle = () => {
    if (score >= 9) return '🏆 LENDÁRIO!';
    if (score >= 7) return '💪 FORTE DEMAIS!';
    if (score >= 5) return '⚠️ TEM POTENCIAL!';
    if (score >= 3) return '😤 ACORDA, CAMPEÃO!';
    return '🚨 CÓDIGO VERMELHO!';
  };

  if (isLoading) {
    return (
      <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20 mt-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analisando seu desempenho... 🤔</p>
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20 mt-6 animate-scale-in">
      <div className="text-center mb-6 animate-fade-in">
        <div className="flex justify-center mb-4 transform transition-transform duration-300 hover:scale-110">
          {getScoreIcon()}
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-3">{getTitle()}</h3>
        <div className={`inline-flex items-center px-6 py-3 rounded-full ${getScoreColor()} shadow-lg transform transition-transform duration-200 hover:scale-105`}>
          <span className="text-3xl font-bold">Nota: {score}/10</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg font-medium">
            {feedback}
          </p>
        </div>
      </div>
    </div>
  );
};
