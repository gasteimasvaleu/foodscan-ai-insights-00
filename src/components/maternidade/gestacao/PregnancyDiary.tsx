import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Meh, Frown, Heart, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DiaryEntry { id: string; date: string; mood: string | null; symptoms: string[]; notes: string; }

const moods = [
  { value: 'happy', icon: Smile },
  { value: 'neutral', icon: Meh },
  { value: 'sad', icon: Frown },
  { value: 'loved', icon: Heart },
];
const symptomList = ['Enjoo','Cansaço','Dor nas costas','Inchaço','Azia','Insônia','Ansiedade','Contrações'];

export const PregnancyDiary = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState('');
  const [selSymptoms, setSelSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setEntries(matGet<DiaryEntry[]>(user?.id, 'gestacao:diario', []));
  }, [user?.id]);

  const save = () => {
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mood: mood || null,
      symptoms: selSymptoms,
      notes,
    };
    const next = [entry, ...entries].slice(0, 50);
    setEntries(next);
    matSet(user?.id, 'gestacao:diario', next);
    setMood(''); setSelSymptoms([]); setNotes(''); setOpen(false);
  };

  const toggle = (s: string) =>
    setSelSymptoms((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base text-gray-800">Diário da Gestação</h3>
          <p className="text-xs text-gray-600 mt-0.5">Registre memórias e sintomas</p>
        </div>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="bg-white/70 hover:bg-white text-[#FD46A1] border border-white/60 backdrop-blur-md h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Nova entrada
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-4">Nenhuma entrada ainda. Comece seu diário!</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {entries.slice(0, 5).map((e) => {
            const Mood = moods.find((m) => m.value === e.mood)?.icon;
            return (
              <div key={e.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {format(new Date(e.date), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </span>
                  {Mood && <Mood className="w-4 h-4 text-[#FD46A1]" />}
                </div>
                {e.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {e.symptoms.map((s) => (
                      <span key={s} className="text-[10px] bg-[#FD46A1]/10 text-[#FD46A1] rounded-full px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                )}
                {e.notes && <p className="text-sm text-gray-700">{e.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#FD46A1]">Nova Entrada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Como você está se sentindo?</label>
              <div className="grid grid-cols-4 gap-2">
                {moods.map((m) => {
                  const Icon = m.icon;
                  const active = mood === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`h-12 rounded-2xl flex items-center justify-center transition ${
                        active ? 'bg-[#FD46A1] text-white' : 'bg-white/80 text-[#FD46A1] border border-white/60'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Sintomas</label>
              <div className="flex flex-wrap gap-2">
                {symptomList.map((s) => {
                  const active = selSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggle(s)}
                      className={`text-xs rounded-full px-3 py-1.5 ${
                        active ? 'bg-[#FD46A1] text-white' : 'bg-white/80 text-gray-700 border border-white/60'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Notas</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como você está se sentindo hoje?"
                rows={3}
                className="bg-white/80 border-white/60 text-base"
              />
            </div>
            <Button onClick={save} className="w-full bg-[#FD46A1] hover:bg-[#E24989] text-white">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
