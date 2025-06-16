
import React from 'react';
import { Brain, Zap } from 'lucide-react';

export const LoadingState = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 text-center animate-scale-in">
      <div className="space-y-6">
        <div className="relative">
          <div className="bg-primary-100 rounded-full p-6 w-24 h-24 mx-auto animate-pulse-glow">
            <Brain className="w-12 h-12 text-primary-600 mx-auto animate-bounce" />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-spin">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-800">
            Analisando seu alimento...
          </h3>
          <p className="text-gray-600 text-lg">
            Nossa IA está processando a imagem e calculando os valores nutricionais
          </p>
        </div>
        
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <div className="text-sm text-gray-500 mt-6">
          Isso pode levar alguns segundos...
        </div>
      </div>
    </div>
  );
};
