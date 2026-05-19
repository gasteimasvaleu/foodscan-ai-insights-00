import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, MessageCircle, Users, Sparkles, Activity } from "lucide-react";
import { useVenue } from "@/hooks/useVenues";

interface VenueMsg {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface MemberInfo {
  display_mode: "real" | "anonymous";
  display_alias: string | null;
  profile_name: string;
  avatar_url: string | null;
}

const PAGE_SIZE = 50;
const PRESENCE_INTERVAL_MS = 60_000;

const INTERACTIONS = [
  { type: "flirt", emoji: "💘", label: "Paquera" },
  { type: "drink", emoji: "🍹", label: "Oferecer drink" },
  { type: "sit_table", emoji: "🪑", label: "Convidar pra mesa" },
  { type: "pay_bill", emoji: "💸", label: "Pagar sua conta" },
] as const;

type InteractionType = (typeof INTERACTIONS)[number]["type"];

export default function ToAquiChat() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: venue } = useVenue(venueId);

  const [messages, setMessages] = useState<VenueMsg[]>([]);
  const [members, setMembers] = useState<Record<string, MemberInfo>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [needIdentity, setNeedIdentity] = useState(false);
  const [identityMode, setIdentityMode] = useState<"real" | "anonymous">("real");
  const [identityAlias, setIdentityAlias] = useState("");
  const [joining, setJoining] = useState(false);
  const [newInteractionsCount, setNewInteractionsCount] = useState(0);

  // Interactions drawer
  const [interactionTarget, setInteractionTarget] = useState<string | null>(null);
  const [sendingInteraction, setSendingInteraction] = useState<InteractionType | null>(null);

  // Mystery hint dialog
  const [hintOpen, setHintOpen] = useState(false);
  const [hintInput, setHintInput] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [hintSuggestions, setHintSuggestions] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const heartbeatRef = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const refreshMembers = useCallback(
    async (userIds: string[]) => {
      const missing = userIds.filter((id) => !members[id]);
      if (missing.length === 0 || !venueId) return;
      const [{ data: mems }, { data: profs }] = await Promise.all([
        supabase
          .from("venue_memberships")
          .select("user_id, display_mode, display_alias")
          .eq("venue_id", venueId)
          .in("user_id", missing),
        supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", missing),
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
      missing.forEach((id) => {
        if (!next[id]) {
          next[id] = {
            display_mode: "real",
            display_alias: null,
            profile_name: profMap[id]?.name ?? "Usuário",
            avatar_url: profMap[id]?.avatar_url ?? null,
          };
        }
      });
      setMembers((prev) => ({ ...prev, ...next }));
    },
    [members, venueId]
  );

  // Membership check
  useEffect(() => {
    if (!user || !venueId) return;
    (async () => {
      const { data } = await supabase
        .from("venue_memberships")
        .select("user_id")
        .eq("venue_id", venueId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data) {
        setNeedIdentity(true);
        setLoading(false);
      }
    })();
  }, [user, venueId]);

  // Messages + presence
  useEffect(() => {
    if (!user || !venueId || needIdentity) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("venue_messages")
        .select("id, user_id, content, created_at")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (cancelled) return;
      if (error) {
        toast({ title: "Erro ao carregar mensagens", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const msgs = (data ?? []).reverse() as VenueMsg[];
      const uniqueIds = Array.from(new Set([...msgs.map((m) => m.user_id), user.id]));
      await refreshMembers(uniqueIds);
      setMessages(msgs);
      setLoading(false);
      setTimeout(scrollToBottom, 50);
    })();

    const upsertPresence = async () => {
      await supabase
        .from("venue_presence")
        .upsert(
          { venue_id: venueId, user_id: user.id, last_seen: new Date().toISOString() },
          { onConflict: "venue_id,user_id" }
        );
    };
    upsertPresence();
    heartbeatRef.current = window.setInterval(upsertPresence, PRESENCE_INTERVAL_MS);

    const channel = supabase.channel(`venue-${venueId}`, {
      config: { presence: { key: user.id } },
    });
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "venue_messages", filter: `venue_id=eq.${venueId}` },
        async (payload) => {
          const msg = payload.new as VenueMsg;
          await refreshMembers([msg.user_id]);
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          setTimeout(scrollToBottom, 50);
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id });
        }
      });
    channelRef.current = channel;

    // Interactions channel (received + match notifications)
    const intChannel = supabase.channel(`venue-int-${venueId}-${user.id}`);
    intChannel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "venue_interactions",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const it = payload.new as { type: string; venue_id: string };
          if (it.venue_id !== venueId) return;
          const meta = INTERACTIONS.find((i) => i.type === it.type);
          if (!meta) return;
          setNewInteractionsCount((c) => c + 1);
          toast({
            title: `${meta.emoji} Alguém te mandou: ${meta.label}!`,
            description: "Retribua o sinal — se rolar match, abre a conversa.",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "venue_interactions",
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          const it = payload.new as { dm_conversation_id: string | null; venue_id: string };
          if (it.venue_id !== venueId || !it.dm_conversation_id) return;
          toast({
            title: "🎉 Vocês deram match!",
            description: "Abrir conversa privada?",
            action: (
              <button
                onClick={() => navigate(`/comunidade/dm/${it.dm_conversation_id}`)}
                className="bg-[#FD46A1] text-white px-3 py-1.5 rounded-full text-xs font-medium"
              >
                Abrir
              </button>
            ) as any,
          });
        }
      )
      .subscribe();

    // Contagem inicial de interações novas (recebidas desde última visita à atividade)
    (async () => {
      const seenKey = `toaqui-activity-seen-${venueId}-${user.id}`;
      const lastSeen = localStorage.getItem(seenKey) ?? "1970-01-01T00:00:00Z";
      const { count } = await supabase
        .from("venue_interactions")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("venue_id", venueId)
        .gt("created_at", lastSeen);
      if (!cancelled && typeof count === "number") setNewInteractionsCount(count);
    })();

    const fetchOnlineDb = async () => {
      const { data: oc } = await supabase.rpc("get_venue_online_count", { _venue_id: venueId });
      if (typeof oc === "number") {
        setOnlineCount((cur) => Math.max(cur, oc));
      }
    };
    fetchOnlineDb();
    const dbInterval = window.setInterval(fetchOnlineDb, 30_000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      supabase.removeChannel(intChannel);
      channelRef.current = null;
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
      window.clearInterval(dbInterval);
      supabase
        .from("venue_presence")
        .delete()
        .eq("venue_id", venueId)
        .eq("user_id", user.id)
        .then(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, venueId, needIdentity]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleJoin = async () => {
    if (!user || !venueId) return;
    const alias = identityMode === "anonymous" ? identityAlias.trim() : null;
    if (identityMode === "anonymous" && (!alias || alias.length < 2)) {
      toast({ title: "Escolha um apelido", description: "Mínimo 2 caracteres.", variant: "destructive" });
      return;
    }
    setJoining(true);
    const { error } = await supabase.from("venue_memberships").insert({
      venue_id: venueId,
      user_id: user.id,
      display_mode: identityMode,
      display_alias: alias,
    });
    setJoining(false);
    if (error) {
      toast({ title: "Erro ao entrar no chat", description: error.message, variant: "destructive" });
      return;
    }
    setNeedIdentity(false);
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || !user || !venueId || sending) return;
    if (text.length > 500) {
      toast({ title: "Mensagem muito longa", description: "Máximo 500 caracteres.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { data: inserted, error } = await supabase
      .from("venue_messages")
      .insert({ venue_id: venueId, user_id: user.id, content: text })
      .select("id, user_id, content, created_at")
      .single();
    setSending(false);
    if (error) {
      const msg = error.message || "";
      let friendly = "Erro ao enviar mensagem";
      if (msg.includes("blocked_word")) friendly = "Sua mensagem contém termos não permitidos.";
      else if (msg.includes("blocked_content")) friendly = "Links, telefones e emails não são permitidos.";
      else if (msg.includes("rate_limit")) friendly = "Aguarde alguns segundos antes de enviar mais mensagens.";
      toast({ title: "Não foi possível enviar", description: friendly, variant: "destructive" });
      return;
    }
    if (inserted) {
      setMessages((prev) =>
        prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted as VenueMsg]
      );
      setTimeout(scrollToBottom, 50);
    }
    if (!overrideText) setInput("");
  };

  const sendInteraction = async (type: InteractionType) => {
    if (!user || !venueId || !interactionTarget || sendingInteraction) return;
    setSendingInteraction(type);
    const { error } = await supabase.from("venue_interactions").insert({
      venue_id: venueId,
      sender_id: user.id,
      receiver_id: interactionTarget,
      type,
    });
    setSendingInteraction(null);
    if (error) {
      const msg = error.message || "";
      let friendly = "Não foi possível enviar o sinal";
      if (msg.includes("rate_limit")) friendly = "Limite de 20 interações por hora atingido.";
      else if (msg.includes("cooldown")) friendly = "Aguarde alguns segundos antes de enviar de novo.";
      toast({ title: "Erro", description: friendly, variant: "destructive" });
      return;
    }
    const meta = INTERACTIONS.find((i) => i.type === type)!;
    toast({
      title: `${meta.emoji} Sinal enviado!`,
      description: "É anônimo. Se a pessoa retribuir, vocês dão match 💞",
    });
    setInteractionTarget(null);
  };

  const generateHints = async () => {
    const text = hintInput.trim();
    if (text.length < 3) {
      toast({ title: "Escreva uma pista", description: "Mínimo 3 caracteres.", variant: "destructive" });
      return;
    }
    setHintLoading(true);
    setHintSuggestions([]);
    const { data, error } = await supabase.functions.invoke("venue-mystery-hint", {
      body: { raw_hint: text },
    });
    setHintLoading(false);
    if (error || !data?.hints) {
      toast({
        title: "Erro ao gerar dicas",
        description: (data as any)?.error || error?.message || "Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    setHintSuggestions(data.hints);
  };

  const pickHint = async (hint: string) => {
    const prefixed = `🔮 Dica misteriosa: ${hint}`;
    setHintOpen(false);
    setHintInput("");
    setHintSuggestions([]);
    await send(prefixed);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" size={32} />
      </div>
    );
  }

  const targetInfo = interactionTarget ? members[interactionTarget] : null;
  const targetName =
    targetInfo?.display_mode === "anonymous"
      ? targetInfo.display_alias || "Anônimo"
      : targetInfo?.profile_name || "Usuário";
  const targetIsAnon = targetInfo?.display_mode === "anonymous";

  return (
    <>
      {/* Identity dialog */}
      <Dialog open={needIdentity} onOpenChange={(o) => !o && navigate(-1)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#FD46A1]">Como você quer aparecer?</DialogTitle>
            <DialogDescription>Essa escolha vale só para este venue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <button
              onClick={() => setIdentityMode("real")}
              className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                identityMode === "real" ? "border-[#FD46A1] bg-[#FFD1E7]" : "border-gray-200 bg-white"
              }`}
            >
              <p className="font-medium text-gray-900">Meu nome real</p>
              <p className="text-xs text-gray-500">Outras pessoas verão seu nome do perfil.</p>
            </button>
            <button
              onClick={() => setIdentityMode("anonymous")}
              className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                identityMode === "anonymous" ? "border-[#FD46A1] bg-[#FFD1E7]" : "border-gray-200 bg-white"
              }`}
            >
              <p className="font-medium text-gray-900">Anônimo com apelido</p>
              <p className="text-xs text-gray-500">Escolha um apelido só pra este venue.</p>
            </button>
            {identityMode === "anonymous" && (
              <div className="space-y-1">
                <Label htmlFor="alias" className="text-xs">Apelido</Label>
                <Input
                  id="alias"
                  value={identityAlias}
                  onChange={(e) => setIdentityAlias(e.target.value)}
                  maxLength={24}
                  placeholder="Ex.: Mesa3, Misterioso..."
                  className="text-base"
                />
              </div>
            )}
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90"
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar no chat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactions drawer */}
      <Drawer open={!!interactionTarget} onOpenChange={(o) => !o && setInteractionTarget(null)}>
        <DrawerContent className="bg-white/70 backdrop-blur-md border-2 border-primary max-w-md mx-auto rounded-t-2xl">
          <DrawerHeader>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-12 h-12 rounded-full bg-[#FFD1E7] flex items-center justify-center overflow-hidden">
                {!targetIsAnon && targetInfo?.avatar_url ? (
                  <img src={targetInfo.avatar_url} alt={targetName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-[#FD46A1]">
                    {targetIsAnon ? "?" : targetName.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-left">
                <DrawerTitle className="text-[#FD46A1]">{targetName}</DrawerTitle>
                <DrawerDescription className="text-xs">
                  Sinal anônimo. Se retribuído, vira match 💞
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-3 p-4 pb-8">
            {INTERACTIONS.map((it) => (
              <button
                key={it.type}
                disabled={!!sendingInteraction}
                onClick={() => sendInteraction(it.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FFD1E7] active:scale-95 transition disabled:opacity-50"
              >
                <span className="text-3xl">
                  {sendingInteraction === it.type ? (
                    <Loader2 className="w-7 h-7 animate-spin text-[#FD46A1]" />
                  ) : (
                    it.emoji
                  )}
                </span>
                <span className="text-sm text-gray-800">{it.label}</span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mystery hint dialog */}
      <Dialog open={hintOpen} onOpenChange={(o) => { setHintOpen(o); if (!o) { setHintInput(""); setHintSuggestions([]); } }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#FD46A1] flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Dica misteriosa via IA
            </DialogTitle>
            <DialogDescription>
              Escreva pistas sobre você. A IA cria 3 dicas charmosas e anônimas pra mandar no chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              value={hintInput}
              onChange={(e) => setHintInput(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Camisa preta na mesa do canto, fã de rock, sotaque mineiro..."
              className="text-base resize-none"
            />
            <Button
              onClick={generateHints}
              disabled={hintLoading || hintInput.trim().length < 3}
              className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90"
            >
              {hintLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Gerar com IA</>
              )}
            </Button>
            {hintSuggestions.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-600">Toque numa pra enviar no chat:</p>
                {hintSuggestions.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => pickHint(h)}
                    className="w-full text-left p-3 rounded-2xl border-2 border-[#FFD1E7] hover:border-[#FD46A1] bg-white transition"
                  >
                    <span className="text-sm text-gray-800">🔮 {h}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed inset-0 flex flex-col bg-[#F7FAFB]">
        <div
          className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm shrink-0"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <div className="bg-[#FD46A1] p-2 rounded-xl">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#FD46A1] truncate">{venue?.name ?? "Chat do venue"}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {onlineCount} {onlineCount === 1 ? "pessoa online" : "pessoas online"}
            </p>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (user) {
                  localStorage.setItem(
                    `toaqui-activity-seen-${venueId}-${user.id}`,
                    new Date().toISOString()
                  );
                }
                setNewInteractionsCount(0);
                navigate(`/to-aqui/venue/${venueId}/atividade`);
              }}
              aria-label="Minha atividade neste venue"
              className={`text-[#FD46A1] ${newInteractionsCount > 0 ? "animate-pulse" : ""}`}
            >
              <Activity className="h-5 w-5" />
            </Button>
            {newInteractionsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FD46A1] text-white text-[10px] font-bold flex items-center justify-center shadow">
                {newInteractionsCount > 9 ? "9+" : newInteractionsCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/to-aqui/venue/${venueId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#FD46A1]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageCircle size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma mensagem ainda. Mande um oi!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.user_id === user.id;
              const info = members[m.user_id];
              const name =
                info?.display_mode === "anonymous"
                  ? info.display_alias || "Anônimo"
                  : info?.profile_name || "Usuário";
              const isAnon = info?.display_mode === "anonymous";
              const initials = name.slice(0, 1).toUpperCase();
              return (
                <div key={m.id} className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                  {!isMine && (
                    <button
                      onClick={() => setInteractionTarget(m.user_id)}
                      aria-label={`Interagir com ${name}`}
                      className="shrink-0 w-8 h-8 rounded-full bg-[#FFD1E7] flex items-center justify-center overflow-hidden active:scale-95 transition"
                    >
                      {!isAnon && info?.avatar_url ? (
                        <img src={info.avatar_url} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[#FD46A1]">{isAnon ? "?" : initials}</span>
                      )}
                    </button>
                  )}
                  <div className={`max-w-[78%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                    {!isMine && (
                      <button
                        onClick={() => setInteractionTarget(m.user_id)}
                        className="text-[11px] text-gray-500 mb-0.5 px-1 hover:text-[#FD46A1] transition"
                      >
                        {name}
                      </button>
                    )}
                    <div
                      onClick={() => !isMine && setInteractionTarget(m.user_id)}
                      className={`rounded-2xl px-3 py-2 text-base break-words [overflow-wrap:anywhere] ${
                        isMine
                          ? "bg-[#FD46A1] text-white rounded-br-md"
                          : "bg-[#FFD1E7] text-gray-800 rounded-bl-md cursor-pointer"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          className="border-t bg-white p-3 shrink-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <div className="flex gap-2 items-end">
            <Button
              type="button"
              onClick={() => setHintOpen(true)}
              size="icon"
              variant="outline"
              className="rounded-full h-11 w-11 shrink-0 border-[#FD46A1] text-[#FD46A1]"
              aria-label="Dica misteriosa via IA"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Mensagem..."
              rows={1}
              maxLength={500}
              disabled={needIdentity}
              className="flex-1 min-w-0 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-base placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FD46A1] max-h-28"
              style={{ minHeight: "42px" }}
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || sending || needIdentity}
              size="icon"
              className="rounded-full h-11 w-11 shrink-0 bg-[#FD46A1] hover:bg-[#FD46A1]/90"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
