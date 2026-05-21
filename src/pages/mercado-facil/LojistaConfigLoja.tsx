import { useEffect, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { cleanPhone, isValidWhatsApp } from "@/lib/mercado-facil/formatters";
import type { MFLoja } from "@/lib/mercado-facil/types";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const LojistaConfigLoja = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [loja, setLoja] = useState<MFLoja | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [uf, setUf] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [aceitaEntregador, setAceitaEntregador] = useState(false);
  const [quemAciona, setQuemAciona] = useState<"loja" | "cliente">("loja");
  const [taxaEntregaReais, setTaxaEntregaReais] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      return toast({ title: "Selecione uma imagem", variant: "destructive" });
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast({ title: "Imagem muito grande", description: "Máximo 5MB", variant: "destructive" });
    }
    setUploading(true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `lojas/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("mercado-facil-produtos")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      setUploading(false);
      return toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    }
    const { data } = supabase.storage.from("mercado-facil-produtos").getPublicUrl(path);
    setFotoUrl(data.publicUrl);
    setUploading(false);
    toast({ title: "Foto enviada" });
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mf_lojas")
      .select("*")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const l = data as MFLoja;
        setLoja(l);
        setNome(l.nome);
        setDescricao(l.descricao ?? "");
        setTelefone(l.telefone_whatsapp);
        setCidade(l.endereco?.cidade ?? "");
        setBairro(l.endereco?.bairro ?? "");
        setRua(((l.endereco as any)?.rua ?? "").toString());
        setNumero(((l.endereco as any)?.numero ?? "").toString());
        setUf(((l.endereco as any)?.uf ?? "").toString().toUpperCase());
        setFotoUrl(l.foto_url ?? "");
        setAceitaEntregador(!!l.aceita_entregador);
        setQuemAciona(l.quem_aciona_entregador === "cliente" ? "cliente" : "loja");
        setTaxaEntregaReais(
          l.taxa_entrega_padrao_centavos
            ? (l.taxa_entrega_padrao_centavos / 100).toFixed(2).replace(".", ",")
            : ""
        );
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!nome.trim()) return toast({ title: "Informe o nome da loja", variant: "destructive" });
    if (!isValidWhatsApp(telefone))
      return toast({ title: "WhatsApp inválido", description: "Use o formato +55 11 99999-9999", variant: "destructive" });

    setSaving(true);
    const taxaCentavos = aceitaEntregador
      ? Math.max(0, Math.round(parseFloat(taxaEntregaReais.replace(",", ".") || "0") * 100))
      : 0;
    const payload = {
      owner_id: user.id,
      nome: nome.trim(),
      slug: loja?.slug ?? `${slugify(nome)}-${user.id.slice(0, 6)}`,
      descricao: descricao.trim() || null,
      telefone_whatsapp: cleanPhone(telefone),
      endereco: {
        rua: rua.trim() || null,
        numero: numero.trim() || null,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: uf || null,
      },
      foto_url: fotoUrl.trim() || null,
      aceita_entregador: aceitaEntregador,
      quem_aciona_entregador: aceitaEntregador ? quemAciona : "loja",
      taxa_entrega_padrao_centavos: taxaCentavos,
      ativa: true,
    };

    const { error } = loja
      ? await supabase.from("mf_lojas").update(payload).eq("id", loja.id)
      : await supabase.from("mf_lojas").insert(payload);

    setSaving(false);
    if (error) return toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    toast({ title: "Loja salva" });
    navigate("/mercado-facil/lojista");
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={loja ? "Editar loja" : "Cadastrar loja"} backTo="/mercado-facil/lojista" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-[calc(env(safe-area-inset-bottom)+9rem)] px-4 max-w-xl mx-auto space-y-4">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 space-y-4 shadow-sm border-2 border-[#FD46A1]/60">
          <div className="space-y-2">
            <Label>Nome da loja *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="text-base" />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp (com DDI) *</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+55 11 99999-9999"
              inputMode="tel"
              className="text-base"
            />
            <p className="text-xs text-foreground/60">
              Os pedidos serão enviados direto para este número.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="text-base" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Cidade</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} className="text-base" />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Select value={uf} onValueChange={setUf}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  {UFS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Rua</Label>
              <Input value={rua} onChange={(e) => setRua(e.target.value)} className="text-base" />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="numeric" className="text-base" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} className="text-base" />
          </div>
          <div className="space-y-2">
            <Label>Foto da loja (opcional)</Label>
            <label
              className="relative block w-full h-40 rounded-2xl border-2 border-dashed border-[#FD46A1]/40 bg-white/40 hover:bg-white/60 transition cursor-pointer overflow-hidden"
              style={fotoUrl ? { backgroundImage: `url(${fotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              <input type="file" accept="image/*" hidden onChange={handleFotoChange} disabled={uploading} />
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
                  fotoUrl ? "bg-black/40 text-white/90" : "text-foreground/70"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className={`w-8 h-8 animate-spin ${fotoUrl ? "" : "text-[#FD46A1]/70"}`} />
                    <span className="text-sm">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Camera className={`w-10 h-10 ${fotoUrl ? "opacity-90" : "text-[#FD46A1]/60"}`} />
                    <span className={`text-sm ${fotoUrl ? "" : "opacity-70"}`}>
                      {fotoUrl ? "Trocar foto" : "Toque para enviar a foto da loja"}
                    </span>
                  </>
                )}
              </div>
            </label>
            {fotoUrl && !uploading && (
              <button
                type="button"
                onClick={() => setFotoUrl("")}
                className="text-xs text-foreground/60 underline"
              >
                Remover foto
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 space-y-4 shadow-sm border-2 border-[#FD46A1]/60">
          <h2 className="text-base">Entrega</h2>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <Label className="text-base">Aceitar entregador do app</Label>
              <p className="text-xs text-foreground/60 leading-snug mt-1">
                Permite acionar entregadores cadastrados na sua cidade. Se desligado, você fará a entrega por conta própria.
              </p>
            </div>
            <Switch checked={aceitaEntregador} onCheckedChange={setAceitaEntregador} />
          </div>
          {aceitaEntregador && (
            <div className="space-y-2">
              <Label>Taxa de entrega padrão (R$)</Label>
              <Input
                value={taxaEntregaReais}
                onChange={(e) => setTaxaEntregaReais(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="12,50"
                inputMode="decimal"
                className="text-base"
              />
              <p className="text-xs text-foreground/60">
                Valor sugerido ao acionar a entrega. Você pode ajustar caso a caso.
              </p>
            </div>
          )}
          {aceitaEntregador && (
            <div className="space-y-2">
              <Label className="text-base">Quem chama o entregador?</Label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#FFD1E7]/40">
                <button
                  type="button"
                  onClick={() => setQuemAciona("loja")}
                  className={`h-10 rounded-xl text-sm transition-colors ${
                    quemAciona === "loja" ? "bg-[#FD46A1] text-white" : "text-foreground/70"
                  }`}
                >
                  Eu (loja) chamo
                </button>
                <button
                  type="button"
                  onClick={() => setQuemAciona("cliente")}
                  className={`h-10 rounded-xl text-sm transition-colors ${
                    quemAciona === "cliente" ? "bg-[#FD46A1] text-white" : "text-foreground/70"
                  }`}
                >
                  Cliente chama
                </button>
              </div>
              <p className="text-xs text-foreground/60 leading-snug">
                {quemAciona === "loja"
                  ? "Você decide qual entregador acionar no painel de pedidos. O cliente não vê a lista no carrinho."
                  : "O cliente vê a lista de entregadores no carrinho e fala direto com eles. Você só prepara o pedido."}
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12 text-base"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </main>
    </div>
  );
};

export default LojistaConfigLoja;
