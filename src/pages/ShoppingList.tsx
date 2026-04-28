import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { ShoppingListCard } from "@/components/shopping/ShoppingListCard";
import { CreateListModal } from "@/components/shopping/CreateListModal";

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const { lists, loading, createList, deleteList } = useShoppingLists();
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = async (name: string) => {
    const created = await createList(name);
    if (created) navigate(`/lista-de-compras/${created.id}`);
  };

  return (
    <div
      className="min-h-screen bg-[#F7FAFB] pb-28 pt-[calc(env(safe-area-inset-top)+4rem)]"
    >
      <Navbar />
      {/* Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#FFD1E7] to-[#FFE5F1] rounded-3xl px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center text-[#FD46A1]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#FD46A1] truncate">
              Lista de Compras
            </h1>
            <p className="text-xs text-foreground/60">
              Organize suas compras por categoria
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 flex flex-col gap-3">
        <Button
          onClick={() => setCreateOpen(true)}
          className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-11 text-sm font-semibold gap-2"
        >
          <Plus size={18} />
          Nova lista
        </Button>

        {loading ? (
          <div className="text-center text-foreground/60 py-10 text-sm">
            Carregando...
          </div>
        ) : lists.length === 0 ? (
          <div className="bg-[#FFD1E7] rounded-3xl p-6 text-center mt-2">
            <p className="text-base text-foreground">Você ainda não tem listas</p>
            <p className="text-xs text-foreground/60 mt-1">
              Crie sua primeira lista para começar a organizar suas compras.
            </p>
          </div>
        ) : (
          lists.map((l) => (
            <ShoppingListCard
              key={l.id}
              list={l}
              onOpen={() => navigate(`/lista-de-compras/${l.id}`)}
              onDelete={() => deleteList(l.id)}
            />
          ))
        )}
      </div>

      <CreateListModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ShoppingListPage;
