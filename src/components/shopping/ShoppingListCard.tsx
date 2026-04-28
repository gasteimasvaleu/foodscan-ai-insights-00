import { ChevronRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ShoppingList } from "@/hooks/useShoppingLists";

interface ShoppingListCardProps {
  list: ShoppingList;
  itemsTotal?: number;
  itemsPurchased?: number;
  onOpen: () => void;
  onDelete: () => void;
}

export const ShoppingListCard = ({
  list,
  itemsTotal,
  itemsPurchased,
  onOpen,
  onDelete,
}: ShoppingListCardProps) => {
  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 flex items-center gap-3 text-left min-w-0"
      >
        <div className="flex-1 min-w-0">
          <p className="text-base text-foreground truncate">{list.name}</p>
          {typeof itemsTotal === "number" && (
            <p className="text-xs text-foreground/60 mt-0.5">
              {itemsTotal === 0
                ? "Nenhum item"
                : `${itemsPurchased ?? 0} de ${itemsTotal} comprados`}
            </p>
          )}
        </div>
        <ChevronRight size={20} className="text-[#FD46A1] flex-shrink-0" />
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            aria-label="Excluir lista"
            className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-[#FD46A1] hover:bg-white transition-colors flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white/80 backdrop-blur-md border-2 border-[#FD46A1] rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
            <AlertDialogDescription>
              A lista “{list.name}” e todos os seus itens serão removidos. Essa ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
