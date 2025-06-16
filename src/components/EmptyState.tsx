
import React from 'react';
import { Camera, Upload } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 text-center animate-scale-in">
      <div className="space-y-6">
        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto">
          <Camera className="w-12 h-12 text-gray-400 mx-auto" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-800">
            Comece sua análise nutricional
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Faça upload de uma foto do seu alimento e descubra informações nutricionais detalhadas
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload rápido</span>
          </div>
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Análise instantânea</span>
          </div>
        </div>
      </div>
    </div>
  );
};
