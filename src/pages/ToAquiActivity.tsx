import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Activity, MessageCircle, RotateCcw, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useVenue } from "@/hooks/useVenues";

const INTERACTIONS: Record<string, { emoji: string; label: string }> = {
  flirt: { emoji: "💘", label: "Paquera" },
  drink: { emoji: "🍹", label: "Oferecer drink" },
  sit_table: { emoji: "🪑", label: "Convidar pra mesa" },
  pay_bill: { emoji: "💸", label: "Pagar a conta" },
};

interface Row {
  id: string;
  sender_id: string;
  receiver_id: string;
  type: string;
  created_at: string;
  dm_conversation_id: string | null;
  hidden_for_sender: boolean;
  hidden_for_receiver: boolean;
}

interface MemberInfo {
  display_mode: "real" | "anonymous";
  display_alias: string | null;
  profile_name: string;
  avatar_url: string | null;
}

type Filter = "all" | "sent" | "received" | "matches";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}

export default function ToAquiActivity() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: venue } = useVenue(venueId);

  const [rows, setRows] = useState<Row[]>([]);
  const [members, setMembers] = useState<Record<string, MemberInfo>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [retrying, setRetrying] = useState<string | null>(null);
  const [hidingId, setHidingId] = useState<string | null>(null);
  const [confirmHide, setConfirmHide] = useState<Row | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || !venueId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("venue_interactions")
        .select("id, sender_id, receiver_id, type, created_at, dm_conversation_id, hidden_for_sender, hidden_for_receiver")
        .eq("venue_id", venueId)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error) {
        toast({ title: "Erro ao carregar atividade", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const list = (data ?? []) as Row[];
      setRows(list);
      const otherIds = Array.from(
        new Set(list.map((r) => (r.sender_id === user.id ? r.receiver_id : r.sender_id)))
      );
      if (otherIds.length > 0) {
        const [{ data: mems }, { data: profs }] = await Promise.all([
          supabase
            .from("venue_memberships")
            .select("user_id, display_mode, display_alias")
            .eq("venue_id", venueId)
            .in("user_id", otherIds),
          supabase.from("profiles").select("id, name, avatar_url").in("id", otherIds),
        ]);
        const profMap: Record<string, { name: string; avatar_url: string | null }> = {};
        (profs ?? []).forEach((p: any) => {
          profMap[p.id] = { name: p.name ?? "Usuário", avatar_url: p.avatar_url };
        });
        const next: Record<string, MemberInfo> = {};
        (mems ?? []).forEach((m: any) => {
          next[m.user_id] = {
            display_mode: m.display_mode,
            display_alias: m.display_alias,
            profile_name: profMap[m.user_id]?.name ?? "Usuário",
            avatar_url: profMap[m.user_id]?.avatar_url ?? null,
          };
        });
        otherIds.forEach((id) => {
          if (!next[id]) {
            next[id] = {
              display_mode: "real",
              display_alias: null,
              profile_name: profMap[id]?.name ?? "Usuário",
              avatar_url: profMap[id]?.avatar_url ?? null,
            };
          }
        });
        setMembers(next);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, venueId]);

  const filtered = useMemo(() => {
    if (!user) return [] as Row[];
    return rows.filter((r) => {
      const isSent = r.sender_id === user.id;
      if (isSent && r.hidden_for_sender) return false;
      if (!isSent && r.hidden_for_receiver) return false;
      if (filter === "sent") return isSent;
      if (filter === "received") return r.receiver_id === user.id;
      if (filter === "matches") return !!r.dm_conversation_id;
      return true;
    });
  }, [rows, filter, user]);

  const hideRow = async (r: Row) => {
    if (!user || hidingId) return;
    setHidingId(r.id);
    const isSent = r.sender_id === user.id;
    const patch = isSent
      ? { hidden_for_sender: true }
      : { hidden_for_receiver: true };
    const { error } = await supabase
      .from("venue_interactions")
      .update(patch)
      .eq("id", r.id);
    setHidingId(null);
    setConfirmHide(null);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
  };

  const retribute = async (r: Row) => {
    if (!user || !venueId || retrying) return;
    setRetrying(r.id);
    const { error } = await supabase.from("venue_interactions").insert({
      venue_id: venueId,
      sender_id: user.id,
      receiver_id: r.sender_id,
      type: r.type,
    });
    setRetrying(null);
    if (error) {
      const msg = error.message || "";
      let friendly = "Não foi possível retribuir";
      if (msg.includes("rate_limit")) friendly = "Limite de 20 interações por hora atingido.";
      else if (msg.includes("cooldown")) friendly = "Aguarde alguns segundos antes de enviar de novo.";
      toast({ title: "Erro", description: friendly, variant: "destructive" });
      return;
    }
    const meta = INTERACTIONS[r.type];
    toast({
      title: `${meta?.emoji ?? "✨"} Retribuído!`,
      description: "Se rolar match, a conversa privada abre automaticamente.",
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFB]">
      <div
        className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm sticky top-0 z-20"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div className="bg-[#FD46A1] p-2 rounded-xl">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-[#FD46A1] truncate">Minha atividade</h1>
          <p className="text-xs text-gray-500 truncate">{venue?.name ?? "Venue"}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/to-aqui/venue/${venueId}/chat`)}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-3 pt-3 pb-2 flex gap-2 overflow-x-auto shrink-0 bg-white border-b">
        {([
          { k: "all", l: "Tudo" },
          { k: "received", l: "Recebidas" },
          { k: "sent", l: "Enviadas" },
          { k: "matches", l: "Matches 💞" },
        ] as { k: Filter; l: string }[]).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
              filter === f.k
                ? "bg-[#FD46A1] text-white border-[#FD46A1]"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="flex-1 px-3 py-3 space-y-2 pb-28">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#FD46A1]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16 px-6">
            <Activity size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma interação por aqui ainda.</p>
            <p className="text-xs mt-1">Mande um sinal no chat para começar 💘</p>
          </div>
        ) : (
          filtered.map((r) => {
            const isSent = r.sender_id === user.id;
            const otherId = isSent ? r.receiver_id : r.sender_id;
            const info = members[otherId];
            const isAnon = info?.display_mode === "anonymous";
            const name = isAnon
              ? info?.display_alias || "Anônimo"
              : info?.profile_name || "Usuário";
            const meta = INTERACTIONS[r.type] ?? { emoji: "✨", label: r.type };
            const matched = !!r.dm_conversation_id;
            return (
              <div
                key={r.id}
                className="bg-[#FFD1E7] rounded-3xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {!isAnon && info?.avatar_url ? (
                    <img src={info.avatar_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[#FD46A1]">
                      {isAnon ? "?" : name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    <span className="font-medium">{meta.emoji} {meta.label}</span>
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {isSent ? `Você → ${name}` : `${name} → você`} · {timeAgo(r.created_at)}
                  </p>
                </div>
                {matched ? (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/comunidade/dm/${r.dm_conversation_id}`)}
                    className="rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-8 px-3 shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    Abrir
                  </Button>
                ) : !isSent ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={retrying === r.id}
                    onClick={() => retribute(r)}
                    className="rounded-full border-[#FD46A1] text-[#FD46A1] h-8 px-3 shrink-0"
                  >
                    {retrying === r.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Retribuir
                      </>
                    )}
                  </Button>
                ) : (
                  <span className="text-[11px] text-gray-500 shrink-0 px-1">Aguardando</span>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmHide(r)}
                  aria-label="Remover da lista"
                  className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#FD46A1] hover:bg-white/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <AlertDialog open={!!confirmHide} onOpenChange={(o) => !o && setConfirmHide(null)}>
        <AlertDialogContent className="bg-white/70 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover essa interação?</AlertDialogTitle>
            <AlertDialogDescription>
              Ela vai sumir da sua lista, mas continua visível para a outra pessoa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!hidingId}
              onClick={() => confirmHide && hideRow(confirmHide)}
              className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
