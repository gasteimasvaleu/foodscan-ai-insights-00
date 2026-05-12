import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import data from '@/data/maternidade/tentantes-pt.json';
import { CycleTracker } from './CycleTracker';
import { FertilityCalculator } from './FertilityCalculator';
import { PreconceptionChecklist } from './PreconceptionChecklist';
import { EducationalContent } from './EducationalContent';

export const TentantesPanel = () => {
  const [tab, setTab] = useState('cycle');
  const c = data as any;

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto bg-white/70 backdrop-blur-md p-1 rounded-2xl">
        {[
          ['cycle', c.navigation.cycle],
          ['fertility', c.navigation.fertility],
          ['checklist', c.navigation.checklist],
          ['education', c.navigation.education],
        ].map(([v, label]) => (
          <TabsTrigger
            key={v}
            value={v}
            className="text-[11px] py-2 rounded-xl data-[state=active]:bg-[#FD46A1] data-[state=active]:text-white"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="cycle" className="mt-4">
        <CycleTracker />
      </TabsContent>
      <TabsContent value="fertility" className="mt-4">
        <FertilityCalculator />
      </TabsContent>
      <TabsContent value="checklist" className="mt-4">
        <PreconceptionChecklist content={c.checklist} />
      </TabsContent>
      <TabsContent value="education" className="mt-4">
        <EducationalContent content={c.education} />
      </TabsContent>
    </Tabs>
  );
};
