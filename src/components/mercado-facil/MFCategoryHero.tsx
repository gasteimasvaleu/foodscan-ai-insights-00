import { getCategoryCopy } from "@/lib/mercado-facil/categoryCopy";

interface Props {
  slug?: string;
  name?: string;
  emoji?: string | null;
}

export const MFCategoryHero = ({ slug, name, emoji }: Props) => {
  const { title, subtitle } = getCategoryCopy(slug, name);
  return (
    <div className="rounded-3xl bg-[#FFD1E7] p-4 mb-3 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-base text-foreground leading-tight">{title}</p>
        <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{subtitle}</p>
      </div>
      <div className="w-14 h-14 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
        {emoji || "🛒"}
      </div>
    </div>
  );
};
