import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toDateKey } from "@/lib/financas/formatters";
import type { FinanceTx } from "@/hooks/useFinanceTransactions";

interface Props {
  month: Date;
  onMonthChange: (d: Date) => void;
  transactions: FinanceTx[];
  onSelectDay: (key: string) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function FinanceCalendar({ month, onMonthChange, transactions, onSelectDay }: Props) {
  const todayKey = toDateKey(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, { receita: boolean; despesa: boolean }>();
    transactions.forEach((t) => {
      const cur = map.get(t.occurred_on) ?? { receita: false, despesa: false };
      if (t.kind === "receita") cur.receita = true;
      else cur.despesa = true;
      map.set(t.occurred_on, cur);
    });
    return map;
  }, [transactions]);

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const arr: Array<{ key: string | null; day: number | null }> = [];
    for (let i = 0; i < startWeekday; i++) arr.push({ key: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      arr.push({ key: toDateKey(date), day: d });
    }
    while (arr.length % 7 !== 0) arr.push({ key: null, day: null });
    return arr;
  }, [month]);

  const prev = () => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const next = () => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="rounded-3xl bg-white border border-[#FFD1E7] shadow-sm shadow-pink-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={prev} className="h-9 w-9 rounded-full hover:bg-[#FFD1E7]/40">
          <ChevronLeft className="h-5 w-5 text-[#FD46A1]" />
        </Button>
        <div className="text-base font-semibold text-foreground capitalize">
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
        </div>
        <Button variant="ghost" size="icon" onClick={next} className="h-9 w-9 rounded-full hover:bg-[#FFD1E7]/40">
          <ChevronRight className="h-5 w-5 text-[#FD46A1]" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.key) return <div key={idx} className="aspect-square" />;
          const marks = byDay.get(cell.key);
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              onClick={() => onSelectDay(cell.key!)}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-sm transition-all active:scale-95",
                "hover:bg-[#FFD1E7]/40",
                isToday && "ring-2 ring-[#FD46A1] bg-[#FFD1E7]/50 font-semibold"
              )}
            >
              <span className="text-foreground">{cell.day}</span>
              <div className="flex gap-1 h-1.5">
                {marks?.receita && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {marks?.despesa && <span className="w-1.5 h-1.5 rounded-full bg-[#FD46A1]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Receita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FD46A1]" /> Despesa
        </span>
      </div>
    </div>
  );
}
