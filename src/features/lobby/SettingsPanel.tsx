"use client";
import { motion } from "framer-motion";
import { X, LogOut, Type, Layout, Image as ImageIcon, Briefcase, Terminal, Coffee, Home, Zap, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";

// Iconos disponibles en lugar de emojis
const ICONS = [
  { id: 'briefcase', icon: <Briefcase size={18}/> },
  { id: 'terminal', icon: <Terminal size={18}/> },
  { id: 'coffee', icon: <Coffee size={18}/> },
  { id: 'home', icon: <Home size={18}/> },
  { id: 'zap', icon: <Zap size={18}/> },
  { id: 'monitor', icon: <Monitor size={18}/> },
];

const BACKGROUNDS = [
  { id: "default", name: "Void", class: "bg-[#050505]" },
  { id: "aurora", name: "Aurora", class: "bg-gradient-to-br from-gray-900 via-purple-900/20 to-black" },
  { id: "midnight", name: "Midnight", class: "bg-gradient-to-b from-blue-950/30 to-black" },
  { id: "forest", name: "Forest", class: "bg-gradient-to-br from-green-950/30 to-black" },
];

interface Preferences {
  showHeader: boolean;
  bgId: string;
  customTitle?: string;
  iconId?: string; // Usamos ID de icono, no emoji
  titleAlign?: 'center' | 'left';
}

interface Props {
  onClose: () => void;
  preferences: Preferences;
  onUpdatePref: (newPrefs: Preferences) => void;
}

export function SettingsPanel({ onClose, preferences, onUpdatePref }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLocale();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const prefs = { customTitle: "LifeOS", iconId: 'terminal', showHeader: true, bgId: "default", ...preferences };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#121212]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t('settings_title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18}/></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto">
          
          {/* Identidad */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">{t('settings_identity')}</h3>
            <div className="space-y-3">
              <label className="text-xs text-gray-500 font-bold">{t('settings_spaceName').toUpperCase()}</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                <input 
                  type="text" 
                  value={prefs.customTitle}
                  onChange={(e) => onUpdatePref({ ...prefs, customTitle: e.target.value })}
                  className="input-pro pl-10"
                  placeholder={t('settings_spaceName_placeholder')}
                />
              </div>

              <label className="text-xs text-gray-500 font-bold mt-2 block">{t('settings_icon').toUpperCase()}</label>
              <div className="flex gap-2">
                {ICONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onUpdatePref({ ...prefs, iconId: item.id })}
                    className={`p-3 rounded-lg border transition-all ${prefs.iconId === item.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#181818] border-white/5 text-gray-500 hover:text-gray-300'}`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Apariencia */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">{t('settings_visual')}</h3>

            <div className="flex items-center justify-between p-3 bg-[#181818] rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <Layout size={18} className="text-gray-400"/>
                <span className="text-sm font-medium">{t('settings_showHeader')}</span>
              </div>
              <button 
                onClick={() => onUpdatePref({ ...prefs, showHeader: !prefs.showHeader })}
                className={`w-10 h-5 rounded-full relative transition-colors ${prefs.showHeader ? 'bg-blue-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${prefs.showHeader ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase">
                <ImageIcon size={14} /> {t('settings_background')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUNDS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => onUpdatePref({ ...prefs, bgId: bg.id })}
                    className={`h-20 rounded-xl border-2 transition-all relative overflow-hidden ${bg.class} ${prefs.bgId === bg.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-white/20'}`}
                  >
                    <span className="absolute bottom-2 left-3 text-[10px] font-bold text-white drop-shadow-md bg-black/50 px-2 py-0.5 rounded">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-[#121212]">
          <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
            <LogOut size={16}/> {t('logout')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}