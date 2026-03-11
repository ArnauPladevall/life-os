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
}

export interface Preferences {
  showHeader: boolean;
  bgId: string;
  customTitle?: string;
  emoji?: string;
  emojiPosition?: "top" | "inline";
  titleAlign?: "center" | "left";
}

export interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  defaultSize: WidgetSize;
  supportedSizes: WidgetSize[];
  expandable: boolean;
  defaultTone: WidgetTone;
  renderPreview: (widget: LobbyWidget) => ReactNode;
  renderExpanded?: (widget: LobbyWidget) => ReactNode;
}