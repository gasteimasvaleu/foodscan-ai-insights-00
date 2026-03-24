import React from 'react';
import { Sparkles } from 'lucide-react';
import { GradientText } from './ui/gradient-text';
export const Header = () => {
  return <div className="text-center mb-12 animate-fade-in bg-white rounded-xl px-[30px] py-[14px]">
      <div className="flex items-center justify-center mb-6">
        
      </div>
      
      <GradientText colors={["#CC0055", "#FF1493", "#CC0055"]} animationSpeed={3} className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
        We Diet
      </GradientText>
      
      <p className="text-xl max-w-2xl mx-auto leading-relaxed text-primary-700">Sua Plataforma Completa de Saúde e Bem-Estar!</p>
      
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-white/70">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-primary-700">IA Nutricional</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-primary-700">Controle de Exercícios</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-primary-700">Treinos Personalizados</span>
        </div>
      </div>
    </div>;
};