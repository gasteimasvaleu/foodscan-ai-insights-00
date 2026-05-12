import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
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
];

export function BebePanel() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [active, setActive] = useState('sono');

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

      <SectionPicker options={TABS} value={active} onChange={setActive} />

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
