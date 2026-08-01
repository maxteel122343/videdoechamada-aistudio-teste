import React from 'react';
import {
  Zap,
  Volume2,
  VolumeX,
  Globe,
} from 'lucide-react';
import { AIMode, SupportedLanguage } from '../types';

interface AIAvatarCardProps {
  isSpeaking: boolean;
  currentMode: AIMode;
  selectedLang: SupportedLanguage;
  aiName: string;
  aiVoiceStyle?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  statusText?: string;
}

export const AIAvatarCard: React.FC<AIAvatarCardProps> = ({
  isSpeaking,
  currentMode,
  selectedLang,
  aiName = 'Parceiro Virtual',
  isMuted = false,
  onToggleMute,
  statusText,
}) => {
  const isHyper = currentMode === 'hyper_productive';

  return (
    <div
      className={`relative rounded-none sm:rounded-lg overflow-hidden border transition-all duration-500 flex flex-col justify-between p-6 aspect-video sm:aspect-auto sm:min-h-[420px] ${
        isHyper
          ? 'bg-[#0A0A0A] border-[#FF5F1F] ring-1 ring-[#FF5F1F]/20'
          : 'bg-[#0A0A0A] border-white/10'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A] to-[#0A0A0A] pointer-events-none"></div>

      {/* Top Editorial Status Bar */}
      <div className="flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-1.5 border border-white/10 rounded-full">
          <div
            className={`w-2 h-2 rounded-full ${
              isHyper
                ? 'bg-[#FF5F1F] animate-pulse'
                : 'bg-[#00FF41]'
            }`}
          ></div>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#F5F5F0]">
            {aiName}
          </span>
          <span className="text-[9px] uppercase tracking-tighter text-white/50">
            ({isHyper ? 'Modo Hiper-Foco' : 'Voz Interativa'})
          </span>
        </div>

        {/* Translation Language Badge */}
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/70">
          <Globe className="w-3 h-3 text-[#FF5F1F]" />
          <span>PT ⇄</span>
          <span className="font-bold text-white">
            {selectedLang.code.split('-')[0].toUpperCase()}
          </span>
        </div>
      </div>

      {/* Center Editorial Visualizer (Concentric Rings & Serif Headline) */}
      <div className="my-auto flex flex-col items-center justify-center text-center z-10 py-6">
        {/* Editorial Concentric Ring Audio Visualizer */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 border border-white/5 rounded-full flex items-center justify-center mb-6">
          <div className="w-36 h-36 sm:w-44 sm:h-44 border border-white/10 rounded-full flex items-center justify-center">
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isHyper ? 'bg-[#FF5F1F]/10 border border-[#FF5F1F]' : 'bg-white/5 border border-white/20'
              }`}
            >
              {/* Dynamic Waveform Bars inside ring */}
              <div className="flex items-end space-x-1.5 h-10">
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
                  const heightClass = isSpeaking
                    ? [
                        'h-4 animate-bounce',
                        'h-9 animate-bounce',
                        'h-6 animate-bounce',
                        'h-10 animate-bounce',
                        'h-5 animate-bounce',
                        'h-8 animate-bounce',
                        'h-4 animate-bounce',
                      ][bar % 7]
                    : 'h-2 opacity-40';

                  return (
                    <div
                      key={bar}
                      style={{
                        animationDelay: `${bar * 80}ms`,
                        animationDuration: '500ms',
                      }}
                      className={`w-1 rounded-sm transition-all duration-300 ${heightClass} ${
                        isHyper ? 'bg-[#FF5F1F]' : 'bg-[#FF5F1F]'
                      }`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Serif Editorial Quote Headline */}
        <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl mb-2 text-[#F5F5F0] max-w-2xl leading-tight">
          "{isHyper
            ? 'Foco total! Elimine as distrações agora.'
            : 'Como posso te ajudar a produzir hoje?'}"
        </h1>
        <p className="text-[11px] text-white/50 tracking-[0.25em] uppercase">
          {statusText ||
            (isHyper
              ? 'IA corrigindo postura produtiva • MODO HIPER-FOCO'
              : 'IA SARCÁSTICA & PRODUTIVA • AGENDAMENTO POR VOZ')}
        </p>
      </div>

      {/* Bottom info banner */}
      <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest text-white/60 z-10 bg-black/80 px-4 py-3 border border-white/10 rounded-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
          <span>
            Diga: <span className="text-white font-serif italic">"Cria uma tarefa hoje às 19h"</span>
          </span>
        </div>

        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className="flex items-center gap-1 text-white/70 hover:text-[#FF5F1F] transition-colors font-medium"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#FF5F1F]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#00FF41]" />
            )}
            <span>{isMuted ? 'ÁUDIO MUDO' : 'VOZ ATIVA'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
