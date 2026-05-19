import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { GeneratedPost } from "@/hooks/useGeneratedPosts";
import { copyToClipboard, downloadImage } from "@/lib/socialShare";
import { toast } from "@/hooks/use-toast";
import { PostDetailModal } from "./PostDetailModal";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  posts: GeneratedPost[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const CARD_WRAPPER =
  "relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const dayKey = (d: Date | string) => format(new Date(d), "yyyy-MM-dd");

export const PostHistoryGrid = ({ posts, loading, onDelete }: Props) => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const postsByDay = useMemo(() => {
    const map = new Map<string, GeneratedPost[]>();
    for (const p of posts) {
      const k = dayKey(p.created_at);
      const arr = map.get(k) || [];
      arr.push(p);
      map.set(k, arr);
    }
    return map;
  }, [posts]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-6">Carregando…</p>;
  }

  if (!posts.length) {
    return (
      <div className={`${CARD_WRAPPER} pl-5 pr-4 py-6 text-center`}>
        <p className="text-sm text-muted-foreground">
          Você ainda não salvou nenhum post. Gere e clique em "Salvar".
        </p>
      </div>
    );
  }

  const handleCopy = async (p: GeneratedPost) => {
    const text = [p.caption, p.cta, (p.hashtags || []).join(" ")].filter(Boolean).join("\n\n");
    const ok = await copyToClipboard(text);
    toast({ title: ok ? "Legenda copiada" : "Falha ao copiar", variant: ok ? "default" : "destructive" });
  };

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: ptBR });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const dayPosts = postsByDay.get(dayKey(selectedDay)) || [];

  return (
    <div className="space-y-3">
      <div className={`${CARD_WRAPPER} pl-5 pr-4 py-4 space-y-3`}>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#FD46A1] hover:bg-[#FFD1E7]/40"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base text-foreground">{monthLabelCap}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#FD46A1] hover:bg-[#FFD1E7]/40"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((d) => {
            const inMonth = isSameMonth(d, currentMonth);
            const k = dayKey(d);
            const dayList = postsByDay.get(k);
            const has = !!dayList?.length;
            const isSel = isSameDay(d, selectedDay);
            const isToday = isSameDay(d, today);
            return (
              <button
                key={k}
                onClick={() => has && setSelectedDay(d)}
                disabled={!has}
                className={[
                  "relative aspect-square rounded-lg text-xs flex items-center justify-center transition-colors",
                  !inMonth ? "text-muted-foreground/40" : "text-foreground",
                  has
                    ? "bg-[#FFD1E7] text-[#FD46A1] font-medium cursor-pointer hover:bg-[#FFD1E7]/80"
                    : "bg-transparent cursor-default",
                  isSel && has ? "ring-2 ring-[#FD46A1]" : "",
                  isToday && !isSel ? "border border-[#FD46A1]/40" : "",
                ].join(" ")}
              >
                <span>{format(d, "d")}</span>
                {has && dayList!.length > 1 && (
                  <span className="absolute bottom-0.5 right-1 text-[9px] leading-none text-[#FD46A1]">
                    {dayList!.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground px-1">
          {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>

        {dayPosts.length === 0 ? (
          <div className={`${CARD_WRAPPER} pl-5 pr-4 py-6 text-center`}>
            <p className="text-sm text-muted-foreground">Nenhum post neste dia.</p>
          </div>
        ) : (
          dayPosts.map((p) => (
            <div key={p.id} className={`${CARD_WRAPPER} pl-5 pr-3 py-3 flex gap-3`}>
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FFD1E7]/30 border border-[#FD46A1]/15 flex-shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm text-foreground line-clamp-1">{p.theme}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(p.created_at), "HH:mm", { locale: ptBR })} • {p.post_type}
                </p>
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleCopy(p)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {p.image_url && (
                    <Button
                      size="sm" variant="ghost" className="h-8 px-2"
                      onClick={() => downloadImage(p.image_url!, `post-${p.id}.png`)}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm" variant="ghost" className="h-8 px-2 text-destructive ml-auto"
                    onClick={() => onDelete(p.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
