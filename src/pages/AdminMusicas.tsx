import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
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
  ListMusic,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MUSIC_CATEGORIES } from "@/data/musicCategories";
import { PlaylistMusica, MusicaFaixa } from "@/components/musicas/PlaylistCard";

interface FormState {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: string;
  thumbnail_url: string;
  ordem: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  titulo: "",
  descricao: "",
  categoria: "",
  thumbnail_url: "",
  ordem: "0",
  is_active: true,
};

const formatTime = (s: number | null) => {
  if (s == null || !isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const sanitizeName = (name: string) =>
  name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();

const AdminMusicas = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [items, setItems] = useState<PlaylistMusica[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingCapa, setUploadingCapa] = useState(false);

  // Faixas dialog
  const [tracksDialog, setTracksDialog] = useState<PlaylistMusica | null>(null);
  const [tracks, setTracks] = useState<MusicaFaixa[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [uploadingTracks, setUploadingTracks] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  const handleUploadCapa = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Envie uma imagem.", variant: "destructive" });
      return;
    }
    setUploadingCapa(true);
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
      setUploadingCapa(false);
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
      if (!user) navigate("/auth");
      else checkAdmin();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchItems();
  }, [isAdmin]);

  const fetchItems = async () => {
    setLoadingItems(true);
    const { data } = await supabase
      .from("playlists_musicas")
      .select("*")
      .order("categoria", { ascending: true })
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: false });
    const list = (data as PlaylistMusica[]) || [];
    setItems(list);

    // Contagem de faixas por playlist
    if (list.length > 0) {
      const { data: faixas } = await supabase
        .from("musicas_faixas")
        .select("playlist_id");
      const map: Record<string, number> = {};
      (faixas || []).forEach((f: any) => {
        map[f.playlist_id] = (map[f.playlist_id] || 0) + 1;
      });
      setCounts(map);
    }
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
      thumbnail_url: p.thumbnail_url ?? "",
      ordem: String(p.ordem ?? 0),
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.categoria) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Título e categoria são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const payload: any = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      categoria: form.categoria,
      thumbnail_url: form.thumbnail_url.trim() || null,
      ordem: parseInt(form.ordem, 10) || 0,
      is_active: form.is_active,
    };
    // youtube_id é NOT NULL no schema legado — preencher com placeholder
    if (!form.id) {
      payload.youtube_id = "";
      payload.youtube_type = "playlist";
    }

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
    if (!confirm(`Apagar "${p.titulo}" e todas suas faixas?`)) return;
    const { error } = await supabase.from("playlists_musicas").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Playlist apagada" });
    fetchItems();
  };

  // ----- TRACKS -----
  const openTracks = async (p: PlaylistMusica) => {
    setTracksDialog(p);
    setLoadingTracks(true);
    const { data } = await supabase
      .from("musicas_faixas")
      .select("*")
      .eq("playlist_id", p.id)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });
    setTracks((data as MusicaFaixa[]) || []);
    setLoadingTracks(false);
  };

  const probeDuration = (file: File): Promise<number | null> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const d = isFinite(audio.duration) ? Math.round(audio.duration) : null;
        URL.revokeObjectURL(url);
        resolve(d);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      audio.src = url;
    });

  const handleUploadTracks = async (files: FileList | null) => {
    if (!files || !tracksDialog) return;
    const fileArr = Array.from(files).filter((f) =>
      f.type.startsWith("audio/") || /\.(mp3|m4a|aac|wav|ogg)$/i.test(f.name)
    );
    if (fileArr.length === 0) {
      toast({ title: "Nenhum áudio válido", variant: "destructive" });
      return;
    }
    setUploadingTracks(true);
    setUploadProgress({ done: 0, total: fileArr.length });

    const baseOrdem = tracks.length > 0 ? Math.max(...tracks.map((t) => t.ordem)) + 1 : 0;

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      try {
        const duracao = await probeDuration(file);
        const ext = file.name.split(".").pop() || "mp3";
        const path = `${tracksDialog.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("musicas-audio")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "audio/mpeg",
          });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("musicas-audio").getPublicUrl(path);

        const { error: insErr } = await supabase.from("musicas_faixas").insert({
          playlist_id: tracksDialog.id,
          titulo: sanitizeName(file.name),
          audio_url: pub.publicUrl,
          duracao_segundos: duracao,
          ordem: baseOrdem + i,
        });
        if (insErr) throw insErr;
      } catch (e: any) {
        toast({
          title: `Erro em ${file.name}`,
          description: e.message,
          variant: "destructive",
        });
      } finally {
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }

    setUploadingTracks(false);
    await openTracks(tracksDialog);
    fetchItems();
    toast({ title: `${fileArr.length} faixa(s) enviada(s)` });
  };

  const renameTrack = async (id: string, titulo: string) => {
    const { error } = await supabase
      .from("musicas_faixas")
      .update({ titulo })
      .eq("id", id);
    if (error) {
      toast({ title: "Erro ao renomear", description: error.message, variant: "destructive" });
      return;
    }
    setTracks((arr) => arr.map((t) => (t.id === id ? { ...t, titulo } : t)));
  };

  const deleteTrack = async (t: MusicaFaixa) => {
    if (!confirm(`Apagar faixa "${t.titulo}"?`)) return;
    // remove do storage também
    try {
      const url = new URL(t.audio_url);
      const idx = url.pathname.indexOf("/musicas-audio/");
      if (idx >= 0) {
        const path = url.pathname.slice(idx + "/musicas-audio/".length);
        await supabase.storage.from("musicas-audio").remove([decodeURIComponent(path)]);
      }
    } catch {}
    const { error } = await supabase.from("musicas_faixas").delete().eq("id", t.id);
    if (error) {
      toast({ title: "Erro ao apagar", description: error.message, variant: "destructive" });
      return;
    }
    setTracks((arr) => arr.filter((x) => x.id !== t.id));
    fetchItems();
  };

  const moveTrack = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= tracks.length) return;
    const a = tracks[index];
    const b = tracks[newIndex];
    const swapped = [...tracks];
    swapped[index] = { ...b, ordem: a.ordem };
    swapped[newIndex] = { ...a, ordem: b.ordem };
    setTracks(swapped);
    await Promise.all([
      supabase.from("musicas_faixas").update({ ordem: b.ordem }).eq("id", a.id),
      supabase.from("musicas_faixas").update({ ordem: a.ordem }).eq("id", b.id),
    ]);
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
              Gerencie playlists e faixas MP3
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
                      const thumb = p.thumbnail_url;
                      const total = counts[p.id] || 0;
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
                                {total} faixa{total === 1 ? "" : "s"} · ordem {p.ordem}
                                {!p.is_active && " · inativa"}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openTracks(p)}
                                className="h-8 w-8"
                                title="Gerenciar faixas"
                              >
                                <ListMusic className="h-4 w-4" />
                              </Button>
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

      {/* Dialog playlist */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar playlist" : "Nova playlist"}</DialogTitle>
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
              <Label>Capa</Label>
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
                    {uploadingCapa ? "Enviando..." : "Enviar imagem"}
                  </span>
                  <span className="text-xs text-muted-foreground/70 mt-1">PNG/JPG</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingCapa}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCapa(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
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

            <Button onClick={handleSave} disabled={saving || uploadingCapa} className="w-full">
              {saving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar playlist"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog faixas */}
      <Dialog open={!!tracksDialog} onOpenChange={(o) => !o && setTracksDialog(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="pr-8">
              Faixas — {tracksDialog?.titulo}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full py-6 rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-[#FD46A1] transition-colors bg-muted/40">
              {uploadingTracks ? (
                <>
                  <Loader2 className="w-6 h-6 text-primary mb-2 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Enviando {uploadProgress.done}/{uploadProgress.total}...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Adicionar faixas MP3
                  </span>
                  <span className="text-xs text-muted-foreground/70 mt-1">
                    Selecione um ou vários arquivos
                  </span>
                </>
              )}
              <input
                type="file"
                accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg"
                multiple
                className="hidden"
                disabled={uploadingTracks}
                onChange={(e) => {
                  handleUploadTracks(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {loadingTracks ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : tracks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhuma faixa ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {tracks.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2">
                    <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                      {i + 1}
                    </span>
                    <Input
                      defaultValue={t.titulo}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== t.titulo) renameTrack(t.id, v);
                      }}
                      className="text-sm flex-1 h-8"
                    />
                    <span className="text-[11px] font-mono text-muted-foreground w-10 text-right">
                      {formatTime(t.duracao_segundos)}
                    </span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveTrack(i, -1)}
                        disabled={i === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveTrack(i, 1)}
                        disabled={i === tracks.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteTrack(t)}
                      className="text-destructive hover:opacity-80 p-1"
                      aria-label="Apagar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMusicas;
