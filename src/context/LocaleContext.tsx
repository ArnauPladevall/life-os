"use client";

import React, { createContext, useContext, useMemo } from "react";

export type Locale = "es";

type Dict = Record<string, string>;

const ES: Dict = {
    login_title: "Inicia sesión",
    login_subtitle: "Accede para continuar",
    settings_title: "Configuración",
    settings_identity: "Identidad",
    settings_visual: "Visual",
    settings_language: "Idioma",
    settings_showHeader: "Mostrar cabecera",
    settings_showDock: "Mostrar dock",
    settings_resetLayout: "Restablecer layout",
    settings_resetLayout_hint: "Vuelve al diseño por defecto",
    settings_resetData: "Reiniciar datos",
    settings_resetData_hint: "Borra notas, tareas y preferencias",
    settings_profile: "Perfil",
    settings_security: "Seguridad",
    settings_logout: "Cerrar sesión",

    dock_notes: "Notas",
    dock_tasks: "Tareas",
    dock_focus: "Focus",
    dock_quote: "Quote",
    dock_budget: "Budget",
    dock_settings: "Ajustes",

    notes_title: "Notas",
    notes_empty: "No hay notas todavía",
    notes_new: "Nueva nota",
    notes_search: "Buscar…",

    focus_title: "Focus",
    focus_timer: "Temporizador",
    focus_start: "Empezar",
    focus_pause: "Pausar",
    focus_reset: "Reiniciar",
    pomodoro_title: "Pomodoro",
    pomodoro_work: "Trabajo",
    pomodoro_break: "Descanso",
    pomodoro_long_break: "Descanso largo",
    pomodoro_status_idle: "Pausado",

    tasks_quick_add_placeholder: "Añadir…",
    tasks_all_done: "Todo listo",

    lobby_empty: "Espacio vacío",

    quote_change_topic_hint: "Cambia el tema al abrir",
    quote_more: "Otras de este tema",

    budget_reset_month: "Reiniciar mes",
    budget_summary: "Resumen",
    budget_month_savings: "Ahorro del mes",
    budget_quick_editor: "Editor rápido",
    budget_quick_editor_hint:
        "Guarda y reajusta categorías, importes y tipo de línea",
    budget_income_fixed: "Ingresos fijos",
    budget_income_extra: "Ingresos extra",
    budget_expense_fixed: "Gastos fijos",
    budget_expense_extra: "Gastos variables",
    budget_add_line: "Añadir línea",
    budget_name: "Nombre",
    budget_amount: "Importe",
    budget_category: "Categoría",
    budget_kind: "Tipo",
    budget_kind_income_fixed: "Ingreso fijo",
    budget_kind_income_extra: "Ingreso extra",
    budget_kind_expense_fixed: "Gasto fijo",
    budget_kind_expense_extra: "Gasto variable",
    budget_planned_label: "Objetivo de gasto",
    budget_currency: "Moneda",
    budget_export: "Exportar",
    budget_import: "Importar",
    budget_reset_confirm:
        "¿Seguro que quieres reiniciar el mes? Se borrarán todas las líneas.",
    budget_reset: "Reiniciar",
    budget_cancel: "Cancelar",
    budget_save: "Guardar",
    budget_delete: "Eliminar",

    generic_ok: "OK",
    generic_close: "Cerrar",
};

type LocaleContextValue = {
    locale: Locale;
    t: (key: keyof typeof ES | string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const value = useMemo<LocaleContextValue>(() => {
        return {
            locale: "es",
            t: (key) => {
                const k = String(key);
                return ES[k] ?? k;
            },
        };
    }, []);

    return (
        <LocaleContext.Provider value={value}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
    return ctx;
}
