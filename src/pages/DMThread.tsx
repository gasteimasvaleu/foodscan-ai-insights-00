import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChatInputBar } from "@/components/chat/ChatInputBar";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  read_at: string | null;
}

export default function DMThread() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id: convId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<{ id: string; name: string; avatar_url: string | null } | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchAll = async () => {
    if (!user || !convId) return;
    const { data: conv } = await supabase
      .from("dm_conversations")
      .select("*")
      .eq("id", convId)
      .maybeSingle();
    if (!conv) {
      toast({ title: "Conversa não encontrada", variant: "destructive" });
      navigate("/comunidade/dm");
      return;
    }
    const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("id", otherId)
      .maybeSingle();
    setOther(prof || { id: otherId, name: "Usuário", avatar_url: null });

    const { data: msgs } = await supabase
      .from("dm_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((msgs || []) as Message[]);
    setLoading(false);

    // Mark all as read
    await supabase
      .from("dm_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", convId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId, user]);

  // Realtime
  useEffect(() => {
    if (!convId || !user) return;
    const ch = supabase
      .channel(`dm_thread_${convId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dm_messages", filter: `conversation_id=eq.${convId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
          if (m.sender_id !== user.id) {
            supabase
              .from("dm_messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", m.id)
              .then(() => {});
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [convId, user]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 8MB", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const send = async () => {
    if (!user || !convId) return;
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      let imageUrl: string | null = null;
      if (file) {
        const base64 = await compressImage(file, 1200, 0.85);
        const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("dm-media")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("dm-media").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from("dm_messages").insert({
        conversation_id: convId,
        sender_id: user.id,
        content: text.trim() || null,
        image_url: imageUrl,
      });
      if (error) throw error;
      setText("");
      setFile(null);
      setPreview(null);
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] border-b bg-card">
        <button onClick={() => navigate("/comunidade/dm")} className="p-2" aria-label="Voltar">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden flex-shrink-0">
          {other?.avatar_url ? (
            <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            (other?.name || "?").charAt(0).toUpperCase()
          )}
        </div>
        <p className="font-semibold text-foreground truncate flex-1">{other?.name || "Usuário"}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Comece a conversa enviando uma mensagem.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl overflow-hidden",
                    mine ? "bg-[#FD46A1] text-white" : "bg-muted text-foreground"
                  )}
                >
                  {m.image_url && (
                    <img src={m.image_url} alt="" className="w-full max-h-80 object-cover" />
                  )}
                  {m.content && (
                    <p className="px-3 py-2 text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  )}
                  <p
                    className={cn(
                      "px-3 pb-1 text-[10px]",
                      mine ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {format(new Date(m.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t bg-card p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {preview && (
          <div className="relative inline-block mb-2 ml-2">
            <img src={preview} alt="" className="h-20 rounded-xl object-cover" />
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute -top-1.5 -right-1.5 bg-[#FD46A1] text-white rounded-full p-0.5"
              aria-label="Remover"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => inputFileRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-primary"
            aria-label="Anexar foto"
          >
            <ImagePlus size={22} />
          </button>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectFile}
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Mensagem..."
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-base outline-none border border-transparent focus:border-primary/40"
          />
          <button
            onClick={send}
            disabled={sending || (!text.trim() && !file)}
            className="bg-[#FD46A1] disabled:opacity-40 text-white p-2.5 rounded-full"
            aria-label="Enviar"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
