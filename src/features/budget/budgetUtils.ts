import type { BudgetLine, BudgetState, MonthlyBudget } from "./budgetTypes";

export function monthKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function makeEmptyMonth(month: string): MonthlyBudget {
  return {
    month,
    income_fixed: [],
    income_extra: [],
    expense_fixed: [],
    expense_extra: [],
    planned_expenses: 0,
    notes: "",
    updated_at: Date.now(),
  };
}

export function getOrCreateMonth(state: BudgetState, month: string): MonthlyBudget {
  return state.months[month] ?? makeEmptyMonth(month);
}

export function sum(lines: BudgetLine[]): number {
  return lines.reduce((a, l) => a + (Number.isFinite(l.amount) ? l.amount : 0), 0);
}

export function computeMonthTotals(m: MonthlyBudget) {
  const incomeFixed = sum(m.income_fixed);
  const incomeExtra = sum(m.income_extra);
  const expenseFixed = sum(m.expense_fixed);
  const expenseExtra = sum(m.expense_extra);
  const incomeTotal = incomeFixed + incomeExtra;
  const expenseTotal = expenseFixed + expenseExtra;
  const savings = incomeTotal - expenseTotal;
  const planned = Number.isFinite(m.planned_expenses) ? (m.planned_expenses ?? 0) : 0;
  const remainingVsPlanned = planned > 0 ? planned - expenseTotal : undefined;
  return {
    incomeFixed,
    incomeExtra,
    expenseFixed,
    expenseExtra,
    incomeTotal,
    expenseTotal,
    savings,
    planned,
    remainingVsPlanned,
  };
}

export function formatMoney(amount: number, currency: BudgetState["currency"] = "EUR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount);
    return `${sign}${abs.toFixed(0)} ${currency}`;
  }
}

export function clampMonthKey(key: string) {
  // Basic guard: YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(key)) return monthKey();
  return key;
}

export function stableId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}