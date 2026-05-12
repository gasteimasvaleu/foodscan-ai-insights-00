import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Trash2, Plus, Shield } from "lucide-react";

interface Report {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  message?: { id: string; content: string; user_id: string; is_deleted: boolean } | null;
}

interface BannedWord {
  id: string;
  word: string;
  severity: string;
}

export default function AdminChat() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [words, setWords] = useState<BannedWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [tab, setTab] = useState<"reports" | "words">("reports");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      setChecking(false);
    })();
  }, [user, loading, navigate]);

  const loadReports = async () => {
    const { data } = await supabase
      .from("chat_reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const reportsList = (data || []) as Report[];
    // Fetch related messages
    const ids = Array.from(new Set(reportsList.map((r) => r.message_id)));
    if (ids.length > 0) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("id, content, user_id, is_deleted")
        .in("id", ids);
      const byId: Record<string, Report["message"]> = {};
      (msgs || []).forEach((m) => (byId[m.id] = m));
      setReports(reportsList.map((r) => ({ ...r, message: byId[r.message_id] || null })));
    } else {
      setReports([]);
    }
  };

  const loadWords = async () => {
    const { data } = await supabase
      .from("chat_banned_words")
      .select("*")
      .order("word", { ascending: true });
    setWords((data || []) as BannedWord[]);
  };

  useEffect(() => {
    if (isAdmin) {
      loadReports();
      loadWords();
    }
  }, [isAdmin]);

  const deleteMessage = async (messageId: string, reportId: string) => {
    await supabase.from("chat_messages").update({ is_deleted: true, deleted_reason: "Removida pelo admin" }).eq("id", messageId);
    await supabase.from("chat_reports").update({ status: "reviewed" }).eq("id", reportId);
    toast({ title: "Mensagem removida" });
    loadReports();
  };

  const dismissReport = async (reportId: string) => {
    await supabase.from("chat_reports").update({ status: "dismissed" }).eq("id", reportId);
    toast({ title: "Denúncia dispensada" });
    loadReports();
  };

  const addWord = async () => {
    const w = newWord.trim().toLowerCase();
    if (!w) return;
    const { error } = await supabase.from("chat_banned_words").insert({ word: w, severity: "block" });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setNewWord("");
    loadWords();
  };

  const removeWord = async (id: string) => {
    await supabase.from("chat_banned_words").delete().eq("id", id);
    loadWords();
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Shield className="mx-auto h-12 w-12 text-destructive" />
          <p>Acesso negado</p>
          <Button onClick={() => navigate("/")} variant="outline">Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Moderação do Chat</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant={tab === "reports" ? "default" : "outline"}
            onClick={() => setTab("reports")}
            className={tab === "reports" ? "bg-[#FD46A1] hover:bg-[#FD46A1]/90" : ""}
          >
            Denúncias ({reports.length})
          </Button>
          <Button
            variant={tab === "words" ? "default" : "outline"}
            onClick={() => setTab("words")}
            className={tab === "words" ? "bg-[#FD46A1] hover:bg-[#FD46A1]/90" : ""}
          >
            Palavras banidas ({words.length})
          </Button>
        </div>

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma denúncia pendente</p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="bg-[#FFD1E7] rounded-2xl p-4 space-y-2">
                  <p className="text-base text-gray-800">
                    {r.message?.is_deleted ? (
                      <em className="text-muted-foreground">[mensagem já removida]</em>
                    ) : (
                      r.message?.content || "[mensagem não encontrada]"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Motivo: {r.reason || "—"} • {new Date(r.created_at).toLocaleString("pt-BR")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => r.message && deleteMessage(r.message.id, r.id)}
                      disabled={!r.message || r.message.is_deleted}
                    >
                      Apagar mensagem
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => dismissReport(r.id)}>
                      Dispensar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "words" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Nova palavra banida"
                onKeyDown={(e) => e.key === "Enter" && addWord()}
              />
              <Button onClick={addWord} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white rounded-2xl divide-y border">
              {words.map((w) => (
                <div key={w.id} className="flex items-center justify-between px-4 py-2">
                  <span className="text-base">{w.word}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeWord(w.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
