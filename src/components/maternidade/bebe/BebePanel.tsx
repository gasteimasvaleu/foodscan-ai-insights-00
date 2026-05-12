import { useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { BabyProfileCard, type BabyProfile } from './BabyProfileCard';
import { SleepGrowthPanel } from './SleepGrowthPanel';
import { FeedingDiapers } from './FeedingDiapers';
import { VaccinesMilestones } from './VaccinesMilestones';
import { EducationalContent } from './EducationalContent';
import { BabyNames } from './BabyNames';
import { BabyGenerator } from './BabyGenerator';

const TABS = [
  { id: 'sono', label: 'Sono & Cresc.' },
  { id: 'aliment', label: 'Aliment.' },
  { id: 'vacinas', label: 'Vacinas' },
  { id: 'educativo', label: 'Conteúdo' },
  { id: 'nomes', label: 'Nomes' },
  { id: 'gerador', label: 'Bebê IA' },
] as const;

export function BebePanel() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [active, setActive] = useState<typeof TABS[number]['id']>('sono');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('baby_profile')
        .select('user_id, name, birth_date, sex')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProfile(data as BabyProfile);
    })();
  }, [user]);

  return (
    <div className="space-y-4">
      <BabyProfileCard profile={profile} onChange={setProfile} />

      <div className="bg-white/70 backdrop-blur-md p-1 rounded-2xl overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`text-xs py-2 px-3 rounded-xl whitespace-nowrap transition-colors ${
                active === t.id ? 'bg-[#FD46A1] text-white' : 'text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {active === 'sono' && <SleepGrowthPanel />}
        {active === 'aliment' && <FeedingDiapers />}
        {active === 'vacinas' && <VaccinesMilestones profile={profile} />}
        {active === 'educativo' && <EducationalContent />}
        {active === 'nomes' && <BabyNames />}
        {active === 'gerador' && <BabyGenerator />}
      </div>
    </div>
  );
}
