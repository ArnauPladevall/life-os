"use client";
import { useMemo, useState } from "react";
import { useTasks, Task } from "@/context/TasksContext";
import { Plus, List, Kanban as KanbanIcon, Calendar, Circle, Search, GripVertical, Pencil } from "lucide-react";
import { CreateTaskModal } from "./CreateTaskModal";
import { parseQuickTask } from "./taskParsing";
// IMPORTANTE: Importamos CSS de utilities para arreglar el cálculo de posición
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCorners, defaultDropAnimationSideEffects, DropAnimation, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Configuración para que el elemento soltado no haga efectos raros
const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.5' },
    },
  }),
};

// --- TARJETA DE TAREA (Draggable) ---
function DraggableTask({ task, onEdit }: { task: Task, onEdit: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { task } });
    
    const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.3 : 1, // Hacemos el original semitransparente en lugar de invisible
      zIndex: isDragging ? 999 : 1,
    };
    
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="group relative bg-[#161616] hover:bg-[#1C1C1C] p-3 rounded-lg border border-white/[0.04] transition-colors touch-none select-none"
      >
         <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/25 group-hover:text-white/40">
            <span {...listeners} className="inline-flex p-1 rounded-md cursor-grab active:cursor-grabbing">
              <GripVertical size={14} />
            </span>
         </div>
         {/* ... (contenido igual) ... */}
         <button
           onClick={() => !isDragging && onEdit()}
           className="w-full text-left pl-5 flex items-start gap-3"
         >
             <div className={`mt-1 w-3 h-3 rounded-sm border flex-shrink-0 ${task.priority === 'high' ? 'border-red-500/60 bg-red-500/10' : task.priority === 'medium' ? 'border-yellow-500/60' : 'border-white/20'}`}></div>
             <div className="flex-1 min-w-0">
                 <h4 className="text-sm font-medium text-gray-200 leading-snug">{task.title}</h4>
                 <div className="flex items-center gap-2 mt-2">
                    {task.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 tracking-wide">{task.category.name}</span>}
                    {task.due_date && <span className="text-[10px] text-gray-500 flex items-center gap-1 font-mono"><Calendar size={10}/> {new Date(task.due_date).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</span>}
                 </div>
             </div>
         </button>
      </div>
    );
}

// --- COLUMNA (Droppable) ---
function DroppableColumn({ id, title, tasks, onEdit }: any) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="flex-1 bg-[#0F0F0F] rounded-xl p-2 flex flex-col min-w-[280px] border border-white/[0.04]">
            <div className="flex items-center justify-between mb-3 px-2 pt-2">
                <h3 className="font-bold text-gray-500 text-[10px] uppercase tracking-widest">{title}</h3>
                <span className="text-[10px] text-gray-600 font-mono">{tasks.length}</span>
            </div>
            {/* Usamos gap-2 para separar las tareas en lugar de margin-bottom en cada una */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2 flex flex-col gap-2">
                {tasks.map((t: Task) => <DraggableTask key={t.id} task={t} onEdit={() => onEdit(t)} />)}
            </div>
        </div>
    );
}

// --- APP PRINCIPAL ---
export default function TasksApp() {
  const { tasks, categories, loading, addTask, updateTask, deleteTask, addCategory, deleteCategory } = useTasks();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [query, setQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeTasks = useMemo(() => {
    const base = tasks.filter((t) => t.status !== "done");
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((t) => t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
  }, [tasks, query]);
  
  const openModal = (taskToEdit?: Task) => {
    setEditingTask(taskToEdit || null);
    setShowModal(true);
  };
  
  const handleModalSubmit = (taskData: any, isEdit?: boolean) => { 
      isEdit && editingTask ? updateTask(editingTask.id, taskData) : addTask(taskData); 
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setDraggedTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If dropped on a column, over.id is the status.
    // If dropped on another task (rare), read its status.
    const overId = String(over.id);
    const overTask = tasks.find((t) => t.id === overId);
    const nextStatus = (overTask?.status ?? overId) as Task["status"];

    if (task.status !== nextStatus) updateTask(taskId, { status: nextStatus });
  };

  const submitQuickAdd = () => {
    const raw = quickTitle.trim();
    if (!raw) return;
    const parsed = parseQuickTask(raw);
    addTask({ ...parsed, status: "backlog" });
    setQuickTitle("");
  };

  return (
    <div className="h-full flex flex-col text-white">
      {/* TOOLBAR */}
      <div className="p-4 flex justify-between items-center border-b border-white/[0.06] bg-[#0A0A0A] shrink-0">
         <div className="flex bg-[#141414] p-0.5 rounded-lg border border-white/[0.04]">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${view==='list' ? 'bg-[#202020] text-white shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}><List size={14}/> Lista</button>
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${view==='kanban' ? 'bg-[#202020] text-white shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}><KanbanIcon size={14}/> Kanban</button>
         </div>
         <div className="flex items-center gap-2">
           <button onClick={() => openModal()} className="bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
               <Plus size={14}/> Nueva
           </button>
         </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-hidden p-4 bg-[#0A0A0A]">
        {loading ? <div className="flex items-center justify-center h-full text-gray-700 text-xs tracking-wider uppercase">Cargando...</div> : (
            view === 'list' ? (
                // VISTA LISTA
                <div className="h-full overflow-y-auto pr-2 custom-scrollbar max-w-4xl mx-auto">
                    {/* Quick add + search */}
                    <div className="sticky top-0 z-10 bg-[#0A0A0A] pb-3">
                      <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-11">
                          <Plus size={16} className="text-white/50" />
                          <input
                            value={quickTitle}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitQuickAdd();
                            }}
                            placeholder="Añadir tarea rápida…"
                            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
                          />
                          <button
                            onClick={submitQuickAdd}
                            className="h-8 px-3 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
                          >
                            Crear
                          </button>
                        </div>
                        <div className="md:w-72 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 h-11">
                          <Search size={16} className="text-white/40" />
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar…"
                            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
                          />
                        </div>
                      </div>
                    </div>
                    {activeTasks.length === 0 && <div className="text-center text-gray-700 mt-20 text-sm">Bandeja vacía</div>}
                    {activeTasks.map(task => (
                        <div key={task.id} className="group flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-[#141414] hover:border-white/[0.04] transition-all">
                             <button onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: 'done' }); }} className="text-gray-600 hover:text-white transition-colors"><Circle size={16}/></button>
                             <button onClick={() => openModal(task)} className="flex-1 flex items-center gap-3 min-w-0 text-left">
                               <span className="text-sm text-gray-300 truncate">{task.title}</span>
                               <div className="flex items-center gap-2">
                                   {task.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                                   <span className="text-[10px] text-gray-600 font-mono uppercase">{task.status}</span>
                               </div>
                             </button>
                             <button onClick={() => openModal(task)} className="p-2 rounded-lg hover:bg-white/5 text-white/35 hover:text-white/70 transition-colors">
                               <Pencil size={14} />
                             </button>
                        </div>
                    ))}
                </div>
            ) : (
                // VISTA KANBAN CON DRAG & DROP CORREGIDO
                <DndContext 
                    sensors={sensors}
                    onDragStart={(e) => setDraggedTask(e.active.data.current?.task)} 
                    onDragEnd={handleDragEnd} 
                    collisionDetection={closestCorners}
                >
                    <div className="h-full flex gap-3 overflow-x-auto pb-2 items-start">
                        <DroppableColumn id="backlog" title="Inbox" tasks={activeTasks.filter(t => t.status === 'backlog')} onEdit={openModal} />
                        <DroppableColumn id="week" title="En curso" tasks={activeTasks.filter(t => t.status === 'week')} onEdit={openModal} />
                        <DroppableColumn id="today" title="Hoy" tasks={activeTasks.filter(t => t.status === 'today')} onEdit={openModal} />
                    </div>
                    
                    {/* El Overlay ahora es independiente y usa configuración de animación segura */}
                    <DragOverlay dropAnimation={dropAnimationConfig}>
                        {draggedTask ? (
                            <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/20 shadow-2xl w-[280px] rotate-2 cursor-grabbing opacity-100">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-3 h-3 rounded-sm border flex-shrink-0 ${draggedTask.priority === 'high' ? 'border-red-500/60 bg-red-500/10' : draggedTask.priority === 'medium' ? 'border-yellow-500/60' : 'border-white/20'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white text-sm">{draggedTask.title}</h4>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )
        )}
      </div>
      
      {/* Importante: El modal se renderiza condicionalmente para evitar conflictos de Z-Index */}
      {showModal && (
          <CreateTaskModal 
            categories={categories} 
            onClose={() => setShowModal(false)} 
            onSubmit={handleModalSubmit} 
            onAddCategory={addCategory} 
            onDeleteCategory={deleteCategory} 
            onDeleteTask={() => editingTask && deleteTask(editingTask.id)} 
            taskToEdit={editingTask} 
          />
      )}
    </div>
  );
}