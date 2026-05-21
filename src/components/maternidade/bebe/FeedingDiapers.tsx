import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Feeding = { id: string; fed_at: string; kind: string; amount_ml: number | null; duration_min: number | null };
type Diaper = { id: string; changed_at: string; kind: string };

const FEED_KINDS: Record<string, string> = {
  peito_esq: 'Peito esq.',
  peito_dir: 'Peito dir.',
  mamadeira: 'Mamadeira',
  papinha: 'Papinha',
};
const DIAPER_KINDS: Record<string, string> = { xixi: 'Xixi', coco: 'Cocô', mista: 'Mista' };

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function FeedingDiapers() {
  const { user } = useAuth();
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [diapers, setDiapers] = useState<Diaper[]>([]);
  const [feedDialog, setFeedDialog] = useState<{ open: boolean; kind: string }>({ open: false, kind: '' });
  const [form, setForm] = useState({ amount_ml: '', duration_min: '' });
  const [saving, setSaving] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);

  const load = async () => {
    if (!user) return;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [f, d] = await Promise.all([
      supabase.from('baby_feedings').select('id, fed_at, kind, amount_ml, duration_min')
        .eq('user_id', user.id).gte('fed_at', since.toISOString()).order('fed_at', { ascending: false }),
      supabase.from('baby_diapers').select('id, changed_at, kind')
        .eq('user_id', user.id).gte('changed_at', since.toISOString()).order('changed_at', { ascending: false }),
    ]);
    setFeedings((f.data as Feeding[]) || []);
    setDiapers((d.data as Diaper[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const quickFeed = (kind: string) => {
    if (kind === 'mamadeira' || kind === 'papinha' || kind === 'peito_esq' || kind === 'peito_dir') {
      setForm({ amount_ml: '', duration_min: '' });
      setFeedDialog({ open: true, kind });
    }
  };

  const saveFeed = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('baby_feedings').insert({
      user_id: user.id,
      fed_at: new Date().toISOString(),
      kind: feedDialog.kind,
      amount_ml: form.amount_ml ? Number(form.amount_ml) : null,
      duration_min: form.duration_min ? Number(form.duration_min) : null,
    });
    setSaving(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Registrado');
    setFeedDialog({ open: false, kind: '' });
    load();
  };

  const quickDiaper = async (kind: string) => {
    if (!user) return;
    const { error } = await supabase.from('baby_diapers').insert({
      user_id: user.id, changed_at: new Date().toISOString(), kind,
    });
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Fralda registrada');
    load();
  };

  const feedCounts = Object.keys(FEED_KINDS).reduce<Record<string, number>>((acc, k) => {
    acc[k] = feedings.filter((x) => x.kind === k).length;
    return acc;
  }, {});
  const diaperCounts = Object.keys(DIAPER_KINDS).reduce<Record<string, number>>((acc, k) => {
    acc[k] = diapers.filter((x) => x.kind === k).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7] rounded-3xl">
        <CardHeader className="pb-2"><CardTitle className="text-base text-gray-800 font-semibold">Alimentação</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FEED_KINDS).map(([k, label]) => (
              <button
                key={k}
                onClick={() => quickFeed(k)}
                className="bg-white/70 rounded-xl py-3 text-sm text-gray-800 hover:bg-white"
              >
                {label}
                <span className="block text-xs text-gray-500">{feedCounts[k]} hoje</span>
              </button>
            ))}
          </div>
          {feedings.length > 0 && (
            <div className="space-y-1">
              {feedings.slice(0, 5).map((f) => (
                <div key={f.id} className="flex justify-between text-sm bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-700">{fmtTime(f.fed_at)} · {FEED_KINDS[f.kind] || f.kind}</span>
                  <span className="text-gray-800">
                    {[f.amount_ml && `${f.amount_ml}ml`, f.duration_min && `${f.duration_min}min`].filter(Boolean).join(' · ') || '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
        <CardHeader className="pl-5 pb-2"><CardTitle className="text-base font-semibold">Fraldas</CardTitle></CardHeader>
        <CardContent className="pl-5 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(DIAPER_KINDS).map(([k, label]) => (
              <button
                key={k}
                onClick={() => quickDiaper(k)}
                className="bg-[#FFD1E7]/60 rounded-xl py-3 text-sm text-gray-800 hover:bg-[#FFD1E7]"
              >
                {label}
                <span className="block text-xs text-gray-500">{diaperCounts[k]} hoje</span>
              </button>
            ))}
          </div>
          {diapers.length > 0 && (
            <div className="space-y-1">
              {diapers.slice(0, 5).map((d) => (
                <div key={d.id} className="flex justify-between text-sm bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-gray-700">{fmtTime(d.changed_at)}</span>
                  <span className="text-gray-800">{DIAPER_KINDS[d.kind] || d.kind}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={feedDialog.open} onOpenChange={(o) => setFeedDialog({ ...feedDialog, open: o })}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{FEED_KINDS[feedDialog.kind] || 'Mamada'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <SuffixField label="Volume" suffix="ml" value={form.amount_ml} onChange={(v) => setForm({ ...form, amount_ml: v })} />
            <SuffixField label="Duração" suffix="min" value={form.duration_min} onChange={(v) => setForm({ ...form, duration_min: v })} />
            <p className="text-xs text-gray-500">Preencha o que fizer sentido — campos opcionais.</p>
          </div>
          <DialogFooter>
            <Button onClick={saveFeed} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-xl">
              {saving ? 'Salvando...' : 'Registrar agora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuffixField({
  label, suffix, value, onChange,
}: { label: string; suffix: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700">{label}</Label>
      <div className="flex items-center gap-2 bg-background rounded-xl h-12 pr-4 border border-input">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-base h-12 rounded-xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
        />
        <span className="text-sm text-gray-500">{suffix}</span>
      </div>
    </div>
  );
}
