
import React from 'react';

interface DailyControlHeaderProps {
  profile: any;
}

export const DailyControlHeader: React.FC<DailyControlHeaderProps> = ({ profile }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Controle Diário
      </h1>
      <p className="text-gray-600">
        Acompanhe suas metas nutricionais e registre suas refeições
      </p>
      {profile && (
        <div className="mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg inline-block">
          <p className="text-lg text-gray-700">
            Olá, <span className="font-semibold text-primary-600">{profile.name}</span>! 
            Como está sendo seu dia nutricional? 🍽️
          </p>
        </div>
      )}
    </div>
  );
};
