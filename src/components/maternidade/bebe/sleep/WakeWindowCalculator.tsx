import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SectionPicker } from '@/components/maternidade/SectionPicker';

type Data = { range: string; min: number; max: number; naps: number; tips: string[] };

const DATA: Record<string, Data> = {
  '0-6w': { range: '0–6 semanas', min: 30, max: 60, naps: 5, tips: [
    'Observe sinais de sono (bocejar, esfregar olhos, olhar fixo).',
    'Não espere muito — recém-nascidos cansam rápido.',
    'A primeira janela do dia costuma ser a mais curta.',
  ] },
  '7-12w': { range: '7–12 semanas', min: 60, max: 90, naps: 4, tips: [
    'As janelas aumentam ao longo do dia.',
    'Última janela antes da noite: 2 a 2h30.',
    'Comece a estabelecer uma rotina previsível.',
  ] },
  '3-4m': { range: '3–4 meses', min: 75, max: 120, naps: 4, tips: [
    'Atenção à regressão dos 4 meses.',
    'Última janela do dia: 2 a 2h30.',
    'Mantenha o ambiente escuro nas sonecas.',
  ] },
  '5-6m': { range: '5–6 meses', min: 120, max: 180, naps: 3, tips: [
    'Transição para 3 sonecas consistentes.',
    'Última janela antes da noite: 2h30 a 3h.',
    'Bom momento para uma rotina mais estruturada.',
  ] },
  '7-10m': { range: '7–10 meses', min: 150, max: 210, naps: 2, tips: [
    'Pode acontecer transição de 3 para 2 sonecas.',
    'Última janela: 3 a 4 horas.',
    'Cada bebê é único — observe os sinais.',
  ] },
  '11-14m': { range: '11–14 meses', min: 180, max: 240, naps: 2, tips: [
    'Duas sonecas bem estabelecidas.',
    'Janela antes da noite: 4 a 5 horas.',
    'Mantenha horários consistentes.',
  ] },
  '15-24m': { range: '15–24 meses', min: 240, max: 360, naps: 1, tips: [
    'Transição para uma única soneca após o almoço.',
    'Janela antes da noite: 5 a 6 horas.',
    'A soneca pode durar 1h30 a 3h.',
  ] },
};

const fmt = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}min` : ''}`;

export function WakeWindowCalculator() {
  const [age, setAge] = useState<string>('');
  const d = age ? DATA[age] : null;

  return (
    <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
      <CardHeader className="pl-5 pb-2"><CardTitle className="text-base font-semibold">Janelas de vigília</CardTitle></CardHeader>
      <CardContent className="pl-5 space-y-4">
        <p className="text-sm text-gray-700">
          Quanto tempo seu bebê deve ficar acordado entre as sonecas.
        </p>
        <div className="space-y-2">
          <Label className="text-sm text-gray-700">Idade do bebê</Label>
          <SectionPicker
            title="Idade do bebê"
            placeholder="Selecione"
            value={age}
            onChange={setAge}
            options={Object.entries(DATA).map(([k, v]) => ({ id: k, label: v.range }))}
          />

        </div>

        {d && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="grid grid-cols-3 gap-2">
              <Box label="Mínima" value={fmt(d.min)} />
              <Box label="Máxima" value={fmt(d.max)} />
              <Box label="Sonecas/dia" value={String(d.naps)} />
            </div>
            <div className="bg-white/60 rounded-xl p-3 space-y-1">
              <p className="text-sm text-gray-800">Dicas para {d.range}</p>
              <ul className="space-y-1">
                {d.tips.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-[#FD46A1]">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FFD1E7] rounded-xl px-2 py-3 text-center">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
