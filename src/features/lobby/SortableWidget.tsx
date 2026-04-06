"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: string;
  children: React.ReactNode;
  isEditing: boolean;
}

export function SortableWidget({ id, children, isEditing }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 80 : 1,
    touchAction: isEditing ? "none" : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`h-full w-full select-none transition-[box-shadow,transform,opacity] duration-200 ${
        isDragging
          ? "cursor-grabbing opacity-95 shadow-[0_24px_72px_rgba(0,0,0,0.38)]"
          : isEditing
          ? "cursor-grab"
          : "cursor-default"
      }`}
    >
      <div
        className={`h-full w-full transition-[transform,opacity] duration-200 ${
          isDragging ? "scale-[1.01]" : "scale-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}