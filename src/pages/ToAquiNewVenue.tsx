import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VENUE_CATEGORIES, type VenueCategory } from "@/hooks/useVenues";

const ToAquiNewVenue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="min-h-screen bg-[#F7FAFB]">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#FD46A1]">Novo venue</h1>
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

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Foto (URL)</label>
            <Input
              value={form.photo_url}
              onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              placeholder="https://…"
              className="text-base"
            />
          </div>

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
