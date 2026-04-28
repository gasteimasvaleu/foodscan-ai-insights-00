import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Share2, Eraser, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useShoppingListDetail } from "@/hooks/useShoppingLists";
import {
  SHOPPING_CATEGORIES,
  getCategoryByKey,
} from "@/data/shoppingCategories";
import { ShoppingItemRow } from "@/components/shopping/ShoppingItemRow";
import { AddItemModal } from "@/components/shopping/AddItemModal";
import { CreateListModal } from "@/components/shopping/CreateListModal";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { buildShoppingListMessage } from "@/lib/shoppingShare";
import { openExternalUrl } from "@/lib/openExternal";
import { toast } from "sonner";

const ShoppingListDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    list,
    items,
    loading,
    addItem,
    togglePurchased,
    deleteItem,
    clearPurchased,
  } = useShoppingListDetail(id);
  const { renameList } = useShoppingLists();

  const [addOpen, setAddOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.category || "outros";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    // sort each group: not purchased first
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        if (a.is_purchased === b.is_purchased) {
          return a.name.localeCompare(b.name, "pt-BR");
        }
        return a.is_purchased ? 1 : -1;
      });
    }
    return SHOPPING_CATEGORIES.map((c) => ({
      category: c,
      items: map.get(c.key) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [items]);

  const total = items.length;
  const purchased = items.filter((i) => i.is_purchased).length;

  const handleShare = async () => {
    if (!list) return;
    if (items.length === 0) {
      toast.info("Adicione itens antes de compartilhar");
      return;
    }
    const msg = buildShoppingListMessage(list.name, items);
    await openExternalUrl(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  const handleRename = async (newName: string) => {
    if (!id) return;
    await renameList(id, newName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+4rem)] flex items-center justify-center">
        <Navbar />
        <p className="text-sm text-foreground/60">Carregando...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+4rem)] px-4">
        <Navbar />
        <div className="bg-[#FFD1E7] rounded-3xl p-6 text-center">
          <p className="text-base text-foreground">Lista não encontrada</p>
          <Button
            onClick={() => navigate("/lista-de-compras")}
            className="mt-4 rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFB] pb-28 pt-[calc(env(safe-area-inset-top)+4rem)]">
      <Navbar />
      {/* Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#FFD1E7] to-[#FFE5F1] rounded-3xl px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/lista-de-compras")}
            aria-label="Voltar"
            className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center text-[#FD46A1]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#FD46A1] truncate">
                {list.name}
              </h1>
              <button
                type="button"
                onClick={() => setRenameOpen(true)}
                aria-label="Renomear lista"
                className="text-[#FD46A1]/70 hover:text-[#FD46A1]"
              >
                <Pencil size={14} />
              </button>
            </div>
            <p className="text-xs text-foreground/60">
              {total === 0
                ? "Nenhum item"
                : `${purchased} de ${total} comprados`}
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="px-4 mb-4 flex gap-2">
        <Button
          onClick={() => setAddOpen(true)}
          className="flex-1 rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-10 text-sm font-semibold gap-2"
        >
          <Plus size={16} />
          Item
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="rounded-full border-[#FD46A1] text-[#FD46A1] h-10 text-sm font-semibold gap-2 bg-white"
        >
          <Share2 size={16} />
          WhatsApp
        </Button>
        {purchased > 0 && (
          <Button
            onClick={clearPurchased}
            variant="outline"
            className="rounded-full border-[#FD46A1]/40 text-[#FD46A1] h-10 w-10 p-0 bg-white"
            aria-label="Limpar comprados"
          >
            <Eraser size={16} />
          </Button>
        )}
      </div>

      {/* Itens agrupados */}
      <div className="px-4 flex flex-col gap-4">
        {grouped.length === 0 ? (
          <div className="bg-[#FFD1E7] rounded-3xl p-6 text-center">
            <p className="text-base text-foreground">Lista vazia</p>
            <p className="text-xs text-foreground/60 mt-1">
              Toque em “Item” para adicionar o primeiro produto.
            </p>
          </div>
        ) : (
          grouped.map(({ category, items: catItems }) => (
            <div key={category.key} className="bg-[#FFD1E7] rounded-3xl p-3">
              <div className="px-2 pb-2 flex items-center gap-2">
                <span className="text-base">{category.emoji}</span>
                <p className="text-sm font-semibold text-foreground/80">
                  {category.label}
                </p>
                <span className="text-xs text-foreground/50 ml-auto">
                  {catItems.filter((i) => i.is_purchased).length}/{catItems.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {catItems.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggle={(v) => togglePurchased(item.id, v)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <AddItemModal open={addOpen} onOpenChange={setAddOpen} onAdd={addItem} />
      <CreateListModal
        open={renameOpen}
        onOpenChange={setRenameOpen}
        onCreate={handleRename}
        initialName={list.name}
        title="Renomear lista"
        ctaLabel="Salvar"
      />
    </div>
  );
};

export default ShoppingListDetailPage;
