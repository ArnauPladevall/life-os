export type QuoteTopic = "reflective" | "motivation" | "love" | "focus";

export const QUOTES: Record<QuoteTopic, string[]> = {
  reflective: [
    "Lo simple también es profundo.",
    "Cuida tu atención: es tu vida.",
    "La calma es una forma de poder.",
    "Menos ruido, más claridad.",
    "El progreso es paciencia aplicada.",
    "Vive hoy como si fuera diseño.",
    "El tiempo revela prioridades.",
    "Respira: ya estás aquí.",
    "Lo importante no grita.",
    "La disciplina protege la paz.",
  ],
  motivation: [
    "Hazlo hoy: tu futuro lo agradecerá.",
    "Pequeño paso, gran impulso.",
    "La constancia vence al talento.",
    "Crea impulso, no excusas.",
    "Termina lo que empiezas.",
    "Tu foco vale más que tu tiempo.",
    "Optimiza la fricción, no tu sueño.",
    "Sé brutalmente consistente.",
    "Una cosa bien, luego otra.",
    "Gana el día con una tarea.",
  ],
  love: [
    "Amar es elegir, cada día.",
    "La ternura también es fuerza.",
    "Escucha con el corazón abierto.",
    "Cuida lo que quieres que crezca.",
    "Tu presencia es un regalo.",
    "El amor es atención sincera.",
    "Habla suave, actúa grande.",
    "La confianza se construye en detalles.",
    "Sé hogar, no tormenta.",
    "Agradece en voz alta.",
  ],
  focus: [
    "Elimina, luego ejecuta.",
    "Un objetivo. Una sesión.",
    "Hazlo feo, pero hazlo.",
    "La claridad llega con acción.",
    "Sin agenda, no hay foco.",
    "No negocies con distracciones.",
    "Tu mejor herramienta: decir no.",
    "El ritmo vence al sprint.",
    "Profundidad sobre velocidad.",
    "Bloquea tiempo, desbloquea resultados.",
  ],
};

export const TOPIC_LABEL_ES: Record<QuoteTopic, string> = {
  reflective: "Reflexivas",
  motivation: "Motivación",
  love: "Amor",
  focus: "Enfoque",
};

export const TOPIC_LABEL_EN: Record<QuoteTopic, string> = {
  reflective: "Reflective",
  motivation: "Motivation",
  love: "Love",
  focus: "Focus",
};