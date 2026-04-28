import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShoppingCart } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col pb-28">
      <Navbar />

      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+4rem)] mb-4">
        <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-primary">Lista de Compras</h1>
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
