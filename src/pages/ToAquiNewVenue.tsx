import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VENUE_CATEGORIES, type VenueCategory } from "@/hooks/useVenues";
import { VenuePhotoHeader } from "@/components/to-aqui/VenuePhotoHeader";

const ToAquiNewVenue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "bar" as VenueCategory,
    city: "",
    address: "",
    description: "",
    rules: "",
    photo_url: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Faça login para cadastrar", variant: "destructive" });
      return;
    }
    if (!form.name.trim() || !form.city.trim()) {
      toast({ title: "Preencha nome e cidade", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("venues").insert({
      owner_id: user.id,
      name: form.name.trim(),
      category: form.category,
      city: form.city.trim(),
      address: form.address.trim() || null,
      description: form.description.trim() || null,
      rules: form.rules.trim() || null,
      photo_url: form.photo_url.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Venue enviado!",
      description: "Vamos analisar e liberar em breve.",
    });
    navigate("/to-aqui/owner");
  };

  const onPickPhoto = async (file: File) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Limite de 5 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("venue-photos")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) {
      setUploading(false);
      toast({ title: "Erro no upload", description: upErr.message, variant: "destructive" });
      return;
    }
    // Remove anterior se houver
    if (photoPath) {
      await supabase.storage.from("venue-photos").remove([photoPath]);
    }
    const { data } = supabase.storage.from("venue-photos").getPublicUrl(path);
    setPhotoPath(path);
    setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    setUploading(false);
  };

  const onRemovePhoto = async () => {
    if (photoPath) {
      await supabase.storage.from("venue-photos").remove([photoPath]);
    }
    setPhotoPath(null);
    setForm((f) => ({ ...f, photo_url: "" }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto space-y-5">
        <div className="animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Novo venue</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              className="ml-auto text-primary hover:bg-white/40 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-3xl p-5 shadow-sm">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Nome *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Bar do Zé"
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Categoria *</label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.value })}
                  className={`px-3 py-2 rounded-2xl text-sm transition ${
                    form.category === c.value
                      ? "bg-[#FD46A1] text-white"
                      : "bg-[#FFD1E7]/50 text-gray-700"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Cidade *</label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ex.: São Paulo"
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Endereço</label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Rua, número, bairro"
              className="text-base"
            />
          </div>

          <VenuePhotoHeader
            photoUrl={form.photo_url || null}
            categoryEmoji={VENUE_CATEGORIES.find((c) => c.value === form.category)?.emoji}
            name={form.name}
            uploading={uploading}
            onPickFile={onPickPhoto}
            onRemove={onRemovePhoto}
          />

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Descrição</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="O que tem de especial nesse lugar?"
              rows={3}
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Regras do chat</label>
            <Textarea
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              placeholder="Ex.: respeito sempre, sem spam"
              rows={2}
              className="text-base"
            />
          </div>

          <p className="text-xs text-gray-500">
            Seu venue passará por uma análise rápida antes de ficar visível.
          </p>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-full"
          >
            {submitting ? "Enviando…" : "Enviar para análise"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ToAquiNewVenue;
