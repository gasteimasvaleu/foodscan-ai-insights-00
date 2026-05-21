import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FinanceCalendar } from "@/components/financas/FinanceCalendar";
import { FinanceChart } from "@/components/financas/FinanceChart";
import { FinanceTimeline } from "@/components/financas/FinanceTimeline";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceTransactions } from "@/hooks/useFinanceTransactions";
import { formatBRL, toDateKey } from "@/lib/financas/formatters";
import { cn } from "@/lib/utils";

export default function Financas() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const startDate = toDateKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const endDate = toDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const { data, loading } = useFinanceTransactions({ startDate, endDate });

  const totals = useMemo(() => {
    let r = 0,
      d = 0;
    data.forEach((t) => {
      if (t.kind === "receita") r += t.amount_cents;
      else d += t.amount_cents;
    });
    return { receita: r, despesa: d, saldo: r - d };
  }, [data]);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4">
        {/* Header */}
        <div className="mb-2">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-primary">Finanças</h1>
          </div>
        </div>

        {/* Resumo do mês */}
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard
            label="Receitas"
            value={formatBRL(totals.receita)}
            icon={<TrendingUp className="h-4 w-4" />}
            tone="green"
          />
          <SummaryCard
            label="Despesas"
            value={formatBRL(totals.despesa)}
            icon={<TrendingDown className="h-4 w-4" />}
            tone="pink"
          />
          <SummaryCard
            label="Saldo"
            value={formatBRL(totals.saldo)}
            tone={totals.saldo >= 0 ? "purple" : "red"}
          />
        </div>

        {/* Calendário */}
        <FinanceCalendar
          month={month}
          onMonthChange={setMonth}
          transactions={data}
          onSelectDay={(key) => navigate(`/financas/${key}`)}
        />

        {/* Gráfico */}
        <FinanceChart month={month} transactions={data} />

        {/* Timeline de lançamentos */}
        <div>
          <h2 className="text-base text-foreground mb-2 px-1">Lançamentos do mês</h2>
          <FinanceTimeline
            items={[...data].sort((a, b) =>
              a.occurred_on === b.occurred_on
                ? b.created_at.localeCompare(a.created_at)
                : b.occurred_on.localeCompare(a.occurred_on)
            )}
            onItemClick={(tx) => navigate(`/financas/${tx.occurred_on}`)}
            emptyLabel="Nenhum lançamento neste mês."
          />
        </div>

        {loading && <p className="text-center text-xs text-muted-foreground">Carregando…</p>}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone: "green" | "pink" | "purple" | "red";
}) {
  const toneClass = {
    green: "text-emerald-600",
    pink: "text-[#FD46A1]",
    purple: "text-violet-600",
    red: "text-red-600",
  }[tone];

  return (
    <div className="rounded-2xl bg-white border border-[#FFD1E7] shadow-sm p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("text-sm font-semibold leading-tight", toneClass)}>{value}</div>
    </div>
  );
}
