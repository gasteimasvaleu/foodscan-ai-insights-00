import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Users, Brain, AlertTriangle, Clock, Check, Phone, ClipboardCheck, History, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';
import { toast } from 'sonner';

type CategoryKey = 'emotional' | 'physical' | 'behavioral' | 'cognitive';

interface SymptomsSectionProps {
  content: {
    title: string;
    intro: string;
    categories: Record<CategoryKey, { title: string; icon: string; items: string[] }>;
    timeline: { title: string; items: Array<{ period: string; description: string }> };
    redFlags: { title: string; items: string[]; action: string };
  };
  onGoToEpds?: () => void;
}

interface DayEntry {
  emotional: string[];
  physical: string[];
  behavioral: string[];
  cognitive: string[];
  redFlags: string[];
}

type Diary = Record<string, DayEntry>;

const STORAGE_KEY = 'posparto:sintomas:diary';
const iconMap: Record<string, React.ElementType> = { Heart, Activity, Users, Brain };

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const emptyEntry = (): DayEntry => ({ emotional: [], physical: [], behavioral: [], cognitive: [], redFlags: [] });

const pruneDiary = (diary: Diary): Diary => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const out: Diary = {};
  for (const [date, entry] of Object.entries(diary)) {
    if (new Date(date) >= cutoff) out[date] = entry;
  }
  return out;
};

const totalCount = (e: DayEntry) =>
  e.emotional.length + e.physical.length + e.behavioral.length + e.cognitive.length + e.redFlags.length;

export function SymptomsSection({ content, onGoToEpds }: SymptomsSectionProps) {
  const { user } = useAuth();
  const today = todayISO();
  const [diary, setDiary] = useState<Diary>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = matGet<Diary>(user?.id, STORAGE_KEY, {});
    setDiary(pruneDiary(stored));
    setLoaded(true);
  }, [user?.id]);

  const todayEntry = diary[today] ?? emptyEntry();

  const persist = (next: Diary) => {
    setDiary(next);
    matSet(user?.id, STORAGE_KEY, next);
  };

  const toggle = (cat: CategoryKey | 'redFlags', item: string) => {
    const current = diary[today] ?? emptyEntry();
    const list = current[cat];
    const updated: DayEntry = {
      ...current,
      [cat]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
    };
    persist({ ...diary, [today]: updated });
  };

  const clearToday = () => {
    const next = { ...diary };
    delete next[today];
    persist(next);
    toast.success('Registro de hoje limpo.');
  };

  const saveToday = () => {
    matSet(user?.id, STORAGE_KEY, diary);
    toast.success(`Registro salvo (${totalCount(todayEntry)} sintomas).`);
  };

  const lastDays = useMemo(() => {
    const arr: Array<{ date: string; entry: DayEntry }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      arr.push({ date: iso, entry: diary[iso] ?? emptyEntry() });
    }
    return arr;
  }, [diary]);

  const hasRedFlag = todayEntry.redFlags.length > 0;
  const categories = Object.entries(content.categories) as Array<[CategoryKey, typeof content.categories.emotional]>;

  return (
    <div className="space-y-4">
      {/* Intro */}
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
        </CardContent>
      </Card>

      {/* Checklist resumo do dia */}
      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-[#FD46A1]" />
              Como você está hoje?
            </span>
            <Badge className="bg-[#FFD1E7] text-[#FD46A1] border-0">
              {totalCount(todayEntry)} marcados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">
            Marque os sintomas que está sentindo. Salvamos automaticamente para você acompanhar a evolução.
          </p>
        </CardContent>
      </Card>

      {/* Banner de alerta */}
      {hasRedFlag && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Atenção: você marcou sinais de alerta</p>
                <p className="text-xs text-red-600 mt-1">{content.redFlags.action}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {onGoToEpds && (
                <Button onClick={onGoToEpds} className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90" size="sm">
                  Fazer auto-avaliação
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="flex-1 border-red-300 text-red-700 hover:bg-red-100">
                <a href="tel:188"><Phone className="h-4 w-4 mr-1" />Ligar 188</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorias com chips */}
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(([key, cat]) => {
          const Icon = iconMap[cat.icon] || Heart;
          const selected = todayEntry[key];
          return (
            <Card key={key} className="bg-white/70 backdrop-blur-md border-white/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-[#FD46A1]" />
                    {cat.title}
                  </span>
                  {selected.length > 0 && (
                    <Badge className="bg-[#FFD1E7] text-[#FD46A1] border-0 text-xs">{selected.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-start">
                  {cat.items.map((item) => {
                    const active = selected.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={!loaded}
                        onClick={() => toggle(key, item)}
                        className={`text-xs text-left px-3 py-1.5 rounded-lg border transition-all inline-flex items-center gap-1 ${
                          active
                            ? 'bg-[#FFD1E7] border-[#FD46A1] text-[#FD46A1]'
                            : 'bg-white border-pink-100 text-gray-700 hover:border-[#FD46A1]/50'
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sinais de alerta (chips separados) */}
      <Card className="border-2 border-red-200 bg-red-50/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {content.redFlags.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-start">
            {content.redFlags.items.map((item) => {
              const active = todayEntry.redFlags.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  disabled={!loaded}
                  onClick={() => toggle('redFlags', item)}
                  className={`text-xs text-left px-3 py-1.5 rounded-lg border transition-all inline-flex items-center gap-1 ${
                    active
                      ? 'bg-red-200 border-red-500 text-red-800'
                      : 'bg-white border-red-200 text-red-700 hover:border-red-400'
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {item}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-2">
        <Button onClick={saveToday} className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90">
          <Check className="h-4 w-4 mr-2" />
          Salvar registro de hoje
        </Button>
        <Button onClick={clearToday} variant="outline" className="border-pink-200">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Histórico 7 dias */}
      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5 text-[#FD46A1]" />
            Últimos 7 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lastDays.map(({ date, entry }) => {
              const total = totalCount(entry);
              const hasFlag = entry.redFlags.length > 0;
              return (
                <div
                  key={date}
                  className={`flex items-center justify-between p-2 rounded-xl border ${
                    hasFlag ? 'bg-red-50 border-red-200' : total > 0 ? 'bg-[#FFD1E7]/50 border-pink-200' : 'bg-white border-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    </span>
                    {date === today && (
                      <Badge className="bg-[#FD46A1] text-white border-0 text-[10px]">hoje</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasFlag && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <span className="text-xs text-gray-600">
                      {total === 0 ? 'sem registro' : `${total} sintoma${total > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline informativa */}
      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FD46A1]" />
            {content.timeline.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content.timeline.items.map((it, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FD46A1]" />
                  {i < content.timeline.items.length - 1 && <div className="w-0.5 h-12 bg-pink-200" />}
                </div>
                <div className="pb-2">
                  <Badge variant="secondary" className="mb-1 bg-[#FFD1E7] text-[#FD46A1]">{it.period}</Badge>
                  <p className="text-sm text-gray-700">{it.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
