"use client";

import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { WidgetSize } from "@/features/lobby/SmartWidget";
import { useBudgetState } from "./useBudgetState";
import { computeMonthTotals, formatMoney } from "./budgetUtils";
import BudgetViz from "./BudgetViz";
import { useLocale } from "@/context/LocaleContext";

export default function BudgetWidget({ size }: { size: WidgetSize }) {
  const { t } = useLocale();
  const { current, state, isLoaded } = useBudgetState();
  const totals = computeMonthTotals(current);
  const savingsPos = totals.savings >= 0;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-white/70 font-semibold">
          <Wallet size={14} className="text-white/55" />
          <span>{t('app_budget')}</span>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest tabular-nums">
          {current.month}
        </div>
      </div>

      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/50">{t('budget_savings')}</div>
            <div className={`text-sm font-bold tabular-nums ${savingsPos ? "text-emerald-300" : "text-rose-300"}`}>
              {formatMoney(totals.savings, state.currency)}
            </div>
          </div>
          {size !== "1x1" && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/50">{t('budget_income')}</div>
                <div className="text-xs text-white/80 tabular-nums">{formatMoney(totals.incomeTotal, state.currency)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/50">{t('budget_expenses')}</div>
                <div className="text-xs text-white/80 tabular-nums">{formatMoney(totals.expenseTotal, state.currency)}</div>
              </div>
            </>
          )}
        </div>

        {(size === "2x2" || size === "4x2") && (
          <div className="mt-3">
            <BudgetViz month={current} size={size === "2x2" ? "sm" : "md"} />
          </div>
        )}

        {size === "2x1" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
            {savingsPos ? <TrendingUp size={14} className="text-emerald-300" /> : <TrendingDown size={14} className="text-rose-300" />}
            <span className="truncate">
              {totals.planned > 0 ? `${t('budget_planned')}: ${formatMoney(totals.planned, state.currency)}` : t('budget_define_month')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
