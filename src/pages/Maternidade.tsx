import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaternidadeHeader } from '@/components/maternidade/MaternidadeHeader';
import { GestacaoPanel } from '@/components/maternidade/gestacao/GestacaoPanel';
import { PospartoPanel } from '@/components/maternidade/posparto/PospartoPanel';
import { TentantesPanel } from '@/components/maternidade/tentantes/TentantesPanel';
import { BebePanel } from '@/components/maternidade/bebe/BebePanel';

const Maternidade = () => {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && !user) navigate('/auth');
  }, [authReady, user, navigate]);

  if (!authReady || !user) return null;

  return (
    <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+0rem)] pb-28">
      <MaternidadeHeader />

      <main className="px-4 py-4 max-w-3xl mx-auto">
        <Tabs defaultValue="gestacao" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto bg-white/70 backdrop-blur-md p-1 rounded-2xl mb-4">
            {[
              ['tentantes', 'Tentantes'],
              ['gestacao', 'Gestação'],
              ['posparto', 'Pós-parto'],
              ['bebe', 'Bebê'],
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

          <TabsContent value="tentantes">
            <TentantesPanel />
          </TabsContent>
          <TabsContent value="gestacao">
            <GestacaoPanel />
          </TabsContent>
          <TabsContent value="posparto">
            <PospartoPanel />
          </TabsContent>
          <TabsContent value="bebe">
            <BebePanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Maternidade;
