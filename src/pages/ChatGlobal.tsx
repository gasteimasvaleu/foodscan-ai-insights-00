import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Loader2, MoreVertical, Flag, Trash2, MessageCircle } from "lucide-react";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { compressImage } from "@/lib/imageCompression";

interface ChatMsg {
  id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  is_deleted: boolean;
  profile?: { name: string; avatar_url: string | null } | null;
}

const PAGE_SIZE = 50;

export default function ChatGlobal() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [profilesCache, setProfilesCache] = useState<
    Record<string, { name: string; avatar_url: string | null }>
  >({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Fetch profile of a user_id and cache it
  const ensureProfile = useCallback(
    async (userId: string) => {
      if (profilesCache[userId]) return profilesCache[userId];
      const { data } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setProfilesCache((prev) => ({
          ...prev,
          [userId]: { name: data.name, avatar_url: data.avatar_url },
        }));
        return { name: data.name, avatar_url: data.avatar_url };
      }
      return null;
    },
    [profilesCache]
  );

  // Initial load
  useEffect(() => {
    if (!user) return;
    // Pre-carrega o profile do próprio usuário para uso na atualização otimista
    ensureProfile(user.id);
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, user_id, content, created_at, is_deleted")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (error) {
        toast({ title: "Erro ao carregar mensagens", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const msgs = (data || []).reverse() as ChatMsg[];
      // Fetch profiles for unique users
      const uniqueIds = Array.from(new Set(msgs.map((m) => m.user_id)));
      if (uniqueIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", uniqueIds);
        const cache: Record<string, { name: string; avatar_url: string | null }> = {};
        (profs || []).forEach((p) => {
          cache[p.id] = { name: p.name, avatar_url: p.avatar_url };
        });
        setProfilesCache(cache);
      }
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => scrollToBottom(), 50);
    })();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("chat-global", {
      config: { presence: { key: user.id } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          const msg = payload.new as ChatMsg;
          if (msg.is_deleted) return;
          await ensureProfile(msg.user_id);
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => scrollToBottom(), 50);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as ChatMsg;
          setMessages((prev) =>
            msg.is_deleted
              ? prev.filter((m) => m.id !== msg.id)
              : prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          const oldMsg = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, Array<{ name?: string; typing?: boolean }>>;
        const ids = Object.keys(state);
        setOnlineCount(ids.length);
        const typing: string[] = [];
        ids.forEach((id) => {
          if (id === user.id) return;
          const meta = state[id]?.[0];
          if (meta?.typing && meta.name) typing.push(meta.name);
        });
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const profile = await ensureProfile(user.id);
          await channel.track({
            user_id: user.id,
            name: profile?.name || "Usuário",
            typing: false,
          });
        }
      });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleTyping = async () => {
    if (!channelRef.current || !user) return;
    const profile = profilesCache[user.id];
    await channelRef.current.track({
      user_id: user.id,
      name: profile?.name || "Usuário",
      typing: true,
    });
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(async () => {
      await channelRef.current?.track({
        user_id: user.id,
        name: profile?.name || "Usuário",
        typing: false,
      });
    }, 1500);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !user || sending) return;
    if (text.length > 500) {
      toast({ title: "Mensagem muito longa", description: "Máximo 500 caracteres.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { data: inserted, error } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, content: text })
      .select("id, user_id, content, created_at, is_deleted")
      .single();
    setSending(false);
    if (error) {
      const msg = error.message || "";
      let friendly = "Erro ao enviar mensagem";
      if (msg.includes("blocked_word")) friendly = "Sua mensagem contém termos não permitidos.";
      else if (msg.includes("rate_limit")) friendly = "Aguarde alguns segundos antes de enviar mais mensagens.";
      toast({ title: "Não foi possível enviar", description: friendly, variant: "destructive" });
      return;
    }
    if (inserted) {
      await ensureProfile(user.id);
      setMessages((prev) =>
        prev.some((m) => m.id === inserted.id) ? prev : [...prev, inserted as ChatMsg]
      );
      setTimeout(() => scrollToBottom(), 50);
    }
    setInput("");
  };

  const handleReport = async (messageId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("chat_reports")
      .insert({ message_id: messageId, reporter_id: user.id, reason: "Conteúdo inadequado" });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Já denunciada", description: "Você já denunciou esta mensagem." });
      } else {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      }
      return;
    }
    toast({ title: "Denúncia enviada", description: "Obrigado! Nossa equipe vai analisar." });
  };

  const handleDeleteOwn = async (messageId: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("id", messageId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm shrink-0"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <Button variant="ghost" size="icon" onClick={() => navigate("/comunidade")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-[#FD46A1] truncate">Chat ao vivo</h1>
          <p className="text-xs text-muted-foreground">
            {onlineCount} {onlineCount === 1 ? "pessoa online" : "pessoas online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <MessageCircle size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma mensagem ainda. Seja o primeiro!</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.user_id === user.id;
            const prof = profilesCache[m.user_id];
            const name = prof?.name || "Usuário";
            const initials = name.slice(0, 1).toUpperCase();
            return (
              <div key={m.id} className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    {prof?.avatar_url ? (
                      <img src={prof.avatar_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{initials}</span>
                    )}
                  </div>
                )}
                <div className={`max-w-[78%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                  {!isMine && (
                    <span className="text-[11px] text-muted-foreground mb-0.5 px-1">{name}</span>
                  )}
                  <div className="flex items-end gap-1">
                    <div
                      className={`rounded-2xl px-3 py-2 text-base break-words [overflow-wrap:anywhere] ${
                        isMine
                          ? "bg-[#FD46A1] text-white rounded-br-md"
                          : "bg-[#FFD1E7] text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {m.content}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="opacity-50 hover:opacity-100 p-1">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isMine ? "end" : "start"}>
                        {isMine ? (
                          <DropdownMenuItem onClick={() => handleDeleteOwn(m.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Apagar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleReport(m.id)}>
                            <Flag className="w-4 h-4 mr-2" /> Denunciar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <p className="text-xs italic text-muted-foreground px-2">
            {typingUsers.slice(0, 2).join(", ")} {typingUsers.length === 1 ? "está" : "estão"} digitando...
          </p>
        )}
      </div>

      {/* Input */}
      <div
        className="border-t bg-white p-3 shrink-0"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Mensagem..."
            rows={1}
            maxLength={500}
            className="flex-1 min-w-0 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-h-28"
            style={{ minHeight: "42px" }}
          />
          <Button
            onClick={send}
            disabled={!input.trim() || sending}
            size="icon"
            className="rounded-full h-11 w-11 shrink-0 bg-[#FD46A1] hover:bg-[#FD46A1]/90"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
