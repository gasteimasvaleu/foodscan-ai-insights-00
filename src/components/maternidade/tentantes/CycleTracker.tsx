import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Info } from 'lucide-react';
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
import { Select, SelectValue } from '@/components/ui/select';
import { GlassSelectTrigger as SelectTrigger, GlassSelectContent as SelectContent, GlassSelectItem as SelectItem } from '@/components/maternidade/GlassSelect';

import { MatDatePicker } from '@/components/maternidade/MatDatePicker';
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

      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
        <CardHeader className="pl-5">
          <CardTitle className="text-base font-semibold">Histórico</CardTitle>
          <CardDescription>Últimos ciclos registrados</CardDescription>
        </CardHeader>
        <CardContent className="pl-5">
          {cycles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#FD46A1]/20 bg-[#FFD1E7]/20 p-4 text-center">
              <p className="text-sm text-muted-foreground">Nenhum ciclo registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.map((c) => {
                const visibleSymptoms = c.symptoms?.slice(0, 4) ?? [];
                const extraSymptoms = (c.symptoms?.length ?? 0) - visibleSymptoms.length;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{fmtDate(c.cycle_start_date)}</span>
                          <Badge className="text-[10px] px-1.5 py-0 bg-[#FFD1E7]/60 text-[#FD46A1] border border-[#FD46A1]/20 hover:bg-[#FFD1E7]/60">
                            Ciclo {c.cycle_length_days}d
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{c.period_length_days} dias de menstruação</span>
                          {c.flow && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{c.flow}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(c.id)}
                        className="shrink-0 h-8 w-8 text-[#FD46A1]/70 hover:text-[#FD46A1] hover:bg-[#FFD1E7]/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {visibleSymptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {visibleSymptoms.map((s) => (
                          <Badge key={s} variant="secondary" className="bg-white text-gray-700 text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {extraSymptoms > 0 && (
                          <Badge variant="secondary" className="bg-white text-gray-700 text-[10px]">
                            +{extraSymptoms}
                          </Badge>
                        )}
                      </div>
                    )}

                    {c.notes && (
                      <div className="flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2">
                        <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{c.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Novo ciclo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">1º dia da menstruação</Label>
              <MatDatePicker
                value={form.cycle_start_date}
                onChange={(v) => setForm({ ...form, cycle_start_date: v })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Duração do ciclo</Label>
              <div className="flex items-center gap-2 bg-background rounded-xl h-12 pr-4 border border-input">
                <Input
                  type="number"
                  min={20}
                  max={45}
                  value={form.cycle_length_days}
                  onChange={(e) => setForm({ ...form, cycle_length_days: Number(e.target.value) || 28 })}
                  className="text-base h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                />
                <span className="text-sm text-gray-500">dias</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Duração da menstruação</Label>
              <div className="flex items-center gap-2 bg-background rounded-xl h-12 pr-4 border border-input">
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={form.period_length_days}
                  onChange={(e) => setForm({ ...form, period_length_days: Number(e.target.value) || 5 })}
                  className="text-base h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                />
                <span className="text-sm text-gray-500">dias</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Fluxo</Label>
              <Select value={form.flow} onValueChange={(v) => setForm({ ...form, flow: v })}>
                <SelectTrigger className="text-base h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="intenso">Intenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Humor (opcional)</Label>
              <Input
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: e.target.value })}
                placeholder="Ex: irritada, animada..."
                className="text-base h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Sintomas</Label>
              <div className="flex flex-wrap gap-2">
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
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="text-base rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-xl">
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
