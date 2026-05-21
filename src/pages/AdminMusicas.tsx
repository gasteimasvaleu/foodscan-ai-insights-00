import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Shield,
  Trash2,
  Plus,
  Pencil,
  Music,
  Upload,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MUSIC_CATEGORIES, getMusicCategory } from "@/data/musicCategories";
import { PlaylistMusica, getYouTubeThumb } from "@/components/musicas/PlaylistCard";

interface FormState {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: string;
  youtube_id: string;
  youtube_type: "playlist" | "video";
  thumbnail_url: string;
  ordem: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  titulo: "",
  descricao: "",
  categoria: "",
  youtube_id: "",
  youtube_type: "playlist",
  thumbnail_url: "",
  ordem: "0",
  is_active: true,
};

// Extrai ID de URLs do YouTube
const extractYouTubeId = (input: string, type: "playlist" | "video"): string => {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (type === "playlist") {
    const m = trimmed.match(/[?&]list=([^&]+)/);
    if (m) return m[1];
    return trimmed;
  }
  // video
  const m1 = trimmed.match(/[?&]v=([^&]+)/);
  if (m1) return m1[1];
  const m2 = trimmed.match(/youtu\.be\/([^?&]+)/);
  if (m2) return m2[1];
  const m3 = trimmed.match(/youtube\.com\/embed\/([^?&]+)/);
  if (m3) return m3[1];
  return trimmed;
};

const AdminMusicas = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [items, setItems] = useState<PlaylistMusica[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUploadCapa = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Envie uma imagem.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo de 2 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("musicas-capas")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("musicas-capas").getPublicUrl(path);
      setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }));
      toast({ title: "Capa enviada" });
    } catch (e: any) {
      toast({ title: "Erro no upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
      setCheckingRole(false);
    };
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else {
        checkAdmin();
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchItems();
  }, [isAdmin]);

  const fetchItems = async () => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("playlists_musicas")
      .select("*")
      .order("categoria", { ascending: true })
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as PlaylistMusica[]);
    setLoadingItems(false);
  };

  const openNew = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: PlaylistMusica) => {
    setForm({
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao ?? "",
      categoria: p.categoria,
      youtube_id: p.youtube_id,
      youtube_type: p.youtube_type,
      thumbnail_url: p.thumbnail_url ?? "",
      ordem: String(p.ordem ?? 0),
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.categoria || !form.youtube_id.trim()) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Título, categoria e ID/URL do YouTube são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    const yid = extractYouTubeId(form.youtube_id, form.youtube_type);
    if (!yid) {
      toast({ title: "ID do YouTube inválido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      categoria: form.categoria,
      youtube_id: yid,
      youtube_type: form.youtube_type,
      thumbnail_url: form.thumbnail_url.trim() || null,
      ordem: parseInt(form.ordem, 10) || 0,
      is_active: form.is_active,
    };

    const { error } = form.id
      ? await supabase.from("playlists_musicas").update(payload).eq("id", form.id)
      : await supabase.from("playlists_musicas").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Playlist atualizada" : "Playlist criada" });
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (p: PlaylistMusica) => {
    if (!confirm(`Apagar "${p.titulo}"?`)) return;
    const { error } = await supabase.from("playlists_musicas").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Playlist apagada" });
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background p-6">
        <Shield className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Acesso restrito a administradores.</p>
        <Button onClick={() => navigate("/")}>Voltar</Button>
      </div>
    );
  }

  const grouped = MUSIC_CATEGORIES.map((c) => ({
    category: c,
    items: items.filter((i) => i.categoria === c.key),
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 pt-[calc(env(safe-area-inset-top)+1rem)] space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Músicas</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as playlists do YouTube
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </div>

        {loadingItems ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma playlist cadastrada ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ category, items: list }) =>
              list.length === 0 ? null : (
                <div key={category.key} className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    {category.label} ({list.length})
                  </h2>
                  <div className="space-y-2">
                    {list.map((p) => {
                      const thumb = getYouTubeThumb(p);
                      return (
                        <Card key={p.id}>
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                              {thumb ? (
                                <img src={thumb} alt={p.titulo} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Music className="w-6 h-6 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2 leading-tight">
                                {p.titulo}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {p.youtube_type === "playlist" ? "Playlist" : "Vídeo"} · ordem {p.ordem}
                                {!p.is_active && " · inativa"}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(p)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editar playlist" : "Nova playlist"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Lo-fi para focar no trabalho"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Opcional"
                rows={2}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm({ ...form, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={form.youtube_type}
                onValueChange={(v: "playlist" | "video") =>
                  setForm({ ...form, youtube_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playlist">Playlist</SelectItem>
                  <SelectItem value="video">Vídeo único</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_id">
                {form.youtube_type === "playlist" ? "ID ou URL da playlist *" : "ID ou URL do vídeo *"}
              </Label>
              <Input
                id="youtube_id"
                value={form.youtube_id}
                onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                placeholder={
                  form.youtube_type === "playlist"
                    ? "Ex: PLrAl6rYAS4... ou cole a URL completa"
                    : "Ex: dQw4w9WgXcQ ou cole a URL"
                }
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                Aceita ID puro ou URL completa do YouTube — o ID é extraído automaticamente.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Capa custom</Label>
              {form.thumbnail_url ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
                  <img src={form.thumbnail_url} alt="Capa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, thumbnail_url: "" })}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shadow-md"
                    aria-label="Remover capa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-[#FD46A1] transition-colors bg-muted/40">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Enviando..." : "Enviar imagem"}
                  </span>
                  <span className="text-xs text-muted-foreground/70 mt-1">PNG/JPG até 2 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCapa(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Ou usar URL externa
                </summary>
                <Input
                  id="thumbnail_url"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="text-base mt-2"
                />
              </details>
              <p className="text-xs text-muted-foreground">
                Opcional — usa thumb do YouTube se vazio.
              </p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                inputMode="numeric"
                value={form.ordem}
                onChange={(e) => setForm({ ...form, ordem: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
              <Label htmlFor="is_active" className="cursor-pointer">Ativa</Label>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>

            <Button onClick={handleSave} disabled={saving || uploading} className="w-full">
              {saving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar playlist"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMusicas;
