import React, { useEffect } from 'react';
import {
  BellRing,
  Zap,
  Play,
  PauseCircle,
  XCircle,
  Music,
  Calendar,
  Clock,
  Volume2,
} from 'lucide-react';
import { Task } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { aiVoicePlayer } from '../utils/aiVoicePlayer';

interface TaskAlertModalProps {
  task: Task | null;
  onConfirmStart: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  onClose: () => void;
  inCall: boolean;
}

export const TaskAlertModal: React.FC<TaskAlertModalProps> = ({
  task,
  onConfirmStart,
  onPostpone,
  onCancel,
  onClose,
  inCall,
}) => {
  useEffect(() => {
    if (task) {
      // 1) Play selected musical ringtone in loop!
      soundEffects.playRingtone(task.ringtone, true);

      // 2) The AI speaks out loud to alert the user ("Ei aviso importante a tarefa do dia x e hora acabou de ser ativada!")
      const alertSpeech = `Ei! Aviso importante! A tarefa "${task.name}", marcada para hoje às ${task.startTime}, acabou de ser ativada! Podemos mudar o status para em curso agora e entrar no Modo Hiperprodutivo?`;
      aiVoicePlayer.speak(alertSpeech, 'normal', 'pt-BR');
    }

    return () => {
      soundEffects.stopRingtone();
      aiVoicePlayer.stopSpeaking();
    };
  }, [task]);

  if (!task) return null;

  const ringtoneNameMap: Record<string, string> = {
    sci_fi: 'Alarme Sci-Fi Cyber',
    epic_synth: 'Epic Cyberpunk Synth',
    high_energy: 'Alta Energia Eletro',
    funny_horn: 'Buzina Cômica / Trompete',
    zen_bell: 'Sino Zen Tibetano',
    urgent_alert: 'Alerta Máximo Urgente',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-[#F5F5F0]">
      {/* Glow pulse background */}
      <div className="absolute w-96 h-96 rounded-full bg-[#FF5F1F]/15 blur-3xl animate-pulse"></div>

      <div className="relative w-full max-w-lg bg-[#0A0A0A] border-2 border-[#FF5F1F] rounded-sm shadow-2xl overflow-hidden animate-bounce-short">
        {/* Top bar */}
        <div className="bg-[#0F0F0F] border-b border-[#FF5F1F] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-[#FF5F1F] animate-bounce" />
            <span className="font-bold text-xs tracking-widest uppercase text-[#FF5F1F]">
              {inCall
                ? '⚡ IA INTERROMPENDO PARA AVISO IMPORTANTE!'
                : '🔔 ALERTA DE TAREFA ATIVADA!'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/10 text-white">
            {task.status}
          </span>
        </div>

        <div className="p-6 sm:p-8 text-center">
          {/* AI Message quote box */}
          <div className="bg-[#FF5F1F]/10 border border-[#FF5F1F]/40 rounded-sm p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-[#FF5F1F] font-bold text-[10px] uppercase tracking-widest mb-1">
              <Zap className="w-4 h-4 text-[#FF5F1F]" />
              <span>FALA DO PARCEIRO IA (Em tempo real):</span>
            </div>
            <p className="text-white text-sm sm:text-base font-serif italic leading-relaxed">
              "Ei! Aviso importante! A tarefa{' '}
              <strong className="text-[#FF5F1F] not-italic">{task.name}</strong> do dia{' '}
              {task.startDate} e horário <strong className="text-[#FF5F1F] not-italic">{task.startTime}</strong>{' '}
              acabou de ser ativada! Podemos mudar para o status{' '}
              <strong className="text-[#00FF41] not-italic">EM CURSO</strong> e iniciar o{' '}
              <strong className="text-[#00FF41] not-italic">Modo Hiper-Foco</strong>?"
            </p>
          </div>

          {/* Task Info badge */}
          <div className="bg-[#0F0F0F] rounded-sm p-5 border border-white/10 mb-6 space-y-3">
            <h3 className="text-xl sm:text-2xl font-serif italic text-white">
              {task.name}
            </h3>

            <div className="flex items-center justify-center gap-4 text-[11px] uppercase tracking-wider text-white/70 flex-wrap">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#FF5F1F]" />
                {task.startDate}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#FF5F1F]" />
                {task.startTime} ({task.estimatedTime}m)
              </span>
              <span className="flex items-center gap-1 text-[#00FF41] font-semibold">
                <Music className="w-3.5 h-3.5" />
                Toque: {ringtoneNameMap[task.ringtone] || task.ringtone}
              </span>
            </div>

            {task.notes && (
              <p className="text-xs text-white/50 italic pt-2 border-t border-white/10">
                "{task.notes}"
              </p>
            )}
          </div>

          {/* Ringtone loop indicator */}
          <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-[#FF5F1F] font-medium mb-6 animate-pulse">
            <Volume2 className="w-4 h-4" />
            <span>Toque de fundo tocando... Aguardando resposta!</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                soundEffects.stopRingtone();
                aiVoicePlayer.stopSpeaking();
                onConfirmStart(task.id);
              }}
              className="w-full py-4 px-6 rounded-sm font-bold text-xs uppercase tracking-widest bg-[#FF5F1F] hover:bg-[#ff723b] text-black shadow-xl flex items-center justify-center gap-3 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Sim, Iniciar Tarefa! (Modo Hiper-Foco ⚡)</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEffects.stopRingtone();
                  aiVoicePlayer.stopSpeaking();
                  onPostpone(task.id);
                }}
                className="py-3 px-4 rounded-sm font-semibold text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <PauseCircle className="w-3.5 h-3.5 text-[#FF5F1F]" />
                <span>Adiar (15m) • ADIADA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.stopRingtone();
                  aiVoicePlayer.stopSpeaking();
                  onCancel(task.id);
                }}
                className="py-3 px-4 rounded-sm font-semibold text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancelar • CANCELADO</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
