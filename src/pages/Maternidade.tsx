import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MaternidadeHeader } from '@/components/maternidade/MaternidadeHeader';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { GestacaoPanel } from '@/components/maternidade/gestacao/GestacaoPanel';
import { PospartoPanel } from '@/components/maternidade/posparto/PospartoPanel';
import { TentantesPanel } from '@/components/maternidade/tentantes/TentantesPanel';
import { BebePanel } from '@/components/maternidade/bebe/BebePanel';

const TABS = [
  { id: 'tentantes', label: 'Tentantes' },
  { id: 'gestacao', label: 'Gestação' },
  { id: 'posparto', label: 'Pós-parto' },
  { id: 'bebe', label: 'Bebê' },
];

const Maternidade = () => {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('gestacao');

  useEffect(() => {
    if (authReady && !user) navigate('/auth');
  }, [authReady, user, navigate]);

  if (!authReady || !user) return null;

  return (
    <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+0rem)] pb-28">
      <MaternidadeHeader />

      <main className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        <SectionPicker options={TABS} value={tab} onChange={setTab} />

        {tab === 'tentantes' && <TentantesPanel />}
        {tab === 'gestacao' && <GestacaoPanel />}
        {tab === 'posparto' && <PospartoPanel />}
        {tab === 'bebe' && <BebePanel />}
      </main>
    </div>
  );
};

export default Maternidade;
