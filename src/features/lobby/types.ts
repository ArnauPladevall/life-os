import type { ReactNode } from "react";

export type WidgetSize = "1x1" | "2x1" | "2x2" | "4x2";

export type WidgetTone =
  | "neutral"
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose";

export interface LobbyWidget {
  id: string;
  type: string;
  size: WidgetSize;
  tone: WidgetTone;
  page: number;
  x: number;
  y: number;
}

export interface Preferences {
  showHeader: boolean;
  bgId: string;
  customTitle?: string;
  emoji?: string;
  emojiPosition?: "top" | "inline";
  titleAlign?: "center" | "left";
}

export interface WidgetRenderContext {
  openApp: (type: string) => void;
  widgetState: unknown;
  setWidgetState: (nextState: unknown) => void;
  isEditing: boolean;
}

export interface WidgetDefinition {
  kind: "widget";
  type: string;
  name: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  supportedSizes: WidgetSize[];
  expandable: boolean;
  defaultTone: WidgetTone;
  renderPreview: (widget: LobbyWidget, context: WidgetRenderContext) => ReactNode;
  renderExpanded?: (widget: LobbyWidget, context: WidgetRenderContext) => ReactNode;
}

export interface AppDefinition {
  kind: "app";
  type: string;
  name: string;
  description: string;
  icon: string;
  renderApp: () => ReactNode;
}

export type CatalogEntry = WidgetDefinition | AppDefinition;