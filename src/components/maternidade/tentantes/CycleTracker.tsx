import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Cycle {
  id: string;
  cycle_start_date: string;
  cycle_length_days: number;
  period_length_days: number;
  flow: string | null;
  mood: string | null;
  symptoms: string[];
  notes: string | null;
}

const SYMPTOMS = ['Cólica', 'Dor de cabeça', 'Inchaço', 'Acne', 'Cansaço', 'Irritabilidade', 'Seios sensíveis', 'Náusea'];

const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export function CycleTracker() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    cycle_start_date: new Date().toISOString().slice(0, 10),
    cycle_length_days: 28,
    period_length_days: 5,
    flow: 'moderado',
    mood: '',
    symptoms: [] as string[],
    notes: '',
  });

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('cycle_start_date', { ascending: false })
      .limit(12);
    if (!error && data) setCycles(data as Cycle[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const stats = (() => {
    if (cycles.length < 2) return null;
    const lengths = cycles.map((c) => c.cycle_length_days);
    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    const variance = lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / lengths.length;
    const sd = Math.sqrt(variance);
    const last = cycles[0];
    const next = new Date(last.cycle_start_date + 'T00:00:00');
    next.setDate(next.getDate() + last.cycle_length_days);
    return { avg, sd, next };
  })();

  const toggleSymptom = (s: string) =>
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(s) ? f.symptoms.filter((x) => x !== s) : [...f.symptoms, s],
    }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('menstrual_cycles').insert({
      user_id: user.id,
      cycle_start_date: form.cycle_start_date,
      cycle_length_days: form.cycle_length_days,
      period_length_days: form.period_length_days,
      flow: form.flow || null,
      mood: form.mood || null,
      symptoms: form.symptoms,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Ciclo registrado!' });
    setOpen(false);
    setForm((f) => ({ ...f, mood: '', symptoms: [], notes: '' }));
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('menstrual_cycles').delete().eq('id', id);
    if (!error) {
      setCycles((cs) => cs.filter((c) => c.id !== id));
      toast({ title: 'Ciclo removido' });
    }
  };

  return (
    <div className="space-y-4">
      {stats && (
        <Card className="border-none bg-[#FFD1E7]">
          <CardContent className="pt-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="Duração média" value={`${stats.avg}d`} />
            <Stat label="Variação" value={`±${stats.sd.toFixed(1)}d`} />
            <Stat label="Próxima" value={stats.next.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} />
          </CardContent>
        </Card>
      )}

      <Button
        onClick={() => setOpen(true)}
        className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl"
      >
        Registrar novo ciclo
      </Button>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum ciclo registrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {cycles.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-[#FFD1E7]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{fmtDate(c.cycle_start_date)}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="secondary" className="bg-white text-gray-700 text-[10px]">
                        Ciclo {c.cycle_length_days}d
                      </Badge>
                      {c.flow && (
                        <Badge variant="secondary" className="bg-white text-gray-700 text-[10px] capitalize">
                          {c.flow}
                        </Badge>
                      )}
                      {c.symptoms?.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="bg-white text-gray-700 text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    {c.notes && <p className="text-xs text-gray-600 mt-1">{c.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(c.id)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white/70 backdrop-blur-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Novo ciclo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">1º dia da menstruação</Label>
              <Input
                type="date"
                value={form.cycle_start_date}
                onChange={(e) => setForm({ ...form, cycle_start_date: e.target.value })}
                className="text-base mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Duração do ciclo (dias)</Label>
                <Input
                  type="number"
                  min={20}
                  max={45}
                  value={form.cycle_length_days}
                  onChange={(e) => setForm({ ...form, cycle_length_days: Number(e.target.value) || 28 })}
                  className="text-base mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Duração da menstruação</Label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={form.period_length_days}
                  onChange={(e) => setForm({ ...form, period_length_days: Number(e.target.value) || 5 })}
                  className="text-base mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Fluxo</Label>
              <Select value={form.flow} onValueChange={(v) => setForm({ ...form, flow: v })}>
                <SelectTrigger className="text-base mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="intenso">Intenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Humor (opcional)</Label>
              <Input
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
                placeholder="Ex: irritada, animada..."
                className="text-base mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Sintomas</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border ${
                      form.symptoms.includes(s)
                        ? 'bg-[#FD46A1] text-white border-[#FD46A1]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="text-base mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
              {saving ? 'Salvando...' : 'Salvar ciclo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-base font-medium text-[#FD46A1]">{value}</p>
      <p className="text-[10px] text-gray-600">{label}</p>
    </div>
  );
}
