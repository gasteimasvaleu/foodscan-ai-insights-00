import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeekByWeekContent } from './WeekByWeekContent';
import { DueDateCalculator } from './DueDateCalculator';
import { KickCounter } from './KickCounter';
import { WeightTracker } from './WeightTracker';
import { PregnancyDiary } from './PregnancyDiary';
import { BabyChecklist } from './BabyChecklist';
import { ExamsSection } from './ExamsSection';
import { SymptomsSection } from './SymptomsSection';

export const GestacaoPanel = () => {
  return (
    <Tabs defaultValue="semana" className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-auto bg-white/70 backdrop-blur-md p-1 rounded-2xl">
        {[
          ['semana', 'Semanas'],
          ['ferramentas', 'Ferramentas'],
          ['exames', 'Exames'],
          ['sintomas', 'Sintomas'],
          ['enxoval', 'Enxoval'],
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

      <TabsContent value="semana" className="mt-4">
        <WeekByWeekContent />
      </TabsContent>

      <TabsContent value="ferramentas" className="mt-4 space-y-4">
        <DueDateCalculator />
        <KickCounter />
        <WeightTracker />
        <PregnancyDiary />
      </TabsContent>

      <TabsContent value="exames" className="mt-4">
        <ExamsSection />
      </TabsContent>

      <TabsContent value="sintomas" className="mt-4">
        <SymptomsSection />
      </TabsContent>

      <TabsContent value="enxoval" className="mt-4">
        <BabyChecklist />
      </TabsContent>
    </Tabs>
  );
};
