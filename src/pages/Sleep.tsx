
import { useState, useEffect, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Brain, Apple, Dumbbell, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Star, TrendingUp, Calendar, Flame, Clock, Plus, Trash2, Sun, MessageCircle } from 'lucide-react';
import { format, subDays, startOfDay, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { WheelPicker } from '@/components/ui/wheel-picker';
import { WhatsAppNotice } from '@/components/WhatsAppNotice';
import { toast } from 'sonner';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: String(i),
}));

const MINUTES = Array.from({ length: 12 }, (_, i) => ({
  label: String(i * 5).padStart(2, '0'),
  value: String(i * 5),
}));

const QUALITY_LABELS = ['', 'Péssima', 'Ruim', 'Regular', 'Boa', 'Excelente'];

const TAG_OPTIONS = [
  { label: 'Pesadelos', value: 'pesadelos' },
  { label: 'Ronco', value: 'ronco' },
  { label: 'Acordou à noite', value: 'acordou' },
  { label: 'Sonhou bem', value: 'sonhou_bem' },
  { label: 'Insônia', value: 'insonia' },
  { label: 'Dormiu rápido', value: 'dormiu_rapido' },
];

const Sleep = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ avgMinutes: 0, streak: 0, bestMinutes: 0, consistency: 0 });
  const [loading, setLoading] = useState(true);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bedHour, setBedHour] = useState('23');
  const [bedMinute, setBedMinute] = useState('0');
  const [wakeHour, setWakeHour] = useState('7');
  const [wakeMinute, setWakeMinute] = useState('0');
  const [quality, setQuality] = useState(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Motivational category state
  const [motivationalCategory, setMotivationalCategory] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [hasWhatsApp, setHasWhatsApp] = useState<boolean | null>(null);

  const MOTIVATIONAL_CATEGORIES = [
    { key: 'gratidao', label: 'Gratidão', emoji: '🙏' },
    { key: 'energia', label: 'Energia', emoji: '⚡' },
    { key: 'saude', label: 'Saúde', emoji: '💚' },
    { key: 'foco', label: 'Foco', emoji: '🎯' },
    { key: 'superacao', label: 'Superação', emoji: '🔥' },
  ];

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
    const { data } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('sleep_date', thirtyDaysAgo)
      .order('sleep_date', { ascending: false });

    const all = data || [];
    setRecords(all);

    if (all.length > 0) {
      const durations = all.map(r => r.duration_minutes);
      const avg = durations.reduce((a: number, b: number) => a + b, 0) / durations.length;
      const best = Math.max(...durations);

      // Streak
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const dayStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (all.some((r: any) => r.sleep_date === dayStr)) streak++;
        else if (i > 0) break;
      }

      // Consistency: std dev of bedtime hours
      const bedtimeHours = all.slice(0, 7).map((r: any) => {
        const d = new Date(r.bedtime);
        let h = d.getHours() + d.getMinutes() / 60;
        if (h < 12) h += 24; // normalize past midnight
        return h;
      });
      let consistency = 100;
      if (bedtimeHours.length > 1) {
        const mean = bedtimeHours.reduce((a, b) => a + b, 0) / bedtimeHours.length;
        const variance = bedtimeHours.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bedtimeHours.length;
        const stdDev = Math.sqrt(variance);
        consistency = Math.max(0, Math.round(100 - stdDev * 20));
      }

      setStats({
        avgMinutes: Math.round(avg),
        streak,
        bestMinutes: best,
        consistency,
      });
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load motivational category and WhatsApp status
  useEffect(() => {
    if (!user?.id) return;
    const loadMotivational = async () => {
      const [{ data: profile }, { data: whatsapp }] = await Promise.all([
        supabase.from('profiles').select('motivational_category').eq('id', user.id).single(),
        supabase.from('whatsapp_subscriptions').select('id').eq('user_id', user.id).eq('verified', true).limit(1).maybeSingle(),
      ]);
      setMotivationalCategory(profile?.motivational_category || null);
      setHasWhatsApp(!!whatsapp);
    };
    loadMotivational();
  }, [user?.id]);

  const handleSaveCategory = async (category: string | null) => {
    if (!user?.id) return;
    setSavingCategory(true);
    const { error } = await supabase
      .from('profiles')
      .update({ motivational_category: category } as any)
      .eq('id', user.id);
    setSavingCategory(false);
    if (error) {
      toast.error('Erro ao salvar preferência');
      return;
    }
    setMotivationalCategory(category);
    toast.success(category ? 'Mensagem motivacional ativada! 🌅' : 'Mensagem motivacional desativada');
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const today = new Date();
    const bedtime = new Date(today);
    bedtime.setHours(parseInt(bedHour), parseInt(bedMinute), 0, 0);
    // If bedtime hour is >= 12, assume it was yesterday
    if (parseInt(bedHour) >= 12) {
      bedtime.setDate(bedtime.getDate() - 1);
    }

    const wakeTime = new Date(today);
    wakeTime.setHours(parseInt(wakeHour), parseInt(wakeMinute), 0, 0);

    let duration = differenceInMinutes(wakeTime, bedtime);
    if (duration <= 0) duration += 24 * 60;

    const sleepDate = format(today, 'yyyy-MM-dd');

    const { error } = await supabase.from('sleep_records').insert({
      user_id: user.id,
      sleep_date: sleepDate,
      bedtime: bedtime.toISOString(),
      wake_time: wakeTime.toISOString(),
      duration_minutes: duration,
      quality_rating: quality,
      tags: selectedTags,
      notes: notes || null,
    });

    if (error) {
      toast.error('Erro ao salvar registro');
      return;
    }

    toast.success('Sono registrado!');
    setIsDrawerOpen(false);
    setSelectedTags([]);
    setNotes('');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('sleep_records').delete().eq('id', id);
    toast.success('Registro removido');
    fetchData();
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  };

  // Week data for chart
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const lastSunday = subDays(today, currentDayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(lastSunday, -i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const record = records.find((r: any) => r.sleep_date === dayStr);
    return {
      label: format(day, 'EEE', { locale: ptBR }),
      date: format(day, 'dd/MM'),
      hours: record ? Math.round(record.duration_minutes / 60 * 10) / 10 : 0,
      quality: record ? record.quality_rating : 0,
      hasRecord: !!record,
    };
  });

  if (!user) return <AuthCard />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-[calc(env(safe-area-inset-top)+4rem)] pb-40">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  const todayRecord = records.find((r: any) => r.sleep_date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="min-h-screen bg-background pt-[calc(env(safe-area-inset-top)+4rem)] pb-40">
      <Navbar />
      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-primary">Sono</h1>
        </div>

        {user && <WhatsAppNotice userId={user.id} />}

        {/* Today Summary / Register Button */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Registro de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayRecord ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background rounded-2xl p-3 text-center">
                    <span className="text-lg font-bold text-foreground">{formatDuration(todayRecord.duration_minutes)}</span>
                    <p className="text-[9px] text-muted-foreground">Duração</p>
                  </div>
                  <div className="bg-background rounded-2xl p-3 text-center">
                    <span className="text-lg font-bold text-foreground">{format(new Date(todayRecord.bedtime), 'HH:mm')}</span>
                    <p className="text-[9px] text-muted-foreground">Dormiu</p>
                  </div>
                  <div className="bg-background rounded-2xl p-3 text-center">
                    <span className="text-lg font-bold text-foreground">{format(new Date(todayRecord.wake_time), 'HH:mm')}</span>
                    <p className="text-[9px] text-muted-foreground">Acordou</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < todayRecord.quality_rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">{QUALITY_LABELS[todayRecord.quality_rating]}</span>
                </div>
                {todayRecord.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {todayRecord.tags.map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {TAG_OPTIONS.find(t => t.value === tag)?.label || tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => setIsDrawerOpen(true)} className="w-full rounded-full gap-2">
                <Plus className="w-4 h-4" /> Registrar Sono de Hoje
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Week History */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => {
                const barHeight = day.hasRecord ? Math.max(10, (day.hours / 10) * 60) : 4;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-muted-foreground capitalize">{day.label}</span>
                    <div className="w-full h-[70px] flex items-end justify-center">
                      <div
                        className={`w-6 rounded-t-lg transition-all ${
                          day.hasRecord
                            ? day.hours >= 7
                              ? 'bg-green-400'
                              : day.hours >= 5
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            : 'bg-muted'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-foreground">
                      {day.hasRecord ? `${day.hours}h` : '-'}
                    </span>
                    <span className="text-[8px] text-muted-foreground">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-2xl p-3 text-center">
                <Moon className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{formatDuration(stats.avgMinutes)}</span>
                <p className="text-[9px] text-muted-foreground">Média de sono</p>
              </div>
              <div className="bg-background rounded-2xl p-3 text-center">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{stats.streak}</span>
                <p className="text-[9px] text-muted-foreground">Dias seguidos</p>
              </div>
              <div className="bg-background rounded-2xl p-3 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{formatDuration(stats.bestMinutes)}</span>
                <p className="text-[9px] text-muted-foreground">Melhor noite</p>
              </div>
              <div className="bg-background rounded-2xl p-3 text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-lg font-bold text-foreground">{stats.consistency}%</span>
                <p className="text-[9px] text-muted-foreground">Consistência</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent History */}
        {records.length > 0 && (
          <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">Histórico Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {records.slice(0, 7).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between bg-background rounded-xl p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {format(new Date(record.sleep_date + 'T12:00:00'), 'dd/MM/yyyy')}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < record.quality_rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                          />
                         ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(record.bedtime), 'HH:mm')} → {format(new Date(record.wake_time), 'HH:mm')} · {formatDuration(record.duration_minutes)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Motivational Message Card */}
        <Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-500" /> Mensagem Motivacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Receba uma mensagem motivacional personalizada por WhatsApp todos os dias às 6:00. 🌅
            </p>

            {hasWhatsApp === false ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs text-amber-900">Configure o WhatsApp primeiro para usar este recurso.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      disabled={savingCategory}
                      onClick={() => handleSaveCategory(motivationalCategory === cat.key ? null : cat.key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        motivationalCategory === cat.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
                {motivationalCategory && (
                  <p className="text-[10px] text-primary text-center">
                    ✅ Ativo · Categoria: {MOTIVATIONAL_CATEGORIES.find(c => c.key === motivationalCategory)?.label}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DrawerHeader>
            <DrawerTitle className="text-center text-foreground">Registrar Sono</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Bedtime */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Horário que dormiu</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <WheelPicker
                    value={bedHour}
                    onChange={setBedHour}
                    options={HOURS}
                  />
                </div>
                <span className="flex items-center text-lg font-bold text-foreground">:</span>
                <div className="flex-1">
                  <WheelPicker
                    value={bedMinute}
                    onChange={setBedMinute}
                    options={MINUTES}
                  />
                </div>
              </div>
            </div>

            {/* Wake time */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Horário que acordou</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <WheelPicker
                    value={wakeHour}
                    onChange={setWakeHour}
                    options={HOURS}
                  />
                </div>
                <span className="flex items-center text-lg font-bold text-foreground">:</span>
                <div className="flex-1">
                  <WheelPicker
                    value={wakeMinute}
                    onChange={setWakeMinute}
                    options={MINUTES}
                  />
                </div>
              </div>
            </div>

            {/* Quality */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Qualidade do sono</p>
              <div className="flex items-center gap-2 justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <button key={i} onClick={() => setQuality(i + 1)}>
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        i < quality ? 'text-yellow-400 fill-yellow-400' : 'text-muted'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">{QUALITY_LABELS[quality]}</p>
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Tags (opcional)</p>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag.value}
                    onClick={() =>
                      setSelectedTags(prev =>
                        prev.includes(tag.value)
                          ? prev.filter(t => t !== tag.value)
                          : [...prev, tag.value]
                      )
                    }
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedTags.includes(tag.value)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background text-foreground border-border'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DrawerFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSave}>
              Salvar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Sleep;
