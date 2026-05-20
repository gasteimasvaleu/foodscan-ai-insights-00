import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { isValidWhatsApp } from "@/lib/mercado-facil/formatters";
import type { MFVeiculo } from "@/lib/mercado-facil/entregador-types";
import { useMFEntregador } from "@/hooks/mercado-facil/useMFEntregador";

const EntregadorCadastro = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { entregador, loading, reload } = useMFEntregador();
  const isEdit = !!entregador;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [documento, setDocumento] = useState("");
  const [veiculo, setVeiculo] = useState<MFVeiculo>("moto");
  const [raio, setRaio] = useState("5");
  const [fotoUrl, setFotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entregador) {
      setNome(entregador.nome_completo);
      setTelefone(entregador.telefone_whatsapp);
      setCidade(entregador.cidade);
      setEstado(entregador.estado);
      setDocumento(entregador.documento ?? "");
      setVeiculo(entregador.veiculo);
      setRaio(String(entregador.raio_atendimento_km));
      setFotoUrl(entregador.foto_url ?? "");
    }
  }, [entregador?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!nome.trim()) return toast({ title: "Informe seu nome completo", variant: "destructive" });
    if (!isValidWhatsApp(telefone)) return toast({ title: "WhatsApp inválido", variant: "destructive" });
    if (!cidade.trim() || !estado.trim()) return toast({ title: "Informe cidade e estado", variant: "destructive" });

    setSaving(true);
    const payload = {
      nome_completo: nome.trim(),
      telefone_whatsapp: telefone.trim(),
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
      documento: documento.trim() || null,
      veiculo,
      raio_atendimento_km: Math.max(1, Number(raio) || 5),
      foto_url: fotoUrl.trim() || null,
    };

    const { error } = isEdit
      ? await supabase.from("mf_entregadores").update(payload).eq("id", entregador!.id)
      : await supabase.from("mf_entregadores").insert({ ...payload, user_id: user.id });

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: isEdit ? "Dados atualizados" : "Cadastro enviado!",
      description: isEdit ? undefined : "Aguarde aprovação da equipe.",
    });
    await reload();
    navigate("/mercado-facil/entregador", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FD46A1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <MFHeader title={isEdit ? "Editar entregador" : "Cadastro de Entregador"} backTo="/mercado-facil/entregador" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-xl mx-auto space-y-4">
        {!isEdit && (
          <div className="bg-[#FFD1E7] rounded-3xl p-4">
            <p className="text-sm">
              Cadastre-se como entregador do Mercado Fácil. Após análise da equipe, você poderá receber entregas
              próximas a você.
            </p>
          </div>
        )}

        <div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 space-y-3">
          <div>
            <Label>Nome completo</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="text-base" />
          </div>
          <div>
            <Label>WhatsApp (com DDI)</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="text-base"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label>Cidade</Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} className="text-base" />
            </div>
            <div>
              <Label>UF</Label>
              <Input
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                maxLength={2}
                className="text-base uppercase"
              />
            </div>
          </div>
          <div>
            <Label>CPF (opcional)</Label>
            <Input value={documento} onChange={(e) => setDocumento(e.target.value)} className="text-base" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Veículo</Label>
              <Select value={veiculo} onValueChange={(v) => setVeiculo(v as MFVeiculo)}>
                <SelectTrigger className="text-base"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="bicicleta">Bicicleta</SelectItem>
                  <SelectItem value="a_pe">A pé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Raio (km)</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                value={raio}
                onChange={(e) => setRaio(e.target.value)}
                className="text-base"
              />
            </div>
          </div>
          <div>
            <Label>URL da foto (opcional)</Label>
            <Input
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="https://..."
              className="text-base"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12 text-base"
        >
          {saving ? <Loader2 className="animate-spin" /> : isEdit ? "Salvar alterações" : "Enviar cadastro"}
        </Button>
      </main>
    </div>
  );
};

export default EntregadorCadastro;
