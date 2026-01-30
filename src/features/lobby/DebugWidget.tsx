"use client";

import { X, Maximize2, Palette } from "lucide-react";

// Definimos los tamaños posibles para simular iOS
export type WidgetSize = "small" | "medium" | "large";

interface Props {
  id: string;
  type: string; // "A", "B", "C"...
  size: WidgetSize;
  color: string;
  isEditing: boolean;
  onRemove: () => void;
  onResize: () => void;
  onColorChange: () => void;
}

export function DebugWidget({ 
  type, 
  size, 
  color, 
  isEditing, 
  onRemove, 
  onResize, 
  onColorChange 
}: Props) {
  
  return (
    <div className={`h-full w-full rounded-2xl p-6 relative transition-all duration-300 ${color} flex flex-col items-center justify-center group border border-white/5 shadow-xl overflow-hidden`}>
      
      {/* --- CONTROLES DE EDICIÓN (Solo visibles al editar) --- */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in">
          
          <div className="flex gap-2">
            {/* Botón Cambiar Tamaño */}
            <button 
              onClick={(e) => { e.stopPropagation(); onResize(); }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-transform active:scale-90"
              title="Cambiar tamaño"
            >
              <Maximize2 size={20} />
            </button>

            {/* Botón Cambiar Color */}
            <button 
              onClick={(e) => { e.stopPropagation(); onColorChange(); }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-transform active:scale-90"
              title="Cambiar color"
            >
              <Palette size={20} />
            </button>
          </div>

          {/* Botón Eliminar */}
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-full transition-transform active:scale-90 mt-2"
          >
            <X size={24} />
          </button>
          
          <span className="text-white/50 text-xs font-mono absolute bottom-4">Arrastrar para mover</span>
        </div>
      )}

      {/* --- CONTENIDO DEL WIDGET --- */}
      <h1 className="text-6xl font-bold text-white/20 select-none">{type}</h1>
      <p className="text-white/40 font-mono text-sm mt-2">{size.toUpperCase()}</p>

    </div>
  );
}