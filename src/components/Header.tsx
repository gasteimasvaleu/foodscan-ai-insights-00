
import React from 'react';
import { Sparkles } from 'lucide-react';
import { GradientText } from './ui/gradient-text';

export const Header = () => {
  return <div className="text-center mb-12 animate-fade-in">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg animate-pulse-glow">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <GradientText
        colors={["#40ffaa", "#4079ff", "#40ffaa"]}
        animationSpeed={3}
        className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
      >
        FoodScan & Diet
      </GradientText>
      
      <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">Nutrição Inteligente na Palma da Mão!</p>
      
      <div className="flex items-center justify-center space-x-6 mt-8 text-white/70">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm">IA Avançada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Análise Instantânea</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm">100% Precisão</span>
        </div>
      </div>
    </div>;
};
