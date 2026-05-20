import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!nome.trim()) return toast({ title: "Informe o nome da loja", variant: "destructive" });
    if (!isValidWhatsApp(telefone))
      return toast({ title: "WhatsApp inválido", description: "Use o formato +55 11 99999-9999", variant: "destructive" });

    setSaving(true);
    const payload = {
      owner_id: user.id,
      nome: nome.trim(),
      slug: loja?.slug ?? `${slugify(nome)}-${user.id.slice(0, 6)}`,
      descricao: descricao.trim() || null,
      telefone_whatsapp: cleanPhone(telefone),
      endereco: { cidade: cidade.trim(), bairro: bairro.trim(), uf: uf || null },
      foto_url: fotoUrl.trim() || null,
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
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 space-y-4 shadow-sm border border-white/40">
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
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} className="text-base" />
          </div>
          <div className="space-y-2">
            <Label>Foto da loja (opcional)</Label>
            <div className="flex items-center gap-3">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto da loja" className="w-20 h-20 rounded-2xl object-cover border border-white/40" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/40 border border-white/40 flex items-center justify-center text-xs text-foreground/50">
                  Sem foto
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" hidden onChange={handleFotoChange} disabled={uploading} />
                  <span className="inline-flex items-center justify-center px-4 h-10 rounded-2xl bg-[#FD46A1] text-white text-sm">
                    {uploading ? "Enviando..." : fotoUrl ? "Trocar foto" : "Enviar foto"}
                  </span>
                </label>
                {fotoUrl && !uploading && (
                  <button
                    type="button"
                    onClick={() => setFotoUrl("")}
                    className="text-xs text-foreground/60 underline self-start"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>
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
