import React from 'react';
import {
  Zap,
  Calendar,
  Languages,
  Video,
  Phone,
} from 'lucide-react';
import { SupportedLanguage, AIMode, Task } from '../types';

interface HeaderProps {
  currentMode: AIMode;
  activeTask: Task | null;
  selectedLang: SupportedLanguage;
  languages: SupportedLanguage[];
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenTasksModal: () => void;
  inCall: boolean;
  onToggleCall: () => void;
  unreadTasksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  activeTask,
  selectedLang,
  languages,
  onSelectLanguage,
  onOpenTasksModal,
  inCall,
  onToggleCall,
  unreadTasksCount,
}) => {
  return (
    <nav className="h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 bg-black/60 backdrop-blur-md text-[#F5F5F0] sticky top-0 z-40 selection:bg-[#FF5F1F] selection:text-black">
      {/* Brand & Editorial Dot */}
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 rounded-full bg-[#FF5F1F] animate-pulse"></div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-80">
            VOX PRODUTIVA v2.4
          </span>
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 border border-white/20 text-white/70">
            Parceiro IA
          </span>
        </div>
      </div>

      {/* Center Editorial Status / Hiper-Foco */}
      <div className="hidden lg:flex items-center space-x-8 text-[11px] uppercase tracking-widest font-medium">
        {currentMode === 'hyper_productive' ? (
          <span className="text-[#FF5F1F] flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Modo Hiper-Foco Ativo
          </span>
        ) : (
          <span className="text-[#00FF41] font-semibold">
            ● IA Pronta & Interativa
          </span>
        )}

        {activeTask && (
          <span className="opacity-80 flex items-center gap-1">
            <span className="text-[#00FF41]">✓</span>
            <span className="text-white font-serif italic">{activeTask.name}</span>
          </span>
        )}

        <span className="opacity-50">
          Tradução: PT ⇄ {selectedLang.code.toUpperCase()}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Real-time Translator Language Selector */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-[#FF5F1F] rounded-full text-[#F5F5F0] text-[10px] uppercase tracking-tighter transition-colors bg-white/5"
            title="Tradução em tempo real"
          >
            <Languages className="w-3.5 h-3.5 text-[#FF5F1F]" />
            <span>
              {selectedLang.flag} {selectedLang.code.toUpperCase()}
            </span>
          </button>

          <div className="absolute right-0 mt-1 w-48 bg-[#0F0F0F] rounded-lg border border-white/20 shadow-2xl py-1 hidden group-hover:block z-50">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-white/50 border-b border-white/10 uppercase tracking-widest">
              Tradução em Tempo Real:
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/10 transition-colors ${
                  selectedLang.code === lang.code
                    ? 'text-[#FF5F1F] font-semibold bg-white/5'
                    : 'text-white/80'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Modal Button */}
        <button
          type="button"
          onClick={onOpenTasksModal}
          className="flex items-center gap-1.5 px-4 py-1.5 border border-white/20 hover:border-white/50 rounded-full text-[#F5F5F0] text-[10px] uppercase tracking-tighter transition-colors bg-white/5"
        >
          <Calendar className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>Agenda</span>
          {unreadTasksCount > 0 && (
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#FF5F1F] text-black rounded-full">
              {unreadTasksCount}
            </span>
          )}
        </button>

        {/* Call Toggle Button */}
        <button
          type="button"
          onClick={onToggleCall}
          className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-[10px] uppercase font-bold tracking-tighter transition-all ${
            inCall
              ? 'border-[#FF5F1F] bg-[#FF5F1F] text-black hover:bg-transparent hover:text-[#FF5F1F]'
              : 'border-white/20 bg-white/10 hover:bg-[#FF5F1F] hover:text-black hover:border-[#FF5F1F] text-white'
          }`}
        >
          {inCall ? (
            <>
              <Phone className="w-3.5 h-3.5 rotate-135" />
              <span>Encerrar Chamada</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5" />
              <span>Chamada IA</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
