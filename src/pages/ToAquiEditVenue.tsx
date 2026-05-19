import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useVenue, VENUE_CATEGORIES, type VenueCategory } from "@/hooks/useVenues";
import { VenuePhotoHeader } from "@/components/to-aqui/VenuePhotoHeader";
import { useQueryClient } from "@tanstack/react-query";

const ToAquiEditVenue = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: venue, isLoading } = useVenue(id);

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

  useEffect(() => {
    if (!venue) return;
    setForm({
      name: venue.name ?? "",
      category: (venue.category as VenueCategory) ?? "bar",
      city: venue.city ?? "",
      address: venue.address ?? "",
      description: venue.description ?? "",
      rules: venue.rules ?? "",
      photo_url: venue.photo_url ?? "",
    });
  }, [venue]);

  const isOwner = !!user && !!venue && venue.owner_id === user.id;

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !id) return;
    if (!form.name.trim() || !form.city.trim()) {
      toast({ title: "Preencha nome e cidade", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("venues")
      .update({
        name: form.name.trim(),
        category: form.category,
        city: form.city.trim(),
        address: form.address.trim() || null,
        description: form.description.trim() || null,
        rules: form.rules.trim() || null,
        photo_url: form.photo_url.trim() || null,
      })
      .eq("id", id);
    setSubmitting(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Alterações salvas!" });
    qc.invalidateQueries({ queryKey: ["venue", id] });
    qc.invalidateQueries({ queryKey: ["my-venues"] });
    navigate("/to-aqui/owner");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(env(safe-area-inset-top)+5rem)] text-center text-gray-500">
          <Loader2 className="animate-spin inline" />
        </div>
      </div>
    );
  }

  if (!venue || !isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(env(safe-area-inset-top)+5rem)] text-center">
          <p className="text-gray-600">Você não pode editar este venue.</p>
          <Button onClick={() => navigate("/to-aqui/owner")} className="mt-3">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto">
        <div className="animate-fade-in mb-4">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Editar venue</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/to-aqui/owner")}
              aria-label="Voltar"
              className="ml-auto text-primary hover:bg-white/40 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-white rounded-3xl p-5 shadow-sm border border-[#FD46A1]/30">
          <VenuePhotoHeader
            photoUrl={form.photo_url || null}
            categoryEmoji={VENUE_CATEGORIES.find((c) => c.value === form.category)?.emoji}
            name={form.name}
            uploading={uploading}
            onPickFile={onPickPhoto}
            onRemove={onRemovePhoto}
          />

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Nome *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Endereço</label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Descrição</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Regras do chat</label>
            <Textarea
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              rows={2}
              className="text-base"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-full"
          >
            {submitting ? "Salvando…" : "Salvar alterações"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ToAquiEditVenue;
