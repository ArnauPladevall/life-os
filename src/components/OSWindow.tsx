"use client";
import { motion } from "framer-motion";
import { X, Minus } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  originRect?: DOMRect | null;
}

export function OSWindow({ title, icon, onClose, children, originRect }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Fondo oscuro */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* La Ventana */}
      <motion.div
        initial={originRect ? {
          opacity: 0,
          position: "fixed" as const,
          left: originRect.left,
          top: originRect.top,
          width: originRect.width,
          height: originRect.height,
          borderRadius: 24,
          x: 0,
          y: 0,
        } : { opacity: 0, y: 20 }}
        animate={originRect ? {
          opacity: 1,
          left: "50%",
          top: "50%",
          width: "min(92vw, 1152px)",
          height: "min(85vh, 900px)",
          borderRadius: 32,
          x: "-50%",
          y: "-50%",
        } : { opacity: 1, y: 0 }}
        exit={originRect ? {
          opacity: 0,
          left: originRect.left,
          top: originRect.top,
          width: originRect.width,
          height: originRect.height,
          borderRadius: 24,
          x: 0,
          y: 0,
        } : { opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="glass-panel w-full h-full max-w-6xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden ring-1 ring-white/10 shadow-2xl"
      >
        {/* Barra de Título */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 bg-white/[0.02] shrink-0 select-none" onDoubleClick={onClose}>
          <div className="flex items-center gap-3 text-gray-400">
             <div className="p-1.5 bg-white/5 rounded-md text-white/80 shadow-inner border border-white/5">
                {icon}
             </div>
             <span className="text-sm font-medium tracking-wide text-gray-300">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
             <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
               <Minus size={16} />
             </button>
             <button 
                onClick={onClose} 
                className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10"
             >
               <X size={16} />
             </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden relative bg-[#050505]/50">
          {children}
        </div>
      </motion.div>
    </div>
  );
}