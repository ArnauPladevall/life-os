"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

interface Props {
  id: string;
  children: React.ReactNode;
  isEditing: boolean;
}

export function SortableWidget({ id, children, isEditing }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Transición más suave tipo iOS
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: "relative" as const,
    height: "100%", 
    touchAction: "none",
  };

  // LA CLAVE: Reducimos drásticamente el ángulo de rotación
  const jiggleVariants = {
    shaking: {
      rotate: [-0.2, 0.2, -0.2], // Mucho más sutil
      transition: {
        repeat: Infinity,
        duration: 0.25, // Un poco más rápido para que parezca vibración
        ease: "linear"
      }
    },
    static: { rotate: 0 }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full select-none">
      <motion.div 
        className="h-full w-full"
        variants={jiggleVariants}
        animate={isEditing && !isDragging ? "shaking" : "static"} // No tiembla si lo estás arrastrando
      >
        <div className={`h-full w-full transition-all duration-300 ${isDragging ? 'opacity-80 scale-[1.02] shadow-2xl' : 'opacity-100'}`}>
           {children}
        </div>
      </motion.div>
    </div>
  );
}