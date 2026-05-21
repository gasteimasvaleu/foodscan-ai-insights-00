import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinanceTx } from "@/hooks/useFinanceTransactions";
import { formatBRL } from "@/lib/financas/formatters";

interface Props {
  month: Date;
  transactions: FinanceTx[];
}

export function FinanceChart({ month, transactions }: Props) {
  const data = useMemo(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      receita: 0,
      despesa: 0,
      saldo: 0,
    }));
    transactions.forEach((t) => {
      const d = parseInt(t.occurred_on.slice(8, 10), 10);
      const idx = d - 1;
      if (idx < 0 || idx >= arr.length) return;
      if (t.kind === "receita") arr[idx].receita += t.amount_cents / 100;
      else arr[idx].despesa += t.amount_cents / 100;
    });
    let acc = 0;
    arr.forEach((row) => {
      acc += row.receita - row.despesa;
      row.saldo = Math.round(acc * 100) / 100;
    });
    return arr;
  }, [month, transactions]);

  return (
    <div className="rounded-3xl bg-white border border-[#FFD1E7] shadow-sm shadow-pink-100 p-4">
      <div className="mb-3">
        <h3 className="text-base text-foreground">Receita × Despesa</h3>
        <p className="text-xs text-muted-foreground">Mês atual, por dia</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={2} />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #FFD1E7",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [formatBRL(Math.round(value * 100)), name]}
              labelFormatter={(d) => `Dia ${d}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[6, 6, 0, 0]} barSize={10} />
            <Bar dataKey="despesa" name="Despesa" fill="#FD46A1" radius={[6, 6, 0, 0]} barSize={10} />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
