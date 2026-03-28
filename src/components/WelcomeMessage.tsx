import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

export const WelcomeMessage = () => {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single();
      if (data?.name) setProfileName(data.name);
    };
    fetchProfile();
  }, [user?.id]);

  if (!user) return null;

  const displayName = profileName || user.email;

  return (
    <div className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/20 mb-6 px-[15px]">
      <div className="flex items-center space-x-3">
        <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">
            Boas-vindas, {displayName}!
          </h3>
        </div>
      </div>
    </div>
  );
};
