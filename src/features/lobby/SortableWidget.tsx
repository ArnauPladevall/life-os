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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: {
      duration: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
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

  const jiggleVariants = {
    idle: { rotate: 0 },
    editing: {
      rotate: [-0.25, 0.25, -0.25],
      transition: {
        repeat: Infinity,
        duration: 0.24,
      },
    },
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full select-none">
      <motion.div
        className="h-full w-full"
        variants={jiggleVariants}
        animate={isEditing && !isDragging ? "editing" : "idle"}
      >
        <div className={`h-full w-full transition-all duration-200 ${isDragging ? "scale-[1.02] opacity-85" : "opacity-100"}`}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}