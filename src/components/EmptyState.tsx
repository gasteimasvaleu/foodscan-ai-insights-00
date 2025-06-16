import React from 'react';
import { Camera, Zap, BarChart3, Target, Star } from 'lucide-react';
export const EmptyState = () => {
  return <div className="text-center space-y-8 animate-fade-in">
      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">1. Faça Upload</h3>
          <p className="text-white/80 text-sm">
            Tire uma foto ou selecione uma imagem do seu prato ou alimento
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">2. IA Analisa</h3>
          <p className="text-white/80 text-sm">
            Nossa IA identifica automaticamente os alimentos na imagem
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">3. Veja Nutrição</h3>
          <p className="text-white/80 text-sm">
            Receba informações nutricionais detalhadas em segundos
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-indigo-400">4. Avalie Sua Meta</h3>
          <p className="text-sm text-indigo-400">
            Integre suas refeições a sua meta diária automáticamente
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-indigo-400">5. Evie para seu Profissional</h3>
          <p className="text-sm text-indigo-500">
            Evie a avaliação e análise para seu Profissional de Confiança por Whatsapp
          </p>
        </div>
      </div>
    </div>;
};