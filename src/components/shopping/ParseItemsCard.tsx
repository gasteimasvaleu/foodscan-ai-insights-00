import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ParseItemsCardProps {
  onItemsParsed: (
    items: Array<{ name: string; quantity: number; unit: string; category: string }>,
  ) => Promise<number> | number;
}

export const ParseItemsCard = ({ onItemsParsed }: ParseItemsCardProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const value = text.trim();
    if (!value) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shopping-parse-items", {
        body: { text: value },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const items = data?.items ?? [];
      if (items.length === 0) {
        toast.info("Nenhum item identificado. Tente reformular.");
        return;
      }
      const count = await onItemsParsed(items);
      if (count > 0) {
        toast.success(`${count} ${count === 1 ? "item adicionado" : "itens adicionados"}`);
        setText("");
      }
    } catch (err: any) {
      console.error("[ParseItemsCard] error:", err);
      toast.error(err?.message || "Erro ao organizar lista");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-4">
      <p className="text-base text-foreground mb-1">Adicionar vários itens</p>
      <p className="text-xs text-foreground/60 mb-3">
        Digite tudo de uma vez. A IA organiza por categoria e unidade.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: 2kg arroz, leite, 6 bananas e detergente"
        rows={3}
        maxLength={1000}
        className="text-base bg-white resize-none mb-3"
      />
      <Button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-10 text-sm font-semibold gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Organizando...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Organizar lista
          </>
        )}
      </Button>
    </div>
  );
};
