"use client";
import { useState, useEffect } from "react";
import { X, Calendar, Clock, Tag, ChevronDown, Trash2, Check, AlignLeft } from "lucide-react";
import { Category, Task } from "@/context/TasksContext";
import { motion } from "framer-motion";

interface Props {
  categories: Category[];
  onClose: () => void;
  onSubmit: (task: any, isEdit?: boolean) => void;
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteTask?: () => void;
  taskToEdit?: Task | null;
}

export function CreateTaskModal({ 
  categories, onClose, onSubmit, onAddCategory, onDeleteCategory, onDeleteTask, taskToEdit 
}: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("backlog");
  const [catId, setCatId] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDesc(taskToEdit.description || "");
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setCatId(taskToEdit.category_id || "");
      setDate(taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : "");
      setDuration(taskToEdit.duration ? taskToEdit.duration.toString() : "");
    }
  }, [taskToEdit]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const taskData = {
      title,
      description: desc,
      priority,
      status,
      category_id: catId || null,
      due_date: date || null,
      duration: duration ? parseInt(duration) : null
    };
    onSubmit(taskData, !!taskToEdit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-[#141414]">
          <h3 className="font-semibold text-white text-sm tracking-wide">
            {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
          </h3>
          <div className="flex gap-2">
            {taskToEdit && onDeleteTask && (
              <button onClick={() => { onDeleteTask(); onClose(); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <input 
              className="w-full bg-transparent text-xl md:text-2xl font-semibold text-white placeholder:text-white/20 outline-none border-none p-0" 
              placeholder="¿Qué hay que hacer?" 
              value={title} onChange={e => setTitle(e.target.value)} autoFocus
            />
            <div className="relative">
                <AlignLeft className="absolute top-3 left-3 text-gray-600" size={16}/>
                <textarea 
                className="w-full bg-[#181818] rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 placeholder:text-gray-600 outline-none resize-none h-24 border border-transparent focus:border-white/10 focus:bg-[#1C1C1C] transition-all" 
                placeholder="Añadir descripción o notas..."
                value={desc} onChange={e => setDesc(e.target.value)}
                />
            </div>
          </div>

          {/* GRID DE CONTROLES */}
          <div className="grid grid-cols-2 gap-4">
            {/* ESTADO - SELECT PERSONALIZADO */}
            <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Estado</label>
               <div className="relative group">
                 {/* La clase select-pro en globals.css oculta la flecha nativa */}
                 <select value={status} onChange={e => setStatus(e.target.value)} className="select-pro">
                   <option value="backlog">📥 Backlog</option>
                   <option value="week">📅 Esta Semana</option>
                   <option value="today">🔥 Para Hoy</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-white transition-colors" size={14}/>
               </div>
            </div>

            {/* PRIORIDAD */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Prioridad</label>
              <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-white/5 h-[42px]">
                {['low', 'medium', 'high'].map(p => (
                  <button key={p} onClick={() => setPriority(p)} className={`flex-1 rounded-md text-[10px] font-bold uppercase transition-all ${priority === p ? (p==='high'?'bg-red-500/20 text-red-400':p==='medium'?'bg-yellow-500/20 text-yellow-400':'bg-blue-500/20 text-blue-400') : 'text-gray-600 hover:text-gray-400'}`}>
                    {p === 'medium' ? 'Norm' : p === 'high' ? 'Alta' : 'Baja'}
                  </button>
                ))}
              </div>
            </div>

            {/* FECHA - INPUT DARK NATIVO */}
            <div className="relative group">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Calendar size={14} className="text-gray-500 group-focus-within:text-blue-400"/>
               </div>
               {/* Gracias a color-scheme: dark en CSS, esto será oscuro nativamente */}
               <input type="date" className="input-pro pl-9" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="relative group">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Clock size={14} className="text-gray-500 group-focus-within:text-orange-400"/>
               </div>
               <input type="number" placeholder="Minutos" className="input-pro pl-9" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2"><Tag size={12}/> Etiquetas</span>
                {!showNewCat && <button onClick={() => setShowNewCat(true)} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">+ Crear</button>}
            </div>
            
            {showNewCat && (
                <div className="flex gap-2 mb-3">
                    <input autoFocus type="text" placeholder="Nueva etiqueta..." className="bg-[#151515] rounded px-2 py-1 text-xs text-white border border-blue-500/50 outline-none flex-1" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (onAddCategory(newCatName, 'bg-gray-500'), setNewCatName(""), setShowNewCat(false))} />
                    <button onClick={() => setShowNewCat(false)} className="text-gray-500"><X size={14}/></button>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCatId("")} className={`px-3 py-1 rounded-md text-[11px] font-medium border transition-all ${!catId ? 'bg-white text-black border-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>General</button>
              {categories.map(cat => (
                 <button key={cat.id} onClick={() => setCatId(cat.id)} className={`group relative px-3 py-1 rounded-md text-[11px] font-medium border transition-all ${catId === cat.id ? 'bg-white text-black border-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}>
                    {cat.name}
                    <div onClick={(e) => {e.stopPropagation(); onDeleteCategory(cat.id)}} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity scale-75 hover:scale-100"><X size={8}/></div>
                 </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/[0.06] bg-[#141414] flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors text-sm">Cancelar</button>
          <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 text-sm">
            {taskToEdit ? 'Guardar Cambios' : 'Crear Tarea'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}