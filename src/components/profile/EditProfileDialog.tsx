import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface ProfileFields {
  name: string;
  bio: string | null;
  email_public: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  initial: ProfileFields;
  onSaved: (updated: ProfileFields) => void;
}

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(50),
  bio: z.string().trim().max(160, "Máx. 160 caracteres").optional().nullable(),
  email_public: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(40).optional().or(z.literal("")),
});

export function EditProfileDialog({ open, onOpenChange, userId, initial, onSaved }: Props) {
  const [form, setForm] = useState<ProfileFields>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial); }, [initial, open]);

  const update = (k: keyof ProfileFields, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio?.trim() || null,
        email_public: form.email_public?.trim() || null,
        phone: form.phone?.trim() || null,
        address: form.address?.trim() || null,
        city: form.city?.trim() || null,
        state: form.state?.trim() || null,
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
      if (error) throw error;
      onSaved(payload);
      toast({ title: "Perfil atualizado!" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white/70 backdrop-blur-md border-2 border-[#FD46A1] shadow-xl">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="identidade" className="mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="identidade">Identidade</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
          </TabsList>

          <TabsContent value="identidade" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" className="text-base" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" maxLength={160} placeholder="Conte algo sobre você..."
                className="text-base resize-none"
                value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} />
              <p className="text-xs text-muted-foreground text-right">{(form.bio || "").length}/160</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_public">Email público</Label>
              <Input id="email_public" type="email" className="text-base"
                placeholder="seu@email.com"
                value={form.email_public || ""} onChange={(e) => update("email_public", e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="contato" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" className="text-base" placeholder="(00) 00000-0000"
                value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" className="text-base" placeholder="Rua, número, bairro"
                value={form.address || ""} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" className="text-base"
                  value={form.city || ""} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" className="text-base" placeholder="UF"
                  value={form.state || ""} onChange={(e) => update("state", e.target.value)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} disabled={saving} className="w-full mt-4 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
