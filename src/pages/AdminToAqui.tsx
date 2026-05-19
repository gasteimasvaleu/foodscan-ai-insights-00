import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, MapPin, Check, X, EyeOff, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VENUE_CATEGORIES, type Venue } from "@/hooks/useVenues";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type StatusTab = "pending" | "approved" | "rejected";

const AdminToAqui = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<StatusTab>("pending");

  useEffect(() => {
    const check = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      setChecking(false);
    };
    if (!loading) {
      if (!user) navigate("/auth");
      else check();
    }
  }, [user, loading, navigate]);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["admin-venues", tab],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("status", tab)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Venue[];
    },
  });

  const mutate = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Venue> }) => {
      const { error } = await supabase.from("venues").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-venues"] });
      qc.invalidateQueries({ queryKey: ["venues"] });
      toast.success("Venue atualizado");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-venues"] });
      qc.invalidateQueries({ queryKey: ["venues"] });
      toast.success("Venue excluído");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao excluir"),
  });

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="mx-auto h-12 w-12 text-destructive mb-2" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta área.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline">Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Tô Aqui — Moderação</h1>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-12">Carregando…</p>
            ) : venues.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum venue nesta lista.</p>
            ) : (
              <ul className="space-y-3">
                {venues.map((v) => {
                  const cat = VENUE_CATEGORIES.find((c) => c.value === v.category);
                  return (
                    <li
                      key={v.id}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="w-24 h-24 shrink-0 rounded-2xl bg-[#FFD1E7] overflow-hidden flex items-center justify-center text-3xl">
                          {v.photo_url ? (
                            <img src={v.photo_url} alt={v.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <span>{cat?.emoji ?? "📍"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base text-gray-900 truncate">{v.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-primary shrink-0">
                              {cat?.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{v.city}</p>
                          {v.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{v.description}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(v.created_at).toLocaleString("pt-BR")} · {v.is_active ? "ativo" : "inativo"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 px-3 pb-3">
                        {tab !== "approved" && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 rounded-full"
                            disabled={mutate.isPending}
                            onClick={() => mutate.mutate({ id: v.id, patch: { status: "approved", is_active: true } })}
                          >
                            <Check className="h-4 w-4 mr-1" /> Aprovar
                          </Button>
                        )}
                        {tab !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={mutate.isPending}
                            onClick={() => mutate.mutate({ id: v.id, patch: { status: "rejected" } })}
                          >
                            <X className="h-4 w-4 mr-1" /> Rejeitar
                          </Button>
                        )}
                        {tab === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            disabled={mutate.isPending}
                            onClick={() =>
                              mutate.mutate({ id: v.id, patch: { is_active: !v.is_active } })
                            }
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            {v.is_active ? "Desativar" : "Reativar"}
                          </Button>
                        )}
                        <Link to={`/to-aqui/venue/${v.id}`} className="ml-auto">
                          <Button size="sm" variant="ghost" className="rounded-full text-primary">
                            <ExternalLink className="h-4 w-4 mr-1" /> Abrir
                          </Button>
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminToAqui;
