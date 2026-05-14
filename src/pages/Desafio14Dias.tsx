import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { challengeData, achievements } from "@/lib/desafio14/challengeData";
import { toast } from "sonner";
import { Lock, CheckCircle2, Trophy, Flame, Play, X, Camera, Sparkles, UtensilsCrossed, ListChecks, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type Profile = {
  initial_weight: number | null;
  motivation: string | null;
};

type DayProgress = {
  followed_menu: boolean;
  drank_water: boolean;
  walked: boolean;
  slept_well: boolean;
  notes: string | null;
  mood: string | null;
};

type WeightLog = { day_number: number; weight: number };

const MOODS = ["😄", "🙂", "😐", "😞", "😩"];
const CHECK_LABELS: Record<keyof Omit<DayProgress, "notes" | "mood">, string> = {
  followed_menu: "Segui o cardápio do dia",
  drank_water: "Bebi 2L+ de água",
  walked: "Fiz caminhada / atividade",
  slept_well: "Dormi bem (7h+)",
};

export default function Desafio14Dias() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [progressByDay, setProgressByDay] = useState<Record<number, DayProgress>>({});
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Onboarding form
  const [initWeight, setInitWeight] = useState("");
  const [motivation, setMotivation] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    const [{ data: prof }, { data: prog }, { data: done }, { data: wls }] = await Promise.all([
      supabase.from("challenge_user_profile").select("initial_weight,motivation").eq("id", user!.id).maybeSingle(),
      supabase.from("challenge_daily_checklist").select("day_number,followed_menu,drank_water,walked,slept_well,notes,mood").eq("user_id", user!.id),
      supabase.from("challenge_completed_days").select("day_number").eq("user_id", user!.id),
      supabase.from("challenge_weight_logs").select("day_number,weight").eq("user_id", user!.id).order("day_number"),
    ]);
    setProfile(prof as Profile | null);
    const map: Record<number, DayProgress> = {};
    (prog ?? []).forEach((r: any) => {
      map[r.day_number] = {
        followed_menu: r.followed_menu,
        drank_water: r.drank_water,
        walked: r.walked,
        slept_well: r.slept_well,
        notes: r.notes,
        mood: r.mood,
      };
    });
    setProgressByDay(map);
    setCompletedDays(new Set((done ?? []).map((d: any) => d.day_number)));
    setWeights((wls ?? []) as WeightLog[]);
    setLoading(false);
  }

  async function saveOnboarding() {
    const w = parseFloat(initWeight.replace(",", "."));
    if (!w || w < 30 || w > 300) {
      toast.error("Informe um peso válido");
      return;
    }
    setSavingProfile(true);
    const { error } = await supabase.from("challenge_user_profile").upsert({
      id: user!.id,
      initial_weight: w,
      motivation: motivation.trim() || null,
    });
    setSavingProfile(false);
    if (error) {
      toast.error("Erro ao salvar");
      return;
    }
    await supabase.from("challenge_progress").upsert(
      { user_id: user!.id, current_day: 1, start_date: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    toast.success("Bora começar! 💪");
    void loadAll();
  }

  function isDayUnlocked(day: number) {
    if (day === 1) return true;
    return completedDays.has(day - 1);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+5rem)] text-center text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  // Onboarding
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-32 space-y-4">
          <div className="relative">
            <motion.div
              aria-hidden
              className="absolute -inset-3 rounded-[40px] bg-[#FD46A1]/30 blur-2xl -z-10"
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[32px] p-6 text-white shadow-xl"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #FD46A1 0%, #FF7AB8 55%, #FFB3D5 100%)",
              }}
            >
              {/* Decorative blobs */}
              <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 mb-4"
              >
                <motion.span
                  animate={{ rotate: [0, 15, -10, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase">
                  Desafio Exclusivo
                </span>
              </motion.div>

              {/* Eyebrow */}
              <p className="text-xs text-white/85 mb-1">
                14 dias para uma nova versão
              </p>

              {/* Title */}
              <h1 className="font-black leading-[1] mb-3">
                <span className="block text-[28px]">Seu desafio de</span>
                <span className="flex items-end gap-2">
                  <span className="text-[64px] leading-[0.9] drop-shadow-sm">14</span>
                  <span className="text-[28px] pb-2">dias</span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm text-white/95 leading-relaxed mb-5">
                Cardápio guiado, vídeos diários e checklist.
                <br />
                Comece hoje, transforme em 2 semanas.
              </p>

              {/* Mini stats */}
              <div className="flex items-stretch gap-2 rounded-2xl bg-white/15 backdrop-blur-sm p-3">
                {[
                  { icon: UtensilsCrossed, num: "14", label: "cardápios" },
                  { icon: Play, num: "14", label: "vídeos" },
                  { icon: ListChecks, num: "4", label: "metas/dia" },
                ].map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center text-center">
                    <s.icon className="h-4 w-4 mb-1 opacity-90" />
                    <span className="text-base font-bold leading-none">{s.num}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-85 mt-0.5">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <Card className="bg-white rounded-3xl p-5 border-0 shadow-sm space-y-4">
            <div>
              <label className="text-base font-medium block mb-2">Seu peso inicial (kg)</label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="Ex.: 72.5"
                value={initWeight}
                onChange={(e) => setInitWeight(e.target.value)}
                className="text-base h-12 rounded-2xl"
              />
            </div>
            <div>
              <label className="text-base font-medium block mb-2">Sua motivação (opcional)</label>
              <Textarea
                placeholder="Por que você quer encarar esse desafio?"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="text-base rounded-2xl min-h-[100px]"
              />
            </div>
            <Button
              onClick={saveOnboarding}
              disabled={savingProfile}
              className="w-full h-12 rounded-2xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white text-base font-semibold"
            >
              Começar o desafio
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard
  const completedCount = completedDays.size;
  const percent = (completedCount / 14) * 100;
  const lastWeight = weights.length ? weights[weights.length - 1].weight : profile.initial_weight;
  const delta = lastWeight && profile.initial_weight ? lastWeight - profile.initial_weight : 0;

  // Inline day view (página dentro da página)
  if (selectedDay !== null) {
    // streak: dias consecutivos concluídos a partir do dia 1
    let streak = 0;
    for (let i = 1; i <= 14; i++) {
      if (completedDays.has(i)) streak++;
      else break;
    }
    const lastWeight = weights.length ? weights[weights.length - 1].weight : null;
    const weightDelta = lastWeight && profile?.initial_weight ? lastWeight - profile.initial_weight : null;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-32">
          <DayView
            day={selectedDay}
            userId={user!.id}
            progress={progressByDay[selectedDay]}
            weight={weights.find((w) => w.day_number === selectedDay)?.weight}
            isCompleted={completedDays.has(selectedDay)}
            streak={streak}
            weightDelta={weightDelta}
            onClose={() => setSelectedDay(null)}
            onSaved={async () => {
              await loadAll();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-32 space-y-4">
        {/* Header */}
        <Card className="bg-[#FFD1E7] rounded-3xl p-6 border-0 shadow-none">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-[#FD46A1]">Desafio 14 dias</h1>
            <div className="flex items-center gap-1 text-[#FD46A1]">
              <Flame size={18} />
              <span className="text-base font-semibold">{completedCount}/14</span>
            </div>
          </div>
          <Progress value={percent} className="h-2 bg-white/60" />
          <p className="text-sm text-foreground/70 mt-3">
            {completedCount === 14 ? "Você concluiu o desafio! 🏆" : `Faltam ${14 - completedCount} dias`}
          </p>
        </Card>

        {/* Peso */}
        {profile.initial_weight != null && (
          <Card className="bg-white rounded-3xl p-5 border-0 shadow-sm">
            <p className="text-base mb-1">Peso</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-[#FD46A1]">{lastWeight?.toFixed(1)} kg</p>
                <p className="text-xs text-muted-foreground">inicial: {profile.initial_weight.toFixed(1)} kg</p>
              </div>
              {delta !== 0 && (
                <span className={`text-base font-semibold ${delta < 0 ? "text-green-600" : "text-orange-500"}`}>
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)} kg
                </span>
              )}
            </div>
          </Card>
        )}

        {/* Conquistas */}
        <Card className="bg-white rounded-3xl p-5 border-0 shadow-sm">
          <p className="text-base mb-3">Conquistas</p>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((a) => {
              const earned = completedCount >= a.dayRequired;
              return (
                <div
                  key={a.id}
                  className={`rounded-2xl p-3 text-center ${earned ? "bg-[#FFD1E7]" : "bg-muted opacity-50"}`}
                >
                  <div className="text-3xl">{a.icon}</div>
                  <p className="text-xs mt-1 font-medium">{a.name}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Dias */}
        <Card className="bg-white rounded-3xl p-5 border-0 shadow-sm">
          <p className="text-base mb-3">Seus 14 dias</p>
          <div className="grid grid-cols-2 gap-3">
            {challengeData.map((d) => {
              const unlocked = isDayUnlocked(d.day);
              const done = completedDays.has(d.day);
              return (
                <button
                  key={d.day}
                  onClick={() => unlocked && setSelectedDay(d.day)}
                  disabled={!unlocked}
                  className={`rounded-2xl p-3 text-left transition ${
                    done
                      ? "bg-green-100 border border-green-300"
                      : unlocked
                        ? "bg-[#FFD1E7] hover:scale-[1.02]"
                        : "bg-muted opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#FD46A1]">Dia {d.day}</span>
                    {done ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : !unlocked ? (
                      <Lock size={14} className="text-muted-foreground" />
                    ) : (
                      <Play size={14} className="text-[#FD46A1]" />
                    )}
                  </div>
                  <p className="text-sm font-medium leading-tight">{d.title}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DayView({
  day,
  userId,
  progress,
  weight,
  isCompleted,
  streak,
  weightDelta,
  onClose,
  onSaved,
}: {
  day: number;
  userId: string;
  progress?: DayProgress;
  weight?: number;
  isCompleted: boolean;
  streak: number;
  weightDelta: number | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const data = challengeData.find((d) => d.day === day)!;
  const [checks, setChecks] = useState<DayProgress>(
    progress ?? { followed_menu: false, drank_water: false, walked: false, slept_well: false, notes: "", mood: null },
  );
  const [weightInput, setWeightInput] = useState(weight ? String(weight) : "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("challenge_progress_photos")
        .select("photo_url")
        .eq("user_id", userId)
        .eq("day_number", day)
        .eq("photo_type", "body")
        .maybeSingle();
      if (active) {
        setPhotoUrl(data?.photo_url ?? null);
        setPhotoLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, day]);

  const allChecked = checks.followed_menu && checks.drank_water && checks.walked && checks.slept_well;

  async function save(markComplete: boolean) {
    setSaving(true);
    try {
      await supabase.from("challenge_daily_checklist").upsert(
        {
          user_id: userId,
          day_number: day,
          followed_menu: checks.followed_menu,
          drank_water: checks.drank_water,
          walked: checks.walked,
          slept_well: checks.slept_well,
          notes: checks.notes,
          mood: checks.mood,
        },
        { onConflict: "user_id,day_number" },
      );

      const w = parseFloat(weightInput.replace(",", "."));
      if (w && w > 30 && w < 300) {
        await supabase.from("challenge_weight_logs").upsert(
          { user_id: userId, day_number: day, weight: w },
          { onConflict: "user_id,day_number" },
        );
      }

      if (markComplete && allChecked && !isCompleted) {
        await supabase.from("challenge_completed_days").insert({ user_id: userId, day_number: day });
        await supabase.from("challenge_progress").upsert(
          { user_id: userId, current_day: Math.min(day + 1, 14), is_completed: day === 14 },
          { onConflict: "user_id" },
        );
        toast.success(day === 14 ? "Você concluiu o desafio! 🏆" : `Dia ${day} concluído! Próximo desbloqueado 🎉`);
      } else {
        toast.success("Salvo");
      }

      await onSaved();
      onClose();
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `${userId}/dia-${day}-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("challenge-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("challenge-photos").getPublicUrl(path);
      await supabase.from("challenge_progress_photos").upsert(
        { user_id: userId, day_number: day, photo_type: "body", photo_url: pub.publicUrl },
        { onConflict: "user_id,day_number,photo_type" },
      );
      setPhotoUrl(pub.publicUrl);
      toast.success("Foto enviada");
    } catch {
      toast.error("Erro ao enviar foto");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removePhoto() {
    if (!photoUrl) return;
    const ok = window.confirm("Remover esta foto do progresso?");
    if (!ok) return;
    try {
      await supabase
        .from("challenge_progress_photos")
        .delete()
        .eq("user_id", userId)
        .eq("day_number", day)
        .eq("photo_type", "body");
      setPhotoUrl(null);
      toast.success("Foto removida");
    } catch {
      toast.error("Erro ao remover foto");
    }
  }

  const checkedCount = [checks.followed_menu, checks.drank_water, checks.walked, checks.slept_well].filter(Boolean).length;
  const dayIcons = [Sparkles, Flame, Sparkles, Flame, Trophy, Sparkles, Trophy, Sparkles, Flame, Sparkles, Flame, Sparkles, Flame, Trophy];
  const DayIcon = dayIcons[day - 1] ?? Sparkles;

  const dayProgress = Math.round((day / 14) * 100);

  return (
    <>
    <div className="space-y-4">
      {/* Header inspirado no card de Conquistas */}
      <div className="relative overflow-hidden rounded-[32px] bg-white border border-[#FFD1E7] shadow-xl shadow-pink-100 p-6">
        <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-[#FFD1E7] rounded-full blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-32 h-32 bg-[#FD46A1] rounded-full blur-3xl opacity-10" />

        <button
          onClick={onClose}
          aria-label="Voltar aos 14 dias"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#FD46A1] shadow-sm hover:bg-white transition border border-[#FFD1E7]"
        >
          <X size={18} />
        </button>

        <div className="relative z-10">
          {/* Header texto */}
          <div className="mb-6 pr-10">
            <h3 className="text-foreground text-lg font-bold leading-none mb-1">{data.title}</h3>
            <p className="text-[#FD46A1] text-xs font-semibold uppercase tracking-wider">
              Dia {day} de 14
            </p>
          </div>

          {/* Visual principal: ícone + número */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3] flex items-center justify-center shadow-lg shadow-pink-200">
                <DayIcon className="h-12 w-12 text-white" fill="white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100 whitespace-nowrap">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  Streak: {streak}
                </span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-5xl font-extrabold text-foreground tracking-tight leading-none">
                {checkedCount}<span className="text-2xl text-muted-foreground font-bold">/4</span>
              </span>
              <span className="text-sm font-medium text-muted-foreground mt-1">itens hoje</span>
            </div>
          </div>

          {/* Progresso da jornada */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-xs font-semibold text-foreground/80">
                Jornada: <span className="text-[#FD46A1]">14 dias</span>
              </p>
              <p className="text-[10px] font-bold text-muted-foreground">
                {day} / 14
              </p>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
              <div
                className="h-full bg-gradient-to-r from-[#FD46A1] to-[#ff8cb8] rounded-full shadow-[0_0_8px_rgba(253,70,161,0.4)] transition-all duration-700"
                style={{ width: `${dayProgress}%` }}
              />
            </div>
          </div>

          {/* Resumo / motivação */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
              {data.summary}
              {weightDelta !== null && (
                <> · <span className="text-[#FD46A1] font-bold">{weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} kg</span> desde o dia 1</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
          {/* Vídeo */}
          {data.videoUrl && (
            <video src={data.videoUrl} controls playsInline className="w-full rounded-2xl bg-black aspect-video" />
          )}

          {/* Mensagem */}
          <Card className="bg-[#FFD1E7] rounded-2xl p-4 border-0 shadow-none">
            <p className="text-sm">{data.motivationalMessage}</p>
          </Card>

          {/* Cardápio */}
          <Card className="bg-white rounded-2xl p-4 border shadow-none space-y-2">
            <p className="text-base font-medium mb-1">Cardápio</p>
            <p className="text-sm">
              <strong className="text-[#FD46A1]">Café:</strong> {data.menu.breakfast}
            </p>
            <p className="text-sm">
              <strong className="text-[#FD46A1]">Almoço:</strong> {data.menu.lunch}
            </p>
            <p className="text-sm">
              <strong className="text-[#FD46A1]">Jantar:</strong> {data.menu.dinner}
            </p>
          </Card>

          {/* Checklist em pills */}
          <Card className="bg-white rounded-2xl p-4 border shadow-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-medium">Checklist do dia</p>
              <span className="text-xs font-semibold text-[#FD46A1]">{checkedCount}/4</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CHECK_LABELS) as Array<keyof typeof CHECK_LABELS>).map((k) => {
                const active = checks[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setChecks({ ...checks, [k]: !active })}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition active:scale-95 ${
                      active
                        ? "bg-[#FD46A1] text-white shadow-sm"
                        : "bg-[#FFD1E7]/50 text-[#FD46A1] border border-[#FFD1E7]"
                    }`}
                  >
                    {active && <CheckCircle2 size={14} />}
                    {CHECK_LABELS[k]}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Humor */}
          <Card className="bg-white rounded-2xl p-4 border shadow-none">
            <p className="text-base font-medium mb-2">Como você se sente?</p>
            <div className="flex justify-between">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setChecks({ ...checks, mood: m })}
                  className={`text-3xl p-2 rounded-2xl transition ${checks.mood === m ? "bg-[#FFD1E7] scale-110 shadow-sm" : "opacity-60 hover:opacity-100"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Card>

          {/* Peso + Notas em grid 2 colunas */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white rounded-2xl p-4 border shadow-none">
              <p className="text-sm font-medium mb-2">Peso de hoje</p>
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="kg"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="text-base h-11 rounded-xl"
              />
            </Card>
            <Card className="bg-white rounded-2xl p-4 border shadow-none">
              <p className="text-sm font-medium mb-2">Humor (opcional)</p>
              <p className="text-xs text-muted-foreground">
                {checks.mood ? `Você marcou ${checks.mood}` : "Marque acima"}
              </p>
            </Card>
          </div>

          {/* Notas */}
          <Card className="bg-white rounded-2xl p-4 border shadow-none">
            <p className="text-base font-medium mb-2">Anotações</p>
            <Textarea
              placeholder="Como foi seu dia?"
              value={checks.notes ?? ""}
              onChange={(e) => setChecks({ ...checks, notes: e.target.value })}
              className="text-base rounded-2xl min-h-[80px]"
            />
          </Card>

          {/* Foto */}
          <Card className="bg-white rounded-2xl p-4 border shadow-none space-y-3">
            <div>
              <p className="text-base font-medium">Foto do progresso</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Salva no seu perfil. Só você consegue ver.
              </p>
            </div>

            {photoLoading ? (
              <div className="h-32 rounded-2xl bg-muted animate-pulse" />
            ) : photoUrl ? (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden bg-muted">
                  <img src={photoUrl} alt={`Progresso dia ${day}`} className="w-full max-h-72 object-cover" />
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-[#FFD1E7] text-[#FD46A1] text-sm font-medium cursor-pointer">
                    <Camera size={16} />
                    {uploading ? "Enviando..." : "Substituir"}
                    <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-4 h-11 rounded-2xl border border-destructive/30 text-destructive text-sm font-medium"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#FFD1E7] text-[#FD46A1] font-medium cursor-pointer">
                <Camera size={18} />
                {uploading ? "Enviando..." : "Tirar / enviar foto"}
                <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
              </label>
            )}
          </Card>

          {/* Salvar rascunho (concluir vai para o card abaixo) */}
          {!isCompleted && !allChecked && (
            <Button
              onClick={() => save(false)}
              disabled={saving}
              variant="outline"
              className="w-full h-12 rounded-2xl"
            >
              Salvar rascunho e voltar depois
            </Button>
          )}

          {/* Card de progresso + ação principal */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#FFD1E7] shadow-lg p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#FD46A1]">Dia {day}</span>
                <span className="text-xs text-muted-foreground">{checkedCount}/4 itens</span>
              </div>
              <div className="h-1.5 bg-[#FFD1E7]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FD46A1] transition-all duration-300"
                  style={{ width: `${(checkedCount / 4) * 100}%` }}
                />
              </div>
            </div>
            <Button
              onClick={() => save(true)}
              disabled={saving || !allChecked || isCompleted}
              className="h-11 px-4 rounded-xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white font-semibold shrink-0"
            >
              {isCompleted ? (
                <><Trophy className="mr-1.5" size={16} /> Concluído</>
              ) : allChecked ? (
                "Concluir dia"
              ) : (
                "Marque os 4"
              )}
            </Button>
          </div>
        </div>
    </div>
    </>
  );
}
