import { Check } from "lucide-react";

type Status = "aceita" | "coletada" | "entregue";

const STEPS: { key: Status; label: string }[] = [
  { key: "aceita", label: "Aceita" },
  { key: "coletada", label: "Coletada" },
  { key: "entregue", label: "Entregue" },
];

export function MFEntregaProgress({ status }: { status: Status }) {
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  // Largura da faixa preenchida: 0%, 50%, 100% (entre as bolinhas)
  const fillPct = currentIdx === 0 ? 0 : currentIdx === 1 ? 50 : 100;

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={currentIdx + 1}
      aria-label="Progresso da entrega"
      className="py-2"
    >
      <div className="relative">
        {/* Trilha */}
        <div className="absolute top-3 left-3 right-3 h-1 rounded-full bg-[#FFD1E7]" />
        {/* Preenchimento */}
        <div
          className="absolute top-3 left-3 h-1 rounded-full bg-[#FD46A1] transition-all duration-500 ease-out"
          style={{ width: `calc((100% - 1.5rem) * ${fillPct / 100})` }}
        >
          {currentIdx < STEPS.length - 1 && (
            <div className="absolute inset-0 rounded-full bg-[#FD46A1] animate-pulse opacity-60" />
          )}
        </div>

        {/* Bolinhas */}
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const current = i === currentIdx;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1 w-16">
                <div
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] border-2 transition-colors",
                    done || current
                      ? "bg-[#FD46A1] border-[#FD46A1] text-white"
                      : "bg-white border-[#FD46A1]/30 text-foreground/40",
                    current ? "animate-pulse" : "",
                  ].join(" ")}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={[
                    "text-[11px] leading-none",
                    done || current ? "text-[#FD46A1]" : "text-foreground/40",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
