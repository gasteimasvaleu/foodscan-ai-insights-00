
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';

export const WelcomeMessage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const userName = user.user_metadata?.name || user.email;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 mb-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            Boas-vindas, {userName}!
          </h3>
        </div>
      </div>
    </div>
  );
};
