import React from 'react';
import { Sparkles } from 'lucide-react';
import { GradientText } from './ui/gradient-text';
export const Header = () => {
  return <div className="text-center mb-12 animate-fade-in bg-white py-[19px] rounded-xl px-0">
      <div className="flex items-center justify-center mb-6">
        
      </div>
      
      <GradientText colors={["#40ffaa", "#4079ff", "#40ffaa"]} animationSpeed={3} className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
        FoodScan & Diet
      </GradientText>
      
      <p className="text-xl max-w-2xl mx-auto leading-relaxed text-primary-700">Nutrição Inteligente na Palma da Mão!</p>
      
      <div className="flex items-center justify-center space-x-6 mt-8 text-white/70">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-primary-700">IA Avançada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-primary-700">Análise Instantânea</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-primary-700">100% Precisão</span>
        </div>
      </div>
    </div>;
};