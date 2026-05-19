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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Loader2, MessageCircle, Users } from "lucide-react";
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
      // Fallback for users without membership row (shouldn't happen but safe)
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

  // Check membership; show identity dialog if missing
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

  // Load messages + subscribe once we have membership
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

    // Presence heartbeat
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

    // Realtime channel: messages + presence sync via venue_presence postgres_changes + supabase presence
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

    // Refresh online count from DB periodically (fallback if presence misses)
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
      channelRef.current = null;
      if (heartbeatRef.current) window.clearInterval(heartbeatRef.current);
      window.clearInterval(dbInterval);
      // Best-effort presence cleanup
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

  const send = async () => {
    const text = input.trim();
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
    setInput("");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" size={32} />
      </div>
    );
  }

  return (
    <>
      <Dialog open={needIdentity} onOpenChange={(o) => !o && navigate(-1)}>
        <DialogContent className="bg-white/70 backdrop-blur-md rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#FD46A1]">Como você quer aparecer?</DialogTitle>
            <DialogDescription>
              Essa escolha vale só para este venue.
            </DialogDescription>
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

      <div className="fixed inset-0 flex flex-col bg-[#F7FAFB]">
        <div
          className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm shrink-0"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(`/to-aqui/venue/${venueId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#FFD1E7] flex items-center justify-center overflow-hidden">
                      {!isAnon && info?.avatar_url ? (
                        <img src={info.avatar_url} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[#FD46A1]">{isAnon ? "?" : initials}</span>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[78%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                    {!isMine && (
                      <span className="text-[11px] text-gray-500 mb-0.5 px-1">{name}</span>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 text-base break-words [overflow-wrap:anywhere] ${
                        isMine
                          ? "bg-[#FD46A1] text-white rounded-br-md"
                          : "bg-[#FFD1E7] text-gray-800 rounded-bl-md"
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
              onClick={send}
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
