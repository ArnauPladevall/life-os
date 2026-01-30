export type BudgetLine = {
  id: string;
  name: string;
  amount: number; // positive number
  category: string;
};

export type MonthlyBudget = {
  month: string; // YYYY-MM
  income_fixed: BudgetLine[];
  income_extra: BudgetLine[];
  expense_fixed: BudgetLine[];
  expense_extra: BudgetLine[];
  planned_expenses?: number; // optional planned total
  notes?: string;
  updated_at: number;
};

export type BudgetState = {
  currency: "EUR" | "USD";
  months: Record<string, MonthlyBudget>;
  activeMonth: string; // YYYY-MM
};