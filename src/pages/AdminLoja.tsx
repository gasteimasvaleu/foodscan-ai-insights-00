import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Upload,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { STORE_CATEGORIES, getCategory } from "@/data/storeCategories";

interface AffiliateProductRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  storage_path: string;
  affiliate_url: string;
  price: number | null;
  category: string;
  subcategory: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface FormState {
  id?: string;
  name: string;
  description: string;
  affiliate_url: string;
  price: string;
  category: string;
  subcategory: string;
  image_url: string;
  storage_path: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  affiliate_url: "",
  price: "",
  category: "",
  subcategory: "",
  image_url: "",
  storage_path: "",
};

const AdminLoja = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [products, setProducts] = useState<AffiliateProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("affiliate_products")
      .select("*")
      .order("category", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as AffiliateProductRow[]);
    setLoadingProducts(false);
  };

  const openNew = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: AffiliateProductRow) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      affiliate_url: p.affiliate_url,
      price: p.price != null ? String(p.price) : "",
      category: p.category,
      subcategory: p.subcategory ?? "",
      image_url: p.image_url,
      storage_path: p.storage_path,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("affiliate-products")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("affiliate-products").getPublicUrl(fileName);

      // Se está editando e tinha imagem antiga, remove ela
      if (form.storage_path) {
        await supabase.storage
          .from("affiliate-products")
          .remove([form.storage_path]);
      }

      setForm((f) => ({
        ...f,
        image_url: publicUrl,
        storage_path: fileName,
      }));
      toast({ title: "Imagem enviada" });
    } catch (err: any) {
      toast({
        title: "Erro ao enviar imagem",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.affiliate_url.trim() || !form.image_url || !form.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, imagem, link de afiliado e categoria.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url,
        storage_path: form.storage_path,
        affiliate_url: form.affiliate_url.trim(),
        price: form.price ? Number(form.price.replace(",", ".")) : null,
        category: form.category,
        subcategory: form.subcategory || null,
      };

      if (form.id) {
        const { error } = await supabase
          .from("affiliate_products")
          .update(payload)
          .eq("id", form.id);
        if (error) throw error;
        toast({ title: "Produto atualizado" });
      } else {
        const { error } = await supabase.from("affiliate_products").insert(payload);
        if (error) throw error;
        toast({ title: "Produto adicionado" });
      }

      setDialogOpen(false);
      setForm(emptyForm);
      fetchProducts();
    } catch (err: any) {
      toast({
        title: "Erro ao salvar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: AffiliateProductRow) => {
    if (!confirm(`Excluir "${p.name}"?`)) return;
    try {
      await supabase.storage.from("affiliate-products").remove([p.storage_path]);
      const { error } = await supabase
        .from("affiliate_products")
        .delete()
        .eq("id", p.id);
      if (error) throw error;
      toast({ title: "Produto excluído" });
      fetchProducts();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err.message,
        variant: "destructive",
      });
    }
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="mx-auto h-12 w-12 text-destructive mb-2" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCategory = form.category ? getCategory(form.category) : null;
  const grouped = STORE_CATEGORIES.map((cat) => ({
    category: cat,
    items: products.filter((p) => p.category === cat.key),
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Loja</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os produtos de afiliado
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum produto cadastrado ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ category, items }) =>
              items.length === 0 ? null : (
                <div key={category.key} className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    {category.label} ({items.length})
                  </h2>
                  <div className="space-y-2">
                    {items.map((p) => {
                      const subLabel = category.subcategories.find(
                        (s) => s.key === p.subcategory
                      )?.label;
                      return (
                        <Card key={p.id}>
                          <div className="flex items-center gap-3 p-3">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2 leading-tight">
                                {p.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {subLabel ?? category.label}
                                {p.price != null && ` · R$ ${Number(p.price).toFixed(2)}`}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(p)}
                                className="h-8 w-8"
                              >
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

      {/* Dialog de criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Editar produto" : "Novo produto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Imagem */}
            <div className="space-y-2">
              <Label>Imagem *</Label>
              {form.image_url ? (
                <div className="relative">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-lg">
                    <Upload className="w-4 h-4" />
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? "Enviando..." : "Clique para enviar uma imagem"}
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Whey Protein 900g"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Opcional"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Opcional, ex: 89.90"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate_url">Link de afiliado *</Label>
              <Input
                id="affiliate_url"
                value={form.affiliate_url}
                onChange={(e) =>
                  setForm({ ...form, affiliate_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v, subcategory: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div className="space-y-2">
                <Label>Subcategoria</Label>
                <Select
                  value={form.subcategory}
                  onValueChange={(v) => setForm({ ...form, subcategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full"
            >
              {saving ? "Salvando..." : form.id ? "Salvar alterações" : "Adicionar produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLoja;
