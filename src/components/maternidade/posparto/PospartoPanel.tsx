import { useState } from 'react';
import { Phone } from 'lucide-react';
import postpartumData from '@/data/maternidade/postpartum-pt.json';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { OverviewSection } from './OverviewSection';
import { SymptomsSection } from './SymptomsSection';
import { SelfAssessment } from './SelfAssessment';
import { WhenToSeekHelp } from './WhenToSeekHelp';
import { ResourcesSection } from './ResourcesSection';

export const PospartoPanel = () => {
  const c = (postpartumData as any).pt;
  const [tab, setTab] = useState('overview');

  const options = [
    { id: 'overview', label: c.navigation.overview },
    { id: 'symptoms', label: c.navigation.symptoms },
    { id: 'epds', label: c.navigation.selfAssessment },
    { id: 'help', label: c.navigation.support },
    { id: 'resources', label: c.navigation.resources },
  ];

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

      <SectionPicker options={options} value={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'overview' && <OverviewSection content={c.overview} />}
        {tab === 'symptoms' && <SymptomsSection content={c.symptoms} onGoToEpds={() => setTab('epds')} />}
        {tab === 'epds' && <SelfAssessment content={c.selfAssessment} emergencyContent={c.emergency} />}
        {tab === 'help' && <WhenToSeekHelp content={c.whenToSeekHelp} />}
        {tab === 'resources' && <ResourcesSection content={c.resources} />}
      </div>
    </div>
  );
};
