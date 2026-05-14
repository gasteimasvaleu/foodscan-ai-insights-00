import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Loader2, MessageCircle, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  other: { id: string; name: string; avatar_url: string | null } | null;
  lastMessage: string;
  unreadCount: number;
}

export default function DMList() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: convs } = await supabase
      .from("dm_conversations")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    const list = (convs || []) as any[];
    if (list.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const otherIds = list.map((c) => (c.user_a === user.id ? c.user_b : c.user_a));
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", otherIds);
    const profMap = new Map((profs || []).map((p: any) => [p.id, p]));

    // Fetch last message and unread count per conversation
    const enriched: Conversation[] = await Promise.all(
      list.map(async (c) => {
        const otherId = c.user_a === user.id ? c.user_b : c.user_a;
        const { data: lastMsg } = await supabase
          .from("dm_messages")
          .select("content, image_url, sender_id")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const { count: unread } = await supabase
          .from("dm_messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .neq("sender_id", user.id)
          .is("read_at", null);
        return {
          id: c.id,
          user_a: c.user_a,
          user_b: c.user_b,
          last_message_at: c.last_message_at,
          other: profMap.get(otherId) || null,
          lastMessage: lastMsg?.content || (lastMsg?.image_url ? "📷 Foto" : ""),
          unreadCount: unread || 0,
        };
      })
    );
    setConversations(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("dm_list_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages" },
        () => fetchConversations()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pb-28 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
        <div className="max-w-lg mx-auto px-3 pt-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <button onClick={() => navigate("/comunidade")} className="p-1.5" aria-label="Voltar">
              <ArrowLeft size={22} className="text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-[#FD46A1]">Mensagens</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhuma conversa ainda</p>
              <p className="text-sm">Toque em um perfil ou story para começar.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/comunidade/dm/${c.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary overflow-hidden flex-shrink-0">
                    {c.other?.avatar_url ? (
                      <img src={c.other.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (c.other?.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{c.other?.name || "Usuário"}</p>
                      <p className="text-[11px] text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: false, locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{c.lastMessage || "—"}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="bg-[#FD46A1] text-white text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 font-bold">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
