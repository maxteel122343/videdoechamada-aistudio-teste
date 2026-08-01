import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Task } from '../types';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/soundEffects';

interface HyperProductiveHUDProps {
  task: Task;
  onCompleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onPostponeTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
}

export const HyperProductiveHUD: React.FC<HyperProductiveHUDProps> = ({
  task,
  onCompleteTask,
  onToggleSubtask,
  onPostponeTask,
  onCancelTask,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSecondsEstimated = (task.estimatedTime || 30) * 60;
  const secondsRemaining = Math.max(0, totalSecondsEstimated - secondsElapsed);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = secondsRemaining < 300 && secondsRemaining > 0; // last 5 min
  const isOvertime = secondsElapsed > totalSecondsEstimated;

  const handleCompleteWithCelebration = () => {
    soundEffects.playTaskCompletedSound();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    onCompleteTask(task.id);
  };

  const completedSubtasksCount = task.subtasks.filter(
    (st) => st.completed
  ).length;

  return (
    <div className="border border-white/10 p-6 bg-white/5 rounded-lg text-[#F5F5F0] animate-fade-in my-4">
      {/* Editorial Top Info & Completion % */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] px-2 py-0.5 border border-[#00FF41] text-[#00FF41] rounded-full uppercase tracking-widest font-semibold">
            Em Ação • Modo Hiper
          </span>
          <h4 className="text-xl sm:text-2xl font-serif mt-2 text-white">
            {task.name}
          </h4>
        </div>
        <div className="text-right">
          <span className="block text-2xl sm:text-3xl font-light font-serif text-[#FF5F1F]">
            {task.progress}%
          </span>
          <span className="text-[9px] uppercase tracking-widest opacity-40">
            Conclusão
          </span>
        </div>
      </div>

      {/* Editorial Timer & Subtask count */}
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider opacity-70 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-[#FF5F1F]" />
          <span>
            {isOvertime ? '+' : ''}
            {formatTime(isOvertime ? secondsElapsed - totalSecondsEstimated : secondsRemaining)} / {task.estimatedTime}m
          </span>
        </div>
        <span>
          {completedSubtasksCount} de {task.subtasks.length} subtarefas prontas
        </span>
      </div>

      {/* Editorial Checklist */}
      <div className="space-y-3 mb-6">
        {task.subtasks.map((st) => (
          <div
            key={st.id}
            onClick={() => onToggleSubtask(task.id, st.id)}
            className="flex items-center text-[12px] cursor-pointer group select-none py-1"
          >
            <span
              className={`w-4 h-4 mr-3 rounded-sm flex items-center justify-center text-[9px] font-bold transition-all ${
                st.completed
                  ? 'border border-[#00FF41] text-[#00FF41] bg-[#00FF41]/10'
                  : 'border border-[#FF5F1F] group-hover:bg-white/5'
              }`}
            >
              {st.completed ? '✓' : ''}
            </span>
            <span
              className={`transition-all ${
                st.completed
                  ? 'line-through opacity-50 text-white/60'
                  : 'text-white font-medium'
              }`}
            >
              {st.title}
            </span>
          </div>
        ))}
      </div>

      {/* Editorial Quote Coach Alert */}
      <div className="flex items-center gap-2 text-[11px] bg-black/40 p-3 border border-white/5 rounded-sm mb-6 text-white/80">
        <Sparkles className="w-4 h-4 text-[#FF5F1F] shrink-0" />
        <span className="italic font-serif">
          {isOvertime
            ? 'Tempo estourado! Mantenha foco total para fechar a última etapa no placar.'
            : isUrgent
            ? 'Restam 5 minutos! Acelere para concluir sem adiar.'
            : 'Sincronizado com a IA. Marque cada item assim que concluído.'}
        </span>
      </div>

      {/* Bottom Editorial Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={handleCompleteWithCelebration}
          className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3 bg-[#FF5F1F] text-black font-bold text-[11px] uppercase tracking-widest hover:bg-[#ff723b] transition-colors rounded-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirmar Concluído ✓</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPostponeTask(task.id)}
            className="flex items-center gap-1 px-4 py-3 border border-white/20 hover:border-white/50 text-[10px] uppercase tracking-widest text-[#F5F5F0] transition-colors rounded-sm"
          >
            <PauseCircle className="w-3.5 h-3.5 text-[#FF5F1F]" />
            <span>Adiar 10m</span>
          </button>

          <button
            type="button"
            onClick={() => onCancelTask(task.id)}
            className="flex items-center gap-1 px-4 py-3 border border-white/10 hover:border-white/30 text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors rounded-sm"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
