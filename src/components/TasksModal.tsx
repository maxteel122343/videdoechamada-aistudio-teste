import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Music,
  CheckCircle2,
  Zap,
  Play,
  Square,
  CheckSquare,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Task, TaskStatus, RingtoneType, Subtask } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onTriggerAlarmTest: (task: Task) => void;
}

export const TasksModal: React.FC<TasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onTriggerAlarmTest,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('TODAS');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');

  if (!isOpen) return null;

  const ringtoneOptions: { value: RingtoneType; label: string; desc: string }[] = [
    { value: 'sci_fi', label: 'Alarme Sci-Fi Cyber', desc: 'Acordes futuristas pulsantes' },
    { value: 'epic_synth', label: 'Epic Cyberpunk Synth', desc: 'Arpejo eletrônico marcante' },
    { value: 'high_energy', label: 'Alta Energia Eletro', desc: 'Batida dinâmica rápida' },
    { value: 'funny_horn', label: 'Buzina Cômica / Trompete', desc: 'Toque engraçado alegre' },
    { value: 'zen_bell', label: 'Sino Zen Tibetano', desc: 'Sino calmo meditativo' },
    { value: 'urgent_alert', label: 'Alerta Máximo Urgente', desc: 'Bip duplo de urgência' },
  ];

  const statuses: { value: TaskStatus; label: string; colorClass: string }[] = [
    { value: 'PENDENTE', label: 'Pendente', colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { value: 'EM_CURSO', label: 'Em Curso / Em Ação ⚡', colorClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { value: 'CONCLUIDO', label: 'Concluído / Cumprido ✓', colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { value: 'ADIADA', label: 'Adiada', colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { value: 'NAO_FEITO', label: 'Não Feito', colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { value: 'CANCELADO', label: 'Cancelado', colorClass: 'bg-slate-700/60 text-slate-400 border-slate-600' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'TODAS') return true;
    return t.status === filterStatus;
  });

  const handleStartNewTask = () => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentTask({
      name: '',
      estimatedTime: 30,
      startDate: today,
      startTime: '19:00',
      endDate: today,
      endTime: '19:30',
      ringtone: 'sci_fi',
      completedCount: 0,
      status: 'PENDENTE',
      subtasks: [],
      progress: 0,
      notes: '',
    });
    setIsEditing(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask({ ...task });
    setIsEditing(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask || !currentTask.name) return;

    if (currentTask.id) {
      onUpdateTask(currentTask as Task);
    } else {
      onAddTask(currentTask as Omit<Task, 'id'>);
    }
    setIsEditing(false);
    setCurrentTask(null);
  };

  const addSubtaskToCurrent = () => {
    if (!newSubtaskTitle.trim() || !currentTask) return;
    const subtasks = currentTask.subtasks || [];
    setCurrentTask({
      ...currentTask,
      subtasks: [
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtaskTitle.trim(),
          completed: false,
        },
      ],
    });
    setNewSubtaskTitle('');
  };

  const removeSubtaskFromCurrent = (subtaskId: string) => {
    if (!currentTask) return;
    setCurrentTask({
      ...currentTask,
      subtasks: (currentTask.subtasks || []).filter((s) => s.id !== subtaskId),
    });
  };

  const toggleSubtaskCurrent = (subtaskId: string) => {
    if (!currentTask) return;
    const subtasks = (currentTask.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const total = subtasks.length;
    const done = subtasks.filter((s) => s.completed).length;
    const calculatedProgress = total > 0 ? Math.round((done / total) * 100) : 0;

    setCurrentTask({
      ...currentTask,
      subtasks,
      progress: calculatedProgress,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-[#F5F5F0]">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#0F0F0F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#FF5F1F]" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl text-white">
                Agenda, Tarefas & Alarmes IA
              </h2>
              <p className="text-[11px] uppercase tracking-wider text-white/50">
                Gerencie compromissos, toques musicais e programe o Modo Hiper-Foco
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isEditing ? (
            <div>
              {/* Top Filter Tabs & New Task Button */}
              <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('TODAS')}
                    className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-colors ${
                      filterStatus === 'TODAS'
                        ? 'bg-[#FF5F1F] text-black font-bold'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    Todas ({tasks.length})
                  </button>
                  {statuses.map((st) => {
                    const count = tasks.filter((t) => t.status === st.value).length;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setFilterStatus(st.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-colors flex items-center gap-1.5 ${
                          filterStatus === st.value
                            ? 'bg-[#FF5F1F] text-black font-bold'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <span>{st.label}</span>
                        <span className="opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleStartNewTask}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest bg-[#FF5F1F] hover:bg-[#ff723b] text-black transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Criar Nova Tarefa</span>
                </button>
              </div>

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-[#0F0F0F] rounded-sm border border-white/10">
                  <AlertCircle className="w-10 h-10 text-white/30 mx-auto mb-3" />
                  <p className="text-white font-serif italic text-lg mb-1">
                    Nenhuma tarefa com este status encontrada
                  </p>
                  <p className="text-[11px] text-white/50 mb-4 uppercase tracking-wider">
                    Você pode pedir para a IA por voz ("Cria uma tarefa de academia hoje às 18h") ou clicar em "+ Criar Nova Tarefa".
                  </p>
                  <button
                    type="button"
                    onClick={handleStartNewTask}
                    className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold bg-white/10 hover:bg-[#FF5F1F] hover:text-black text-white border border-white/20 transition-colors"
                  >
                    + Criar Primeira Tarefa
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTasks.map((task) => {
                    const stBadge =
                      statuses.find((s) => s.value === task.status) ||
                      statuses[0];
                    const completedSub = task.subtasks.filter(
                      (st) => st.completed
                    ).length;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-sm p-5 border transition-all flex flex-col justify-between ${
                          task.status === 'EM_CURSO'
                            ? 'bg-[#0F0F0F] border-[#FF5F1F] ring-1 ring-[#FF5F1F]/20'
                            : 'bg-[#0F0F0F] hover:bg-white/5 border-white/10'
                        }`}
                      >
                        <div>
                          {/* Task Top Bar */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stBadge.colorClass}`}
                            >
                              {stBadge.label}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onTriggerAlarmTest(task)}
                                className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-colors"
                                title="Disparar Alarme Agora e Testar IA Interrompendo"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Simular Alarme</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEditTask(task)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                title="Editar Tarefa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                                title="Excluir Tarefa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                            {task.name}
                          </h3>

                          {/* Date & Time Info */}
                          <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-purple-400" />
                              {task.startDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {task.startTime} ({task.estimatedTime} min)
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <Music className="w-3.5 h-3.5" />
                              Toque: {task.ringtone}
                            </span>
                          </div>

                          {/* Subtasks Progress */}
                          {task.subtasks.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>Subtarefas ({completedSub}/{task.subtasks.length})</span>
                                <span>{task.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {task.notes && (
                            <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800 mb-3 line-clamp-2">
                              "{task.notes}"
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-700/60 mt-2">
                          <span className="text-xs text-slate-400">
                            Finalizada: <strong className="text-slate-200">{task.completedCount || 0}x</strong>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {task.status !== 'EM_CURSO' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateTask({ ...task, status: 'EM_CURSO' })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                              >
                                Iniciar (Em Curso ⚡)
                              </button>
                            )}

                            {task.status !== 'CONCLUIDO' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateTask({
                                    ...task,
                                    status: 'CONCLUIDO',
                                    progress: 100,
                                    completedCount: (task.completedCount || 0) + 1,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                              >
                                ✓ Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSaveTask} className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {currentTask?.id ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentTask(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Voltar à lista
                </button>
              </div>

              {/* Task Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nome da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  value={currentTask?.name || ''}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, name: e.target.value })
                  }
                  placeholder="Ex: Treinar inglês conversação com IA"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Date, Time & Estimated Time grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    required
                    value={currentTask?.startDate || ''}
                    onChange={(e) =>
                      setCurrentTask({ ...currentTask, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Horário de Início (Alarme)
                  </label>
                  <input
                    type="time"
                    required
                    value={currentTask?.startTime || ''}
                    onChange={(e) =>
                      setCurrentTask({ ...currentTask, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Tempo Estimado (Minutos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={currentTask?.estimatedTime || 30}
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        estimatedTime: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Ringtone selector with Preview play button */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Toque Musical do Alarme (Toca na chamada de vídeo)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ringtoneOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() =>
                        setCurrentTask({ ...currentTask, ringtone: opt.value })
                      }
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        currentTask?.ringtone === opt.value
                          ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500/50'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-purple-400" />
                          <span>{opt.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {opt.desc}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playRingtone(opt.value, false);
                        }}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-purple-400 hover:text-white transition-colors"
                        title="Ouvir prévia do toque"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Completed Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Status da Tarefa
                  </label>
                  <select
                    value={currentTask?.status || 'PENDENTE'}
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Quantidade de Vezes Finalizadas
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentTask?.completedCount || 0}
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        completedCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Subtasks Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Subtarefas de Foco (A IA auxiliará você a concluir em ação!)
                </label>
                <div className="space-y-2 mb-2">
                  {(currentTask?.subtasks || []).map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-800 border border-slate-700"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubtaskCurrent(st.id)}
                        className="flex items-center gap-2 text-xs text-slate-200"
                      >
                        {st.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span className={st.completed ? 'line-through text-slate-400' : ''}>
                          {st.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeSubtaskFromCurrent(st.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Adicionar nova subtarefa..."
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtaskToCurrent();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSubtaskToCurrent}
                    className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Notas / Observações
                </label>
                <textarea
                  rows={3}
                  value={currentTask?.notes || ''}
                  onChange={(e) =>
                    setCurrentTask({ ...currentTask, notes: e.target.value })
                  }
                  placeholder="Ex: Artigos para ler, link do vocabulário..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentTask(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
