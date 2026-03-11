"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function PomodoroWidget() {
  // --- LÓGICA (El Cerebro) ---
  // Tiempo inicial: 25 minutos (25 * 60 segundos)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus"); // 'focus' o 'break'

  // Efecto que hace funcionar el reloj
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Aquí añadiremos sonido más adelante
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Botón Play/Pause
  const toggleTimer = () => setIsActive(!isActive);
  
  // Botón Reset
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
  };

  // Formato de tiempo (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calcular porcentaje para la barra de progreso
  const totalTime = mode === "focus" ? 25 * 60 : 5 * 60;
  const progressPercentage = (1 - timeLeft / totalTime) * 100;

  // --- UI (Lo que se ve) ---
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between min-h-[220px] relative"
    >
      {/* Cabecera */}
      <div className="w-full flex justify-between items-center mb-4 z-10">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <span>⏱️</span> Pomodoro
        </h2>
        <span className={`text-xs px-2 py-1 rounded-full border transition-colors ${
          isActive 
            ? "bg-green-500/20 border-green-500 text-green-400" 
            : "bg-white/10 border-white/20 text-gray-400"
        }`}>
          {isActive ? "Running" : "Idle"}
        </span>
      </div>

      {/* Reloj Gigante */}
      <div className="text-6xl font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 z-10 my-4">
        {formatTime(timeLeft)}
      </div>

      {/* Controles */}
      <div className="flex gap-4 z-10">
        <button
          onClick={toggleTimer}
          className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 flex items-center justify-center border border-white/5 backdrop-blur-sm"
        >
          {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>

        <button
          onClick={resetTimer}
          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95 border border-white/5 backdrop-blur-sm"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Barra de progreso en la parte inferior (borde de color) */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-linear"
           style={{ width: `${progressPercentage}%` }} 
      />
    </motion.div>
  );
}