import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import type { MFCategoria, MFLoja, MFProduto } from "@/lib/mercado-facil/types";

const empty = {
  id: "",
  nome: "",
  descricao: "",
  preco_reais: "",
  unidade: "un",
  categoria_id: "",
  foto_url: "",
  ativo: true,
};

const LojistaProdutos = () => {
  const { user } = useAuthContext();
  const [loja, setLoja] = useState<MFLoja | null>(null);
  const [categorias, setCategorias] = useState<MFCategoria[]>([]);
  const [produtos, setProdutos] = useState<MFProduto[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async (lojaId: string) => {
    const { data } = await supabase
      .from("mf_produtos")
      .select("*")
      .eq("loja_id", lojaId)
      .order("created_at", { ascending: false });
    setProdutos((data ?? []) as MFProduto[]);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [l, c] = await Promise.all([
        supabase.from("mf_lojas").select("*").eq("owner_id", user.id).limit(1).maybeSingle(),
        supabase.from("mf_categorias").select("*").eq("ativo", true).order("order"),
      ]);
      const lj = (l.data as MFLoja) ?? null;
      setLoja(lj);
      setCategorias((c.data ?? []) as MFCategoria[]);
      if (lj) await reload(lj.id);
      setLoading(false);
    })();
  }, [user?.id]);

  const handleSave = async () => {
    if (!editing || !loja) return;
    const preco = Math.round(parseFloat(editing.preco_reais.replace(",", ".")) * 100);
    if (!editing.nome.trim() || isNaN(preco) || preco < 0)
      return toast({ title: "Preencha nome e preço válidos", variant: "destructive" });

    const payload = {
      loja_id: loja.id,
      nome: editing.nome.trim(),
      descricao: editing.descricao.trim() || null,
      preco_centavos: preco,
      unidade: editing.unidade,
      categoria_id: editing.categoria_id || null,
      foto_url: editing.foto_url.trim() || null,
      ativo: editing.ativo,
    };
    const { error } = editing.id
      ? await supabase.from("mf_produtos").update(payload).eq("id", editing.id)
      : await supabase.from("mf_produtos").insert(payload);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Produto salvo" });
    setEditing(null);
    await reload(loja.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este produto?")) return;
    const { error } = await supabase.from("mf_produtos").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    if (loja) await reload(loja.id);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <MFHeader title="Meus produtos" backTo="/mercado-facil/lojista" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-3">
        {loading ? (
          <p className="text-sm text-foreground/60">Carregando...</p>
        ) : !loja ? (
          <p className="text-sm text-foreground/60">Cadastre sua loja antes de adicionar produtos.</p>
        ) : (
          <>
            <Button
              onClick={() => setEditing({ ...empty })}
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12"
            >
              <Plus size={18} className="mr-1" /> Novo produto
            </Button>
            {produtos.length === 0 ? (
              <p className="text-sm text-foreground/60 text-center pt-6">Nenhum produto cadastrado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {produtos.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 bg-white rounded-3xl p-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FFD1E7] overflow-hidden shrink-0">
                      {p.foto_url && <img src={p.foto_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{p.nome}</p>
                      <p className="text-xs text-foreground/60">
                        {formatBRL(p.preco_centavos)} / {p.unidade} {!p.ativo && "· inativo"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setEditing({
                          id: p.id,
                          nome: p.nome,
                          descricao: p.descricao ?? "",
                          preco_reais: (p.preco_centavos / 100).toFixed(2).replace(".", ","),
                          unidade: p.unidade,
                          categoria_id: p.categoria_id ?? "",
                          foto_url: p.foto_url ?? "",
                          ativo: p.ativo,
                        })
                      }
                      className="w-9 h-9 rounded-full bg-[#FFD1E7] flex items-center justify-center"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-white/90 backdrop-blur-md rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className="text-base" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Preço (R$) *</Label>
                  <Input
                    value={editing.preco_reais}
                    onChange={(e) => setEditing({ ...editing, preco_reais: e.target.value })}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unidade</Label>
                  <Select value={editing.unidade} onValueChange={(v) => setEditing({ ...editing, unidade: v })}>
                    <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">un</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pct">pct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={editing.categoria_id || "__none__"}
                  onValueChange={(v) => setEditing({ ...editing, categoria_id: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— sem categoria —</SelectItem>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon_emoji} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Textarea
                  value={editing.descricao}
                  onChange={(e) => setEditing({ ...editing, descricao: e.target.value })}
                  rows={2}
                  className="text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL da foto</Label>
                <Input
                  value={editing.foto_url}
                  onChange={(e) => setEditing({ ...editing, foto_url: e.target.value })}
                  placeholder="https://..."
                  className="text-base"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.ativo}
                  onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })}
                />
                Produto ativo (visível na vitrine)
              </label>
              <Button onClick={handleSave} className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12">
                Salvar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LojistaProdutos;
