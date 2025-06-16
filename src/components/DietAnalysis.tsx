
import React from 'react';
import { Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface DietAnalysisProps {
  analysis: string;
  isLoading: boolean;
}

export const DietAnalysis: React.FC<DietAnalysisProps> = ({ analysis, isLoading }) => {
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

      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </p>
        </div>
      </div>
    </div>
  );
};
