"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

// --- TIPOS ---
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'week' | 'today' | 'done';
  due_date?: string;
  category_id?: string;
  category?: Category;
}

interface TasksContextType {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// --- PROVIDER ---
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Función segura para generar IDs temporales
  const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

  // CARGAR DATOS
  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Categorías
    const { data: cats } = await supabase.from('categories').select('*').order('created_at');
    if (cats) setCategories(cats);

    // Tareas
    const { data: ts } = await supabase
      .from('tasks')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });
    
    if (ts) setTasks(ts as any);
    setLoading(false);
  }, [supabase]);

  // REALTIME
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('tasks_global_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, supabase]);

  // --- ACCIONES (OPTIMISTAS) ---

  const addTask = async (taskData: Partial<Task>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tempId = generateId();
    const newTask = {
      id: tempId,
      user_id: user.id,
      title: taskData.title || "Nueva tarea",
      status: taskData.status || 'backlog',
      priority: taskData.priority || 'medium',
      ...taskData,
    } as any;

    setTasks(prev => [newTask, ...prev]); // ¡Actualización visual inmediata!

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: user.id })
      .select('*, category:categories(*)')
      .single();

    if (data) {
      setTasks(prev => prev.map(t => t.id === tempId ? data : t));
    } else if (error) {
      console.error(error);
      setTasks(prev => prev.filter(t => t.id !== tempId)); // Revertir si falla
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    if (updates.status === 'today') updates.due_date = new Date().toISOString();
    
    await supabase.from('tasks').update(updates).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  const addCategory = async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const tempId = generateId();
    
    const newCat = { id: tempId, name, color, user_id: user.id };
    setCategories(prev => [...prev, newCat]);

    const { data } = await supabase.from('categories').insert({ name, color, user_id: user.id }).select().single();
    if (data) setCategories(prev => prev.map(c => c.id === tempId ? data : c));
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await supabase.from('categories').delete().eq('id', id);
  };

  return (
    <TasksContext.Provider value={{ tasks, categories, loading, addTask, updateTask, deleteTask, addCategory, deleteCategory }}>
      {children}
    </TasksContext.Provider>
  );
}

// Hook para consumir el contexto fácilmente
export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasks debe usarse dentro de un TasksProvider");
  return context;
}