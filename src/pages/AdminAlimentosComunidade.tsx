import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shield, Check, X, RotateCcw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { FOOD_CATEGORIES } from "@/hooks/useFoodCatalog";

interface Suggestion {
  id: string;
  name_normalized: string;
  display_name: string;
  category: string;
  calories_per_100g: number;
  proteins_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  submissions_count: number;
  distinct_users_count: number;
  status: "pending" | "approved" | "rejected";
  promoted_food_id: string | null;
  last_seen_at: string;
}

const round = (n: number) => Math.round(n * 10) / 10;

const AdminAlimentosComunidade = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [fetching, setFetching] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("preparacoes");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      setCheckingRole(false);
    };
    if (!loading) {
      if (!user) navigate("/auth");
      else checkAdmin();
    }
  }, [user, loading, navigate]);

  const fetchItems = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("food_catalog_suggestions")
      .select("*")
      .eq("status", tab)
      .order("distinct_users_count", { ascending: false })
      .order("last_seen_at", { ascending: false })
      .limit(200);
    setFetching(false);
    if (error) {
      toast.error("Erro ao carregar sugestões");
      return;
    }
    setItems((data ?? []) as Suggestion[]);
  };

  useEffect(() => {
    if (isAdmin) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab]);

  const promote = async (s: Suggestion) => {
    const { data: food, error } = await supabase
      .from("food_catalog")
      .insert({
        name: s.display_name,
        category: s.category,
        calories_per_100g: round(s.calories_per_100g),
        proteins_per_100g: round(s.proteins_per_100g),
        carbs_per_100g: round(s.carbs_per_100g),
        fats_per_100g: round(s.fats_per_100g),
        common_portion_g: 100,
        common_portion_label: "100g",
        is_active: true,
        source: "community",
        community_suggestion_id: s.id,
      })
      .select("id")
      .single();
    if (error || !food) {
      toast.error(error?.message ?? "Erro ao aprovar");
      return;
    }
    await supabase
      .from("food_catalog_suggestions")
      .update({ status: "approved", promoted_food_id: food.id })
      .eq("id", s.id);
    toast.success("Aprovado e adicionado ao catálogo");
    fetchItems();
  };

  const reject = async (s: Suggestion) => {
    const { error } = await supabase
      .from("food_catalog_suggestions")
      .update({ status: "rejected" })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Rejeitado");
    fetchItems();
  };

  const reopen = async (s: Suggestion) => {
    if (s.promoted_food_id) {
      await supabase.from("food_catalog").delete().eq("id", s.promoted_food_id);
    }
    const { error } = await supabase
      .from("food_catalog_suggestions")
      .update({ status: "pending", promoted_food_id: null })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Reaberto");
    fetchItems();
  };

  const startEdit = (s: Suggestion) => {
    setEditing(s.id);
    setEditName(s.display_name);
    setEditCategory(s.category);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("food_catalog_suggestions")
      .update({ display_name: editName.trim(), category: editCategory })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setEditing(null);
    toast.success("Atualizado");
    fetchItems();
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="mx-auto h-12 w-12 text-destructive mb-2" />
            <CardTitle>Acesso negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta área.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline">Voltar</Button>
          </CardContent>
        </Card>
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
          <div>
            <h1 className="text-xl font-bold text-foreground">Alimentos da comunidade</h1>
            <p className="text-xs text-muted-foreground">Sugestões geradas a partir das refeições registradas</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(["pending", "approved", "rejected"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${
                tab === t ? "bg-[#FD46A1] text-white" : "bg-[#FFD1E7] text-foreground"
              }`}
            >
              {t === "pending" ? "Pendentes" : t === "approved" ? "Aprovados" : "Rejeitados"}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">Nenhum item.</p>
        ) : (
          <div className="space-y-3">
            {items.map(s => (
              <Card key={s.id} className="bg-[#FFD1E7] border-0 rounded-2xl">
                <CardContent className="p-3 space-y-2">
                  {editing === s.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="text-base bg-white"
                      />
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
                        className="w-full rounded-lg bg-white px-3 py-2 text-sm"
                      >
                        {FOOD_CATEGORIES.filter(c => c.value).map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full" onClick={() => saveEdit(s.id)}>Salvar</Button>
                        <Button size="sm" variant="outline" className="flex-1 rounded-full" onClick={() => setEditing(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-base text-foreground truncate">{s.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            normalizado: {s.name_normalized}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-white/70">{s.category}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-white/70 rounded-full px-2 py-0.5">
                          {s.distinct_users_count} usuários
                        </span>
                        <span className="bg-white/70 rounded-full px-2 py-0.5">
                          {s.submissions_count} registros
                        </span>
                        <span className="bg-white/70 rounded-full px-2 py-0.5">
                          {Math.round(s.calories_per_100g)} kcal/100g
                        </span>
                        <span className="bg-white/70 rounded-full px-2 py-0.5">
                          P {round(s.proteins_per_100g)}g
                        </span>
                        <span className="bg-white/70 rounded-full px-2 py-0.5">
                          C {round(s.carbs_per_100g)}g
                        </span>
                        <span className="bg-white/70 rounded-full px-2 py-0.5">
                          G {round(s.fats_per_100g)}g
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => startEdit(s)}>
                          <Pencil className="w-3 h-3 mr-1" /> Editar
                        </Button>
                        {tab === "pending" && (
                          <>
                            <Button size="sm" className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full" onClick={() => promote(s)}>
                              <Check className="w-3 h-3 mr-1" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => reject(s)}>
                              <X className="w-3 h-3 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                        {tab !== "pending" && (
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => reopen(s)}>
                            <RotateCcw className="w-3 h-3 mr-1" /> Reabrir
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlimentosComunidade;
