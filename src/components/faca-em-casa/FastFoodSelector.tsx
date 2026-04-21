import { Button } from "@/components/ui/button";
import type { FastFoodOption } from "@/types/recipe";
import { ChevronRight } from "lucide-react";

interface Props {
  options: FastFoodOption[];
  onSelect: (opt: FastFoodOption) => void;
  onCancel: () => void;
}

export const FastFoodSelector = ({ options, onSelect, onCancel }: Props) => {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="bg-[#FFD1E7]/40 border border-primary/20 rounded-3xl p-5 shadow-xl">
        <h3 className="font-bold text-foreground mb-1">Qual desses é o seu prato?</h3>
        <p className="text-sm text-muted-foreground">
          Encontramos algumas possibilidades. Toque na opção correta.
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt)}
            className="text-left bg-white/80 border border-primary/15 rounded-2xl p-4 shadow hover:bg-white transition-colors flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-foreground">{opt.nome}</span>
                {opt.rede && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-semibold">
                    {opt.rede}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold ml-auto">
                  {opt.confianca}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{opt.descricao}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
          </button>
        ))}
      </div>

      <Button variant="outline" className="w-full rounded-xl" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
};
