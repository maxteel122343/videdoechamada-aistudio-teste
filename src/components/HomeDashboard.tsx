import React from 'react';
import {
  Video,
  Calendar,
  Zap,
  Globe,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Music,
  Plus,
  ArrowRight,
  Shield,
  Bot,
} from 'lucide-react';
import { Task, SupportedLanguage, AIMode } from '../types';

interface HomeDashboardProps {
  onStartCall: () => void;
  onOpenTasksModal: () => void;
  tasks: Task[];
  activeTask: Task | null;
  selectedLang: SupportedLanguage;
  languages: SupportedLanguage[];
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onTriggerAlarmTest: (task: Task) => void;
  onStartNewTask: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartCall,
  onOpenTasksModal,
  tasks,
  activeTask,
  selectedLang,
  languages,
  onSelectLanguage,
  onTriggerAlarmTest,
  onStartNewTask,
}) => {
  const pendingTasks = tasks.filter((t) => t.status === 'PENDENTE');
  const completedTasks = tasks.filter((t) => t.status === 'CONCLUIDO');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in text-[#F5F5F0]">
      {/* Editorial Hero Banner / Call Invitation */}
      <div className="relative rounded-none sm:rounded-lg overflow-hidden bg-[#0F0F0F] border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#FF5F1F]/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#FF5F1F] text-[10px] uppercase tracking-[0.25em] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VOX PRODUTIVA • IA SARCÁSTICA & PRODUTIVA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#F5F5F0] tracking-tight leading-tight">
              Seu{' '}
              <span className="text-[#FF5F1F] font-normal not-italic font-sans">
                Parceiro Virtual
              </span>{' '}
              que conversa, agenda e te mantém focado no objetivo.
            </h1>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed tracking-wide uppercase">
              Voz interativa e natural. Peça para agendar compromissos no microfone, 
              ouça alertas na chamada e ative o{' '}
              <strong className="text-[#00FF41]">Modo Hiper-Foco ⚡</strong> para 
              eliminar distrações e finalizar suas entregas no prazo.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2 flex-wrap">
              <button
                type="button"
                onClick={onStartCall}
                className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest bg-[#FF5F1F] hover:bg-[#ff723b] text-black transition-all"
              >
                <Video className="w-4 h-4 fill-current" />
                <span>Iniciar Chamada de Vídeo IA</span>
              </button>

              <button
                type="button"
                onClick={onOpenTasksModal}
                className="flex items-center gap-2 px-6 py-4 rounded-full font-semibold text-[11px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white border border-white/20 transition-colors"
              >
                <Calendar className="w-4 h-4 text-[#00FF41]" />
                <span>Minha Agenda & Alarmes ({tasks.length})</span>
              </button>
            </div>
          </div>

          {/* AI Companion Editorial Card */}
          <div className="w-full sm:w-80 rounded-sm bg-black/60 border border-white/10 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30">
              Online
            </div>

            <div className="w-20 h-20 rounded-full border border-white/20 p-1 mb-4 flex items-center justify-center bg-white/5">
              <div className="text-3xl">
                😎
              </div>
            </div>

            <h3 className="font-serif italic text-white text-xl">Parceiro Virtual IA</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
              Sarcástica • Precisa • Hiper-Foco
            </p>

            <div className="w-full bg-white/5 rounded-sm p-3 border border-white/10 text-left text-[11px] space-y-2 mb-4">
              <div className="flex items-center justify-between text-white/70">
                <span>Tradução live:</span>
                <span className="font-bold text-[#FF5F1F] uppercase tracking-wider">
                  {selectedLang.flag} {selectedLang.code.split('-')[0]}
                </span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Modo Foco:</span>
                <span className="text-[#00FF41] font-semibold uppercase tracking-wider">
                  Hiper-Foco
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartCall}
              className="w-full py-2.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/10 hover:bg-[#FF5F1F] hover:text-black border border-white/20 text-white transition-colors"
            >
              Falar por Vídeo / Voz
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Translator Language Selector Bar */}
      <div className="bg-[#0F0F0F] rounded-sm p-4 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#FF5F1F]" />
          <span className="text-[11px] uppercase tracking-widest font-semibold text-white/80">
            Idioma para Tradução Live na Chamada:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onSelectLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                selectedLang.code === lang.code
                  ? 'bg-[#FF5F1F] text-black font-bold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="uppercase tracking-wider">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active / Pending Tasks Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00FF41]" />
            <h2 className="text-xl font-serif text-white italic">
              Sua Agenda & Compromissos ({tasks.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartNewTask}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/10 hover:bg-[#FF5F1F] hover:text-black border border-white/20 text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nova Tarefa</span>
            </button>
            <button
              type="button"
              onClick={onOpenTasksModal}
              className="text-[10px] uppercase tracking-widest font-semibold text-[#FF5F1F] hover:underline"
            >
              Ver Todas / Toques
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-[#0F0F0F] border border-white/10 rounded-sm p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#FF5F1F]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-white text-xl">
                Nenhuma tarefa cadastrada ainda
              </h3>
              <p className="text-[11px] text-white/50 max-w-md mx-auto mt-2 uppercase tracking-wide">
                Inicie a chamada de vídeo com a IA e peça por voz: "Cria uma tarefa de treinar inglês hoje às 19h" ou clique em "+ Nova Tarefa".
              </p>
            </div>
            <button
              type="button"
              onClick={onStartNewTask}
              className="px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest bg-white/10 hover:bg-[#FF5F1F] hover:text-black text-white border border-white/20 transition-colors"
            >
              + Adicionar Primeira Tarefa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className={`rounded-sm p-5 border transition-all flex flex-col justify-between ${
                  task.status === 'EM_CURSO'
                    ? 'bg-[#0F0F0F] border-[#FF5F1F] ring-1 ring-[#FF5F1F]/20'
                    : 'bg-[#0F0F0F] hover:bg-white/5 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-semibold ${
                        task.status === 'EM_CURSO'
                          ? 'bg-[#FF5F1F]/20 text-[#FF5F1F] border border-[#FF5F1F]/40'
                          : task.status === 'CONCLUIDO'
                          ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40'
                          : 'bg-white/10 text-white/80 border border-white/20'
                      }`}
                    >
                      {task.status === 'EM_CURSO'
                        ? '⚡ Em Curso'
                        : task.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => onTriggerAlarmTest(task)}
                      className="px-2 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold bg-white/5 hover:bg-[#FF5F1F] hover:text-black text-[#FF5F1F] border border-white/10 flex items-center gap-1 transition-colors"
                      title="Testar alarme & IA interrompendo na chamada agora"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Testar Alarme</span>
                    </button>
                  </div>

                  <h3 className="font-serif text-white text-lg mb-2">
                    {task.name}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-white/60 flex-wrap mb-4">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#FF5F1F]" />
                      {task.startTime} ({task.estimatedTime}m)
                    </span>
                    <span className="flex items-center gap-1 text-[#00FF41]">
                      <Music className="w-3.5 h-3.5" />
                      Toque: {task.ringtone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    Progresso: <strong className="text-white">{task.progress}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={onStartCall}
                    className="text-[10px] uppercase tracking-widest font-semibold text-[#FF5F1F] hover:underline flex items-center gap-1"
                  >
                    <span>Chamada IA</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0F0F0F] rounded-sm p-6 border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5F1F]">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="font-serif italic text-white text-lg">
            Tradução em Tempo Real
          </h3>
          <p className="text-[11px] uppercase tracking-wider text-white/50 leading-relaxed">
            Fale em português e peça para a IA traduzir para inglês, espanhol, francês ou japonês. Legendas aparecem ao vivo!
          </p>
        </div>

        <div className="bg-[#0F0F0F] rounded-sm p-6 border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF41]">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-serif italic text-white text-lg">
            Alarme & Interrupção IA
          </h3>
          <p className="text-[11px] uppercase tracking-wider text-white/50 leading-relaxed">
            No dia e hora marcados, o toque musical toca na chamada e a IA para tudo para alertar: "Aviso importante! Sua tarefa começou!".
          </p>
        </div>

        <div className="bg-[#0F0F0F] rounded-sm p-6 border border-white/10 space-y-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5F1F]">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-serif italic text-white text-lg">
            Modo Hiper-Foco ⚡
          </h3>
          <p className="text-[11px] uppercase tracking-wider text-white/50 leading-relaxed">
            Ao iniciar a tarefa, a IA entra em modo hiperfoco, controla cronômetro e subtarefas, e motiva você a cumprir a tempo!
          </p>
        </div>
      </div>
    </div>
  );
};
