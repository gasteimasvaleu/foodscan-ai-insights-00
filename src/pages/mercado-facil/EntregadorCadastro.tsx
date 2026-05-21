import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import { MFHeader } from "@/components/mercado-facil/MFHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { isValidWhatsApp, normalizeCidade } from "@/lib/mercado-facil/formatters";
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
  const [taxaMin, setTaxaMin] = useState("");
  const [taxaMax, setTaxaMax] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast({ title: "Imagem muito grande", description: "Máx 5MB", variant: "destructive" });
    }
    setUploadingFoto(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/foto-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("mercado-facil-entregadores")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploadingFoto(false);
      return toast({ title: "Erro no upload", description: upErr.message, variant: "destructive" });
    }
    const { data } = supabase.storage.from("mercado-facil-entregadores").getPublicUrl(path);
    setFotoUrl(data.publicUrl);
    setUploadingFoto(false);
    toast({ title: "Foto enviada!" });
  };

  useEffect(() => {
    if (entregador) {
      setNome(entregador.nome_completo);
      setTelefone(entregador.telefone_whatsapp);
      setCidade(entregador.cidade);
      setEstado(entregador.estado);
      setDocumento(entregador.documento ?? "");
      setVeiculo(entregador.veiculo);
      setRaio(String(entregador.raio_atendimento_km));
      setTaxaMin(entregador.taxa_min_centavos ? (entregador.taxa_min_centavos / 100).toFixed(2) : "");
      setTaxaMax(entregador.taxa_max_centavos ? (entregador.taxa_max_centavos / 100).toFixed(2) : "");
      setFotoUrl(entregador.foto_url ?? "");
    }
  }, [entregador?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!nome.trim()) return toast({ title: "Informe seu nome completo", variant: "destructive" });
    if (!isValidWhatsApp(telefone)) return toast({ title: "WhatsApp inválido", variant: "destructive" });
    if (!cidade.trim() || !estado.trim()) return toast({ title: "Informe cidade e estado", variant: "destructive" });

    const parseReais = (s: string) => Math.max(0, Math.round((Number((s || "").replace(",", ".")) || 0) * 100));
    const tMin = parseReais(taxaMin);
    let tMax = parseReais(taxaMax);
    if (tMax > 0 && tMin > 0 && tMax < tMin) tMax = tMin;

    setSaving(true);
    const payload = {
      nome_completo: nome.trim(),
      telefone_whatsapp: telefone.trim(),
      cidade: normalizeCidade(cidade),
      estado: estado.trim().toUpperCase(),
      documento: documento.trim() || null,
      veiculo,
      raio_atendimento_km: Math.max(1, Number(raio) || 5),
      taxa_min_centavos: tMin,
      taxa_max_centavos: tMax,
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
      <MFHeader title={isEdit ? "Editar entregador" : "Cadastro de Entregador"} backTo="/mercado-facil" showCart={false} />
      <main className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-[calc(env(safe-area-inset-bottom)+9rem)] px-4 max-w-xl mx-auto space-y-4">
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
              <Select value={estado} onValueChange={(v) => setEstado(v)}>
                <SelectTrigger className="text-base uppercase"><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Label>Faixa de preço por entrega</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Input
                type="text"
                inputMode="decimal"
                value={taxaMin}
                onChange={(e) => setTaxaMin(e.target.value)}
                placeholder="Mín (R$)"
                className="text-base"
              />
              <Input
                type="text"
                inputMode="decimal"
                value={taxaMax}
                onChange={(e) => setTaxaMax(e.target.value)}
                placeholder="Máx (R$)"
                className="text-base"
              />
            </div>
            <p className="text-[11px] text-foreground/60 mt-1">
              Valor de referência mostrado ao cliente. O combinado final é fechado no WhatsApp.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Foto (opcional)</Label>
            <label
              className="relative block w-full h-40 rounded-2xl border-2 border-dashed border-[#FD46A1]/40 bg-white/40 hover:bg-white/60 transition cursor-pointer overflow-hidden"
              style={fotoUrl ? { backgroundImage: `url(${fotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoUpload}
                disabled={uploadingFoto}
              />
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
                  fotoUrl ? "bg-black/40 text-white/90" : "text-foreground/70"
                }`}
              >
                {uploadingFoto ? (
                  <>
                    <Loader2 className={`w-8 h-8 animate-spin ${fotoUrl ? "" : "text-[#FD46A1]/70"}`} />
                    <span className="text-sm">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Camera className={`w-10 h-10 ${fotoUrl ? "opacity-90" : "text-[#FD46A1]/60"}`} />
                    <span className={`text-sm ${fotoUrl ? "" : "opacity-70"}`}>
                      {fotoUrl ? "Trocar foto" : "Toque para enviar sua foto"}
                    </span>
                  </>
                )}
              </div>
            </label>
            {fotoUrl && !uploadingFoto && (
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
