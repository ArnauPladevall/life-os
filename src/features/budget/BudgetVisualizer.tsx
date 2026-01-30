"use client";

import { useMemo } from "react";
import type { BudgetMonth } from "./budgetTypes";
import type { MonthTotals } from "./budgetUtils";
import { formatMoney } from "./budgetUtils";
import BudgetViz from "./BudgetViz";
import { useLocale } from "@/context/LocaleContext";

export default function BudgetVisualizer({
  month,
  totals,
  currency,
}: {
  month: BudgetMonth;
  totals: MonthTotals;
  currency: string;
}) {
  const { t } = useLocale();

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    (month.lines || [])
      .filter((l) => l.kind === "expense_fixed" || l.kind === "expense_extra")
      .forEach((l) => {
        const cat = (l.category || "Otros").trim() || "Otros";
        map.set(cat, (map.get(cat) || 0) + l.amount);
      });

    const rows = Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return rows;
  }, [month.lines]);

  return (
    <div className="h-full w-full flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-white/85">{t("budget_summary")}</div>
        <div className="text-xs text-white/45 tabular-nums">
          {formatMoney(totals.expenseTotal, currency)}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <BudgetViz rows={byCategory} currency={currency} />
      </div>

      <div className="text-xs text-white/45">
        {t("budget_month_savings")}:{" "}
        <span className="tabular-nums text-white/75">
          {formatMoney(totals.incomeTotal - totals.expenseTotal, currency)}
        </span>
      </div>
    </div>
  );
}
