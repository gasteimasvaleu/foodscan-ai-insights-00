import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectValue } from '@/components/ui/select';
import { GlassSelectTrigger as SelectTrigger, GlassSelectContent as SelectContent, GlassSelectItem as SelectItem } from '@/components/maternidade/GlassSelect';

import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { MatDatePicker, MatDateTimePicker } from '@/components/maternidade/MatDatePicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Growth = { id: string; recorded_at: string; weight_kg: number | null; height_cm: number | null; head_cm: number | null };
type Sleep = { id: string; started_at: string; ended_at: string; kind: string };

const fmtDate = (s: string) =>
  new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const minutesBetween = (a: string, b: string) =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

export function GrowthSleep() {
  const { user } = useAuth();
  const [growth, setGrowth] = useState<Growth[]>([]);
  const [sleeps, setSleeps] = useState<Sleep[]>([]);
  const [openG, setOpenG] = useState(false);
  const [openS, setOpenS] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [gForm, setGForm] = useState({ recorded_at: today, weight_kg: '', height_cm: '', head_cm: '' });
  const [sForm, setSForm] = useState({
    started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16),
    ended_at: new Date().toISOString().slice(0, 16),
    kind: 'soneca',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const [g, s] = await Promise.all([
      supabase.from('baby_growth').select('id, recorded_at, weight_kg, height_cm, head_cm')
        .eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(6),
      supabase.from('baby_sleep').select('id, started_at, ended_at, kind')
        .eq('user_id', user.id).order('started_at', { ascending: false }).limit(20),
    ]);
    setGrowth((g.data as Growth[]) || []);
    setSleeps((s.data as Sleep[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const saveGrowth = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('baby_growth').insert({
      user_id: user.id,
      recorded_at: gForm.recorded_at,
      weight_kg: gForm.weight_kg ? Number(gForm.weight_kg) : null,
      height_cm: gForm.height_cm ? Number(gForm.height_cm) : null,
      head_cm: gForm.head_cm ? Number(gForm.head_cm) : null,
    });
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Medida registrada');
    setOpenG(false);
    setGForm({ recorded_at: today, weight_kg: '', height_cm: '', head_cm: '' });
    load();
  };

  const saveSleep = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('baby_sleep').insert({
      user_id: user.id,
      started_at: new Date(sForm.started_at).toISOString(),
      ended_at: new Date(sForm.ended_at).toISOString(),
      kind: sForm.kind,
    });
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Sono registrado');
    setOpenS(false);
    load();
  };

  // últimos 7 dias
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = sleeps
      .filter((x) => x.started_at.slice(0, 10) === key)
      .reduce((sum, x) => sum + minutesBetween(x.started_at, x.ended_at), 0);
    return { key, label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), total };
  });
  const maxTotal = Math.max(...last7.map((d) => d.total), 60);
  const todayTotal = last7[6]?.total || 0;

  const last = growth[0];

  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7] rounded-3xl">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base text-gray-800 font-semibold">Crescimento</CardTitle>
          <Button size="sm" onClick={() => setOpenG(true)} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
            Registrar
          </Button>
        </CardHeader>
        <CardContent>
          {last ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Peso" value={last.weight_kg ? `${last.weight_kg} kg` : '—'} />
                <Stat label="Altura" value={last.height_cm ? `${last.height_cm} cm` : '—'} />
                <Stat label="Cabeça" value={last.head_cm ? `${last.head_cm} cm` : '—'} />
              </div>
              <div className="space-y-1">
                {growth.map((g) => (
                  <div key={g.id} className="flex justify-between text-sm bg-white/60 rounded-lg px-3 py-2">
                    <span className="text-gray-700">{fmtDate(g.recorded_at)}</span>
                    <span className="text-gray-800">
                      {[g.weight_kg && `${g.weight_kg}kg`, g.height_cm && `${g.height_cm}cm`].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Nenhuma medida registrada ainda.</p>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
        <CardHeader className="pl-5 flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Sono</CardTitle>
          <Button size="sm" onClick={() => setOpenS(true)} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
            Registrar
          </Button>
        </CardHeader>
        <CardContent className="pl-5 space-y-3">
          <p className="text-sm text-gray-700">
            Hoje: <span className="text-gray-900">{Math.floor(todayTotal / 60)}h {todayTotal % 60}min</span>
          </p>
          <div className="flex items-end justify-between gap-1 h-24">
            {last7.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#FD46A1]/70 rounded-t-md"
                  style={{ height: `${(d.total / maxTotal) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }}
                />
                <span className="text-[10px] text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openG} onOpenChange={setOpenG}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">Nova medida</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Data</Label>
              <MatDatePicker value={gForm.recorded_at} onChange={(v) => setGForm({ ...gForm, recorded_at: v })} />
            </div>
            <SuffixField label="Peso" suffix="kg" value={gForm.weight_kg} onChange={(v) => setGForm({ ...gForm, weight_kg: v })} step="0.01" />
            <SuffixField label="Altura" suffix="cm" value={gForm.height_cm} onChange={(v) => setGForm({ ...gForm, height_cm: v })} step="0.1" />
            <SuffixField label="Perímetro cefálico" suffix="cm" value={gForm.head_cm} onChange={(v) => setGForm({ ...gForm, head_cm: v })} step="0.1" />
          </div>
          <DialogFooter>
            <Button onClick={saveGrowth} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-xl">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openS} onOpenChange={setOpenS}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">Novo sono</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Tipo</Label>
              <Select value={sForm.kind} onValueChange={(v) => setSForm({ ...sForm, kind: v })}>
                <SelectTrigger className="text-base h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soneca">Soneca</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Início</Label>
              <MatDateTimePicker value={sForm.started_at} onChange={(v) => setSForm({ ...sForm, started_at: v })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Fim</Label>
              <MatDateTimePicker value={sForm.ended_at} onChange={(v) => setSForm({ ...sForm, ended_at: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveSleep} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-xl">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/70 rounded-xl px-2 py-2 text-center">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function SuffixField({
  label, suffix, value, onChange, step,
}: { label: string; suffix: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700">{label}</Label>
      <div className="flex items-center gap-2 bg-background rounded-xl h-12 pr-4 border border-input">
        <Input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-base h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
        />
        <span className="text-sm text-gray-500">{suffix}</span>
      </div>
    </div>
  );
}
