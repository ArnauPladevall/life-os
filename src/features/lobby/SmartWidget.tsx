"use client";

import { Maximize2, Palette, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Definimos tamaños basados en columnas (Grid de 6 columnas)
export type WidgetSize = "1x1" | "2x1" | "2x2" | "4x2";

interface Props {
  id: string;
  type: string;
  size: WidgetSize;
  color: string;
  isEditing: boolean;
  onOpenColor: (e: React.PointerEvent) => void;
  onOpenSize: (e: React.PointerEvent) => void;
  onRemove: () => void;
  onOpenApp?: (rect: DOMRect) => void; // Abrir App completa (rect para animación)
  children?: React.ReactNode; // El contenido del widget (Mini View)
}

export function SmartWidget({ 
  type, 
  size, 
  color, 
  isEditing, 
  onOpenColor, 
  onOpenSize, 
  onRemove,
  onOpenApp,
  children 
}: Props) {
  
  return (
    <div 
      onClick={(e) => {
        // Solo abrimos la app si NO estamos editando
        if (!isEditing && onOpenApp) {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          onOpenApp(rect);
        }
      }}
      className={`h-full w-full rounded-3xl relative transition-all duration-500 ${color} group shadow-xl overflow-hidden backdrop-blur-2xl border border-white/[0.08] ${!isEditing ? 'cursor-pointer hover:brightness-[1.06] active:brightness-[0.98]' : ''}`}
    >
      
      {/* --- CAPA DE EDICIÓN (Solo visible en modo lápiz) --- */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()} // Evita clicks fantasma
          >
             {/* Botón Tamaño */}
             <button 
               onPointerDown={(e) => e.stopPropagation()}
               onClick={onOpenSize} 
               className="p-3 bg-white/90 hover:bg-white text-black rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 backdrop-blur-md"
             >
               <Maximize2 size={18} />
             </button>

             {/* Botón Color */}
             <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onOpenColor} 
                className="p-3 bg-white/90 hover:bg-white text-black rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 backdrop-blur-md"
             >
               <Palette size={18} />
             </button>

             {/* Botón Eliminar (Lo añadimos aquí para acceso rápido) */}
             <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-3 bg-red-500 hover:bg-red-400 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-90 backdrop-blur-md"
             >
               <X size={18} />
             </button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENIDO DEL WIDGET --- */}
      <div className="w-full h-full relative z-0 p-4 md:p-5">
        {children ? (
          children 
        ) : (
          /* Placeholder por si no hay contenido específico (A, B, C...) */
          <div className="w-full h-full flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white/10 select-none tracking-tighter">{type}</h1>
            <p className="text-white/30 font-mono text-[10px] mt-1 uppercase tracking-widest">{size}</p>
          </div>
        )}
      </div>

    </div>
  );
}