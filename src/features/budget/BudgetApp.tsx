"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  FileText,
} from "lucide-react";
import { useBudgetState } from "./useBudgetState";
import { computeMonthTotals, formatMoney, stableId } from "./budgetUtils";
import type { BudgetLine } from "./budgetTypes";
import BudgetVisualizer from "./BudgetVisualizer";
import { useLocale } from "@/context/LocaleContext";

const CATEGORY_PRESETS_ES = [
  "Vivienda",
  "Transporte",
  "Comida",
  "Salud",
  "Ocio",
  "Suscripciones",
  "Ahorro",
  "Otros",
];

function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays size={16} className="text-white/60" />
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none focus:ring-2 focus:ring-white/10"
      />
    </div>
  );
}

function LineRow({
  line,
  currency,
  onDelete,
}: {
  line: BudgetLine;
  currency: string;
  onDelete: () => void;
}) {
  const { t } = useLocale();
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white/90 truncate">
          {line.name}
        </div>
        <div className="text-xs text-white/45 truncate">{line.category}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm tabular-nums text-white/70">
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
          }).format(line.amount)}
        </div>
        <button
          onClick={onDelete}
          className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
        >
          {t("budget_delete")}
        </button>
      </div>
    </div>
  );
}

export default function BudgetApp() {
  const { t } = useLocale();
  const { state, current, setActiveMonth, upsertMonth, resetMonth, setCurrency } =
    useBudgetState();

  const totals = computeMonthTotals(current);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const presets = CATEGORY_PRESETS_ES;
  const [category, setCategory] = useState(presets[0]);

  const [kind, setKind] = useState<
    "income_fixed" | "income_extra" | "expense_fixed" | "expense_extra"
  >("expense_fixed");

  const [planned, setPlanned] = useState(String(totals.planned || ""));

  const sections = useMemo(() => {
    return [
      {
        id: "income_fixed",
        title: t("budget_income_fixed"),
        icon: <TrendingUp size={16} className="text-emerald-300" />,
      },
      {
        id: "income_extra",
        title: t("budget_income_extra"),
        icon: <TrendingUp size={16} className="text-emerald-200" />,
      },
      {
        id: "expense_fixed",
        title: t("budget_expense_fixed"),
        icon: <TrendingDown size={16} className="text-rose-300" />,
      },
      {
        id: "expense_extra",
        title: t("budget_expense_extra"),
        icon: <TrendingDown size={16} className="text-rose-200" />,
      },
    ] as const;
  }, [t]);

  // ✅ FIX: state.activeMonth YA es una key tipo "YYYY-MM"
  const activeKey = state.activeMonth;

  const currency = current.currency || "EUR";
  const monthSavings = totals.incomeTotal - totals.expenseTotal;

  const addLine = () => {
    const amt = Number(String(amount).replace(",", "."));
    if (!name.trim() || !isFinite(amt)) return;

    const now = new Date().toISOString();
    const line: BudgetLine = {
      id: stableId(),
      name: name.trim(),
      amount: amt,
      category: category.trim() || "Otros",
      kind,
      created_at: now,
    };

    const updated: BudgetLine[] = [...(current.lines || []), line];

    upsertMonth(activeKey, {
      ...current,
      lines: updated,
    });

    setName("");
    setAmount("");
  };

  const deleteLine = (id: string) => {
    const updated = (current.lines || []).filter((l) => l.id !== id);
    upsertMonth(activeKey, { ...current, lines: updated });
  };

  const applyPlanned = () => {
    const p = Number(String(planned).replace(",", "."));
    upsertMonth(activeKey, { ...current, planned: isFinite(p) ? p : 0 });
  };

  const exportJson = () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-budget-${activeKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (!data || typeof data !== "object") return;

        // Import simple: vuelca meses
        // @ts-ignore
        Object.keys(data.months || {}).forEach((k) => {
          // @ts-ignore
          upsertMonth(k, data.months[k]);
        });

        // @ts-ignore
        if (typeof data.activeMonth === "string") setActiveMonth(data.activeMonth);
      } catch {
        // ignore
      }
    };
    input.click();
  };

  return (
    <div className="h-full w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MonthPicker value={state.activeMonth} onChange={setActiveMonth} />
          <div className="text-sm text-white/60">{t("budget_summary")}</div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>

          <button
            onClick={() => {
              if (confirm(t("budget_reset_confirm"))) resetMonth(activeKey);
            }}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            <RefreshCcw size={16} />
            {t("budget_reset_month")}
          </button>

          <button
            onClick={exportJson}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            <FileText size={16} />
            {t("budget_export")}
          </button>

          <button
            onClick={importJson}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            <ArrowLeftRight size={16} />
            {t("budget_import")}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/50">
            {t("budget_income_fixed")} + {t("budget_income_extra")}
          </div>
          <div className="text-xl font-semibold text-white/90 tabular-nums">
            {formatMoney(totals.incomeTotal, currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/50">
            {t("budget_expense_fixed")} + {t("budget_expense_extra")}
          </div>
          <div className="text-xl font-semibold text-white/90 tabular-nums">
            {formatMoney(totals.expenseTotal, currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/50">{t("budget_month_savings")}</div>
          <div className="text-xl font-semibold text-white/90 tabular-nums">
            {formatMoney(monthSavings, currency)}
          </div>
        </div>
      </div>

      {/* Planned */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-white/85">
            {t("budget_planned_label")}
          </div>
          <div className="text-xs text-white/50">{t("budget_quick_editor_hint")}</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={planned}
            onChange={(e) => setPlanned(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none"
            placeholder="0"
          />
          <button
            onClick={applyPlanned}
            className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            {t("budget_save")}
          </button>
        </div>
      </div>

      {/* Add line */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-sm font-semibold text-white/85">
            {t("budget_add_line")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none md:col-span-2"
            placeholder={t("budget_name")}
          />

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none"
            placeholder={t("budget_amount")}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none"
          >
            {presets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 outline-none"
          >
            <option value="income_fixed">{t("budget_kind_income_fixed")}</option>
            <option value="income_extra">{t("budget_kind_income_extra")}</option>
            <option value="expense_fixed">{t("budget_kind_expense_fixed")}</option>
            <option value="expense_extra">{t("budget_kind_expense_extra")}</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={addLine}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            <Plus size={16} />
            {t("budget_add_line")}
          </button>
        </div>
      </div>

      {/* Lists + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0 flex-1">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 overflow-auto">
          {sections.map((s) => {
            const lines = (current.lines || []).filter((l) => l.kind === s.id);
            return (
              <div key={s.id} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {s.icon}
                  <div className="text-sm font-semibold text-white/85">{s.title}</div>
                  <div className="text-xs text-white/45 tabular-nums">
                    {formatMoney(
                      lines.reduce((acc, l) => acc + l.amount, 0),
                      currency
                    )}
                  </div>
                </div>

                {lines.length === 0 ? (
                  <div className="text-xs text-white/35">—</div>
                ) : (
                  lines.map((line) => (
                    <LineRow
                      key={line.id}
                      line={line}
                      currency={currency}
                      onDelete={() => deleteLine(line.id)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
          <BudgetVisualizer month={current} totals={totals} currency={currency} />
        </div>
      </div>
    </div>
  );
}
