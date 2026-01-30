"use client";

import { useMemo } from "react";
import { formatMoney } from "./budgetUtils";

export default function BudgetViz({
  rows,
  currency,
}: {
  rows: { category: string; amount: number }[];
  currency: string;
}) {
  const total = useMemo(() => rows.reduce((a, r) => a + r.amount, 0), [rows]);

  const normalized = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      pct: total > 0 ? r.amount / total : 0,
    }));
  }, [rows, total]);

  return (
    <div className="h-full w-full flex flex-col gap-3 overflow-auto pr-1">
      {normalized.length === 0 ? (
        <div className="text-xs text-white/35">—</div>
      ) : (
        normalized.map((r) => {
          const label = (r.category || "Otros").trim() || "Otros";
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="w-24 text-xs text-white/70 truncate">{label}</div>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white/50 rounded-full"
                  style={{ width: `${Math.round(r.pct * 100)}%` }}
                />
              </div>
              <div className="w-24 text-right text-xs tabular-nums text-white/70">
                {formatMoney(r.amount, currency)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
