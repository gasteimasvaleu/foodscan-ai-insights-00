import { Check, Loader2 } from "lucide-react";
import type { AnalysisStep } from "@/hooks/useDishRecipe";

interface Props {
  step: AnalysisStep;
}

const STEPS: { key: AnalysisStep; label: string }[] = [
  { key: "uploading", label: "Enviando imagem" },
  { key: "identifying", label: "Identificando prato" },
  { key: "generating", label: "Gerando receita" },
];

const order: AnalysisStep[] = ["uploading", "identifying", "generating"];

export const AnalysisProgress = ({ step }: Props) => {
  const currentIdx = order.indexOf(step);

  return (
    <div className="bg-[#FFD1E7]/40 border border-primary/20 rounded-3xl p-6 shadow-xl space-y-3 animate-fade-in">
      <h3 className="font-bold text-foreground text-center mb-2">Analisando seu prato…</h3>
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div
            key={s.key}
            className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
              active ? "bg-white/70" : done ? "bg-white/40" : "bg-white/20"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                done
                  ? "bg-primary text-white"
                  : active
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? (
                <Check className="w-4 h-4" />
              ) : active ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                active ? "text-foreground" : done ? "text-foreground/70" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
