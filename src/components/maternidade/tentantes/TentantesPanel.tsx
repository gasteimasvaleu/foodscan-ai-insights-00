import { useState } from 'react';
import data from '@/data/maternidade/tentantes-pt.json';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { CycleTracker } from './CycleTracker';
import { FertilityCalculator } from './FertilityCalculator';
import { PreconceptionChecklist } from './PreconceptionChecklist';
import { EducationalContent } from './EducationalContent';

export const TentantesPanel = () => {
  const [tab, setTab] = useState('cycle');
  const c = data as any;

  const options = [
    { id: 'cycle', label: c.navigation.cycle },
    { id: 'fertility', label: c.navigation.fertility },
    { id: 'checklist', label: c.navigation.checklist },
    { id: 'education', label: c.navigation.education },
  ];

  return (
    <div className="space-y-4">
      <SectionPicker options={options} value={tab} onChange={setTab} />
      {tab === 'cycle' && <CycleTracker />}
      {tab === 'fertility' && <FertilityCalculator />}
      {tab === 'checklist' && <PreconceptionChecklist content={c.checklist} />}
      {tab === 'education' && <EducationalContent content={c.education} />}
    </div>
  );
};
