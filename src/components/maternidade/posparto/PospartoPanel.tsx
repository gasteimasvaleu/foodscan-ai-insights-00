import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone } from 'lucide-react';
import postpartumData from '@/data/maternidade/postpartum-pt.json';
import { OverviewSection } from './OverviewSection';
import { SymptomsSection } from './SymptomsSection';
import { SelfAssessment } from './SelfAssessment';
import { WhenToSeekHelp } from './WhenToSeekHelp';
import { ResourcesSection } from './ResourcesSection';

export const PospartoPanel = () => {
  const c = (postpartumData as any).pt;

  return (
    <div className="space-y-3">
      <a
        href="tel:188"
        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-red-50 border-2 border-red-200 active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <Phone className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">{c.emergency.title}</p>
            <p className="text-xs text-red-600">{c.emergency.cvv}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-red-700">Ligar 188</span>
      </a>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto bg-white/70 backdrop-blur-md p-1 rounded-2xl">
          {[
            ['overview', c.navigation.overview],
            ['symptoms', c.navigation.symptoms],
            ['epds', c.navigation.selfAssessment],
            ['help', c.navigation.support],
            ['resources', c.navigation.resources],
          ].map(([v, label]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="text-[10px] py-2 rounded-xl data-[state=active]:bg-[#FD46A1] data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewSection content={c.overview} />
        </TabsContent>
        <TabsContent value="symptoms" className="mt-4">
          <SymptomsSection content={c.symptoms} />
        </TabsContent>
        <TabsContent value="epds" className="mt-4">
          <SelfAssessment content={c.selfAssessment} emergencyContent={c.emergency} />
        </TabsContent>
        <TabsContent value="help" className="mt-4">
          <WhenToSeekHelp content={c.whenToSeekHelp} />
        </TabsContent>
        <TabsContent value="resources" className="mt-4">
          <ResourcesSection content={c.resources} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
