import { useState } from 'react';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { WeekByWeekContent } from './WeekByWeekContent';
import { DueDateCalculator } from './DueDateCalculator';
import { KickCounter } from './KickCounter';
import { WeightTracker } from './WeightTracker';
import { PregnancyDiary } from './PregnancyDiary';
import { BabyChecklist } from './BabyChecklist';
import { ExamsSection } from './ExamsSection';
import { SymptomsSection } from './SymptomsSection';

const OPTIONS = [
  { id: 'semana', label: 'Semanas' },
  { id: 'ferramentas', label: 'Ferramentas' },
  { id: 'exames', label: 'Exames' },
  { id: 'sintomas', label: 'Sintomas' },
  { id: 'enxoval', label: 'Enxoval' },
];

export const GestacaoPanel = () => {
  const [tab, setTab] = useState('semana');

  return (
    <div className="space-y-4">
      <SectionPicker options={OPTIONS} value={tab} onChange={setTab} />

      {tab === 'semana' && <WeekByWeekContent />}
      {tab === 'ferramentas' && (
        <div className="space-y-4">
          <DueDateCalculator />
          <KickCounter />
          <WeightTracker />
          <PregnancyDiary />
        </div>
      )}
      {tab === 'exames' && <ExamsSection />}
      {tab === 'sintomas' && <SymptomsSection />}
      {tab === 'enxoval' && <BabyChecklist />}
    </div>
  );
};
