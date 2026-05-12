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
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const activeLabel = TABS.find((t) => t.id === active)?.label ?? '';

  return (
    <div className="space-y-4">
      <BabyProfileCard profile={profile} onChange={setProfile} />

      <button
        onClick={() => setPickerOpen(true)}
        className="w-full h-12 px-4 rounded-xl bg-white/70 backdrop-blur-md flex items-center justify-between text-base"
      >
        <span className="text-[#FD46A1] font-medium">{activeLabel}</span>
        <ChevronDown className="h-4 w-4 text-[#FD46A1]" />
      </button>

      <Drawer open={pickerOpen} onOpenChange={setPickerOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DrawerTitle className="px-4 pt-4 text-base">Selecionar seção</DrawerTitle>
          <div className="flex flex-col gap-2 p-4">
            {TABS.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActive(t.id);
                    setPickerOpen(false);
                  }}
                  className={`h-12 rounded-xl text-base px-4 flex items-center justify-between transition-colors ${
                    isActive ? 'bg-[#FD46A1] text-white' : 'bg-white/60 text-gray-800 hover:bg-white/80'
                  }`}
                >
                  <span>{t.label}</span>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

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
