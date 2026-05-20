import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { cleanPhone, isValidWhatsApp } from "@/lib/mercado-facil/formatters";
import type { MFLoja } from "@/lib/mercado-facil/types";

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
  const [fotoUrl, setFotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

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
      endereco: { cidade: cidade.trim(), bairro: bairro.trim() },
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} className="text-base" />
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} className="text-base" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>URL da foto (opcional)</Label>
          <Input value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://..." className="text-base" />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12 text-base"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </main>
    </div>
  );
};

export default LojistaConfigLoja;
