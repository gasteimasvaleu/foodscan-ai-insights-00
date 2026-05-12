import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MatDatePicker } from '@/components/maternidade/MatDatePicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Growth = { id: string; recorded_at: string; weight_kg: number | null; height_cm: number | null; head_cm: number | null };

const fmtDate = (s: string) =>
  new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export function GrowthCard() {
  const { user } = useAuth();
  const [growth, setGrowth] = useState<Growth[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ recorded_at: today, weight_kg: '', height_cm: '', head_cm: '' });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('baby_growth')
      .select('id, recorded_at, weight_kg, height_cm, head_cm')
      .eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(6);
    setGrowth((data as Growth[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('baby_growth').insert({
      user_id: user.id,
      recorded_at: form.recorded_at,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      head_cm: form.head_cm ? Number(form.head_cm) : null,
    });
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Medida registrada');
    setOpen(false);
    setForm({ recorded_at: today, weight_kg: '', height_cm: '', head_cm: '' });
    load();
  };

  const last = growth[0];

  return (
    <Card className="border-none bg-[#FFD1E7] rounded-3xl">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base text-gray-800 font-semibold">Crescimento</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">Nova medida</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Data</Label>
              <MatDatePicker value={form.recorded_at} onChange={(v) => setForm({ ...form, recorded_at: v })} />
            </div>
            <Field label="Peso" suffix="kg" value={form.weight_kg} onChange={(v) => setForm({ ...form, weight_kg: v })} step="0.01" />
            <Field label="Altura" suffix="cm" value={form.height_cm} onChange={(v) => setForm({ ...form, height_cm: v })} step="0.1" />
            <Field label="Perímetro cefálico" suffix="cm" value={form.head_cm} onChange={(v) => setForm({ ...form, head_cm: v })} step="0.1" />
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-xl">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
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

function Field({ label, suffix, value, onChange, step }: { label: string; suffix: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700">{label}</Label>
      <div className="flex items-center gap-2 bg-background rounded-xl h-12 pr-4 border border-input">
        <Input type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)}
          className="text-base h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1" />
        <span className="text-sm text-gray-500">{suffix}</span>
      </div>
    </div>
  );
}
