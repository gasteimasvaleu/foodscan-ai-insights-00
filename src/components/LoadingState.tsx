
import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export const LoadingState = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 text-center animate-scale-in">
      <div className="space-y-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="bg-primary-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto animate-pulse-glow">
            <Brain className="w-12 h-12 text-primary-600 animate-pulse" />
          </div>
          <div className="absolute top-0 right-0">
            <Sparkles className="w-6 h-6 text-primary-500 animate-bounce" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Analisando seu prato...
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Segura aí, Chef! Nossa IA está identificando os alimentos e 
            buscando informações nutricionais detalhadas.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Processando imagem</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Identificando alimentos</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Buscando dados nutricionais</span>
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full animate-pulse w-2/3"></div>
        </div>
      </div>
    </div>
  );
};
