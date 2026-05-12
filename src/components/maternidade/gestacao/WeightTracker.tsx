import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightRecord { weight: number; ts: string; }

export const WeightTracker = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRecords(matGet<WeightRecord[]>(user?.id, 'gestacao:peso', []));
  }, [user?.id]);

  const add = () => {
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;
    const next = [...records, { weight: w, ts: new Date().toISOString() }];
    setRecords(next);
    matSet(user?.id, 'gestacao:peso', next);
    setNewWeight('');
    setShowForm(false);
  };

  const latest = records[records.length - 1]?.weight ?? null;
  const first = records[0]?.weight ?? null;
  const gain = latest && first ? (latest - first).toFixed(1) : '0.0';
  const chart = records.map((r) => ({ date: format(new Date(r.ts), 'dd/MM'), weight: r.weight }));

  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base text-gray-800">Rastreador de Peso</h3>
          <p className="text-xs text-gray-600 mt-0.5">Acompanhe seu ganho de peso</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="bg-white/70 hover:bg-white text-[#FD46A1] border border-white/60 backdrop-blur-md h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Registrar
        </Button>
      </div>

      {showForm && (
        <div className="flex gap-2 bg-white/60 backdrop-blur-md rounded-2xl p-2.5">
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="kg"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="bg-white/80 border-white/60 text-base"
          />
          <Button onClick={add} className="bg-[#FD46A1] hover:bg-[#E24989] text-white">
            Salvar
          </Button>
        </div>
      )}

      {records.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 text-center">
              <p className="text-[10px] text-gray-600">Peso atual</p>
              <p className="text-lg font-semibold text-[#FD46A1]">{latest} kg</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 text-center">
              <p className="text-[10px] text-gray-600">Ganho total</p>
              <p className="text-lg font-semibold text-[#FD46A1]">+{gain} kg</p>
            </div>
          </div>
          {chart.length > 1 && (
            <div className="h-36 bg-white/40 rounded-2xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff80" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} stroke="#666" />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#FD46A1" strokeWidth={2} dot={{ fill: '#FD46A1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {records.length === 0 && !showForm && (
        <p className="text-center text-sm text-gray-600 py-4">
          Nenhum registro ainda. Toque em "Registrar" para começar.
        </p>
      )}
    </div>
  );
};
