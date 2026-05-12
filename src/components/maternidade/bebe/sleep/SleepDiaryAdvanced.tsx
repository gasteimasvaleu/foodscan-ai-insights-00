import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Trash2, Play, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Sleep = {
  id: string;
  log_date: string;
  started_at: string;
  ended_at: string;
  kind: string;
  quality: number | null;
  notes: string | null;
};

const minBetween = (a: string, b: string) =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

const fmtDur = (m: number) => `${Math.floor(m / 60)}h ${m % 60}min`;

const toLocalInput = (d: Date) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

export function SleepDiaryAdvanced() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Sleep[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  const initialForm = () => ({
    kind: 'soneca',
    log_date: new Date().toISOString().slice(0, 10),
    started_at: toLocalInput(new Date(Date.now() - 60 * 60 * 1000)),
    ended_at: toLocalInput(new Date()),
    quality: '4',
    notes: '',
  });
  const [form, setForm] = useState(initialForm());

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('baby_sleep')
      .select('id, log_date, started_at, ended_at, kind, quality, notes')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(30);
    setLogs((data as Sleep[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('baby_sleep').insert({
      user_id: user.id,
      kind: form.kind,
      log_date: form.log_date,
      started_at: new Date(form.started_at).toISOString(),
      ended_at: new Date(form.ended_at).toISOString(),
      quality: Number(form.quality),
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Sono registrado');
    setOpen(false);
    setForm(initialForm());
    load();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('baby_sleep').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    setLogs(logs.filter((l) => l.id !== id));
  };

  const startTimer = () => {
    setTimerStart(new Date());
    toast.success('Cronômetro iniciado');
  };
  const stopTimer = () => {
    if (!timerStart) return;
    setForm({
      ...initialForm(),
      started_at: toLocalInput(timerStart),
      ended_at: toLocalInput(new Date()),
    });
    setTimerStart(null);
    setOpen(true);
  };

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = logs
      .filter((x) => x.started_at.slice(0, 10) === key)
      .reduce((s, x) => s + minBetween(x.started_at, x.ended_at), 0);
    return { key, label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), total };
  });
  const max = Math.max(...last7.map((d) => d.total), 60);
  const todayTotal = last7[6]?.total || 0;

  return (
    <Card className="bg-white/70 backdrop-blur-md border-white/40">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Diário de sono</CardTitle>
        <div className="flex items-center gap-2">
          {timerStart ? (
            <Button onClick={stopTimer} size="icon" aria-label="Parar cronômetro" className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-9 w-9 rounded-xl">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={startTimer} size="icon" aria-label="Iniciar cronômetro" className="h-9 w-9 rounded-xl">
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={() => { setForm(initialForm()); setOpen(true); }} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-9 px-3 rounded-xl">
            Registrar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">
          Hoje: <span className="text-gray-900">{fmtDur(todayTotal)}</span>
        </p>
        <div className="flex items-end justify-between gap-1 h-24">
          {last7.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#FD46A1]/70 rounded-t-md"
                style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total > 0 ? 4 : 0 }} />
              <span className="text-[10px] text-gray-500">{d.label}</span>
            </div>
          ))}
        </div>

        {logs.length > 0 && (
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {logs.map((l) => (
              <div key={l.id} className="bg-white/60 rounded-xl px-3 py-2 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {l.kind === 'noturno' ? 'Noturno' : 'Soneca'} · {fmtDur(minBetween(l.started_at, l.ended_at))}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(l.started_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {l.quality ? (
                  <span className="flex items-center gap-0.5 text-xs text-gray-700">
                    <Star className="h-3 w-3 fill-[#FD46A1] text-[#FD46A1]" />{l.quality}
                  </span>
                ) : null}
                <button onClick={() => del(l.id)} className="text-gray-400 hover:text-[#FD46A1]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">Registrar sono</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Tipo</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger className="text-base h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soneca">Soneca</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Início</Label>
              <Input type="datetime-local" value={form.started_at} onChange={(e) => setForm({ ...form, started_at: e.target.value })} className="text-base h-12 rounded-xl appearance-none text-left" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Fim</Label>
              <Input type="datetime-local" value={form.ended_at} onChange={(e) => setForm({ ...form, ended_at: e.target.value })} className="text-base h-12 rounded-xl appearance-none text-left" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Qualidade</Label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, quality: String(n) })}
                    className="p-1"
                  >
                    <Star className={`h-7 w-7 ${Number(form.quality) >= n ? 'fill-[#FD46A1] text-[#FD46A1]' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-base rounded-xl" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
