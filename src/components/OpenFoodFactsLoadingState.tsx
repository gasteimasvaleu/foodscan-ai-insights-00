import React from 'react';
import { Scan, Database, CheckCircle } from 'lucide-react';

export const OpenFoodFactsLoadingState = () => {
  return (
    <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 text-center animate-scale-in">
      <div className="space-y-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto animate-pulse-glow">
            <Scan className="w-12 h-12 text-green-600 animate-pulse" />
          </div>
          <div className="absolute top-0 right-0">
            <Database className="w-6 h-6 text-green-500 animate-bounce" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Consultando Open Food Facts...
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Buscando informações nutricionais na maior base de dados 
            de produtos alimentares do mundo.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Decodificando código de barras</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Consultando base Open Food Facts</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Processando dados nutricionais</span>
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse w-2/3"></div>
        </div>

        {/* Open Food Facts Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Dados verificados pela comunidade Open Food Facts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};