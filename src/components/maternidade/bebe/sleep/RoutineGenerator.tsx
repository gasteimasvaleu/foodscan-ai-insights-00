import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { toast } from 'sonner';

type Item = { time: string; activity: string; note: string };
type AgeKey = '0-3' | '4-6' | '7-9' | '10-12' | '12-18' | '18-24' | '24+';

const AGE: Record<AgeKey, { min: number; max: number; naps: number; napDur: number; label: string }> = {
  '0-3':   { min: 45,  max: 90,  naps: 4, napDur: 30, label: '0–3 meses' },
  '4-6':   { min: 90,  max: 120, naps: 3, napDur: 45, label: '4–6 meses' },
  '7-9':   { min: 120, max: 180, naps: 2, napDur: 60, label: '7–9 meses' },
  '10-12': { min: 150, max: 210, naps: 2, napDur: 60, label: '10–12 meses' },
  '12-18': { min: 180, max: 240, naps: 1, napDur: 90, label: '12–18 meses' },
  '18-24': { min: 240, max: 300, naps: 1, napDur: 90, label: '18–24 meses' },
  '24+':   { min: 300, max: 360, naps: 0, napDur: 0,  label: '24+ meses' },
};

const fmt = (d: Date) => d.toTimeString().slice(0, 5);

export function RoutineGenerator() {
  const [age, setAge] = useState<AgeKey | ''>('');
  const [wake, setWake] = useState('07:00');
  const [bed, setBed] = useState('19:30');
  const [naps, setNaps] = useState('');
  const [items, setItems] = useState<Item[]>([]);

  const generate = () => {
    if (!age) { toast.error('Selecione a idade'); return; }
    const a = AGE[age];
    const napCount = naps ? Number(naps) : a.naps;

    const [wh, wm] = wake.split(':').map(Number);
    const [bh, bm] = bed.split(':').map(Number);
    const cur = new Date(); cur.setHours(wh, wm, 0, 0);
    const list: Item[] = [];

    list.push({ time: wake, activity: 'Acordar', note: 'Hora de começar o dia' });
    cur.setMinutes(cur.getMinutes() + 30);
    list.push({ time: fmt(cur), activity: 'Mamada/Refeição', note: 'Primeira alimentação' });

    const window = (a.min + a.max) / 2;
    for (let i = 0; i < napCount; i++) {
      cur.setMinutes(cur.getMinutes() + window);
      list.push({ time: fmt(cur), activity: `Soneca ${i + 1}`, note: `Duração sugerida: ${a.napDur} min` });
      cur.setMinutes(cur.getMinutes() + a.napDur);
      list.push({ time: fmt(cur), activity: 'Mamada/Refeição', note: 'Após acordar' });
      cur.setMinutes(cur.getMinutes() + 30);
      list.push({ time: fmt(cur), activity: 'Brincadeira', note: 'Estímulos e interação' });
    }

    const pre = new Date(); pre.setHours(bh, bm - 30, 0, 0);
    list.push({ time: fmt(pre), activity: 'Rotina noturna', note: 'Banho, massagem, história' });
    list.push({ time: bed, activity: 'Dormir', note: 'Boa noite!' });

    setItems(list);
    toast.success('Rotina gerada');
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border-white/40">
      <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Gerador de rotina</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Idade</Label>
          <SectionPicker
            title="Idade"
            placeholder="Selecione"
            value={age}
            onChange={(v) => setAge(v as AgeKey)}
            options={(Object.keys(AGE) as AgeKey[]).map((k) => ({ id: k, label: AGE[k].label }))}
          />

        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Acordar</Label>
            <Input type="time" value={wake} onChange={(e) => setWake(e.target.value)} className="text-base h-12 rounded-xl appearance-none text-left" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Dormir</Label>
            <Input type="time" value={bed} onChange={(e) => setBed(e.target.value)} className="text-base h-12 rounded-xl appearance-none text-left" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Sonecas (opcional)</Label>
          <SectionPicker
            title="Sonecas"
            placeholder="Sugerido p/ idade"
            value={naps}
            onChange={setNaps}
            options={['0','1','2','3','4','5'].map((n) => ({ id: n, label: n }))}
          />

        </div>
        <Button onClick={generate} className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-12 rounded-xl">
          Gerar rotina
        </Button>

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="bg-white/60 rounded-xl px-3 py-2 flex gap-3">
                <span className="text-sm text-[#FD46A1] w-12 shrink-0">{it.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{it.activity}</p>
                  <p className="text-xs text-gray-600">{it.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
