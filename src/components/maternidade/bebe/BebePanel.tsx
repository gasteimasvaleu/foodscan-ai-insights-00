import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BabyProfileCard, type BabyProfile } from './BabyProfileCard';
import { GrowthSleep } from './GrowthSleep';
import { FeedingDiapers } from './FeedingDiapers';
import { VaccinesMilestones } from './VaccinesMilestones';
import { EducationalContent } from './EducationalContent';

export function BebePanel() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BabyProfile | null>(null);

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

      <Tabs defaultValue="crescimento" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto bg-white/70 backdrop-blur-md p-1 rounded-2xl">
          {[
            ['crescimento', 'Crescimento'],
            ['alimentacao', 'Alimentação'],
            ['vacinas', 'Vacinas'],
            ['educativo', 'Conteúdo'],
          ].map(([v, label]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="text-xs py-2 rounded-xl data-[state=active]:bg-[#FD46A1] data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="crescimento" className="mt-4"><GrowthSleep /></TabsContent>
        <TabsContent value="alimentacao" className="mt-4"><FeedingDiapers /></TabsContent>
        <TabsContent value="vacinas" className="mt-4"><VaccinesMilestones profile={profile} /></TabsContent>
        <TabsContent value="educativo" className="mt-4"><EducationalContent /></TabsContent>
      </Tabs>
    </div>
  );
}
