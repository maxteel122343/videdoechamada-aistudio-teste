import React, { useState, useEffect, useMemo } from 'react';
import { Task, SupportedLanguage, AIMode, ChatMessage, TaskStatus } from './types';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { VideoCallView } from './components/VideoCallView';
import { TasksModal } from './components/TasksModal';
import { TaskAlertModal } from './components/TaskAlertModal';
import { soundEffects } from './utils/soundEffects';
import { aiVoicePlayer } from './utils/aiVoicePlayer';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'demo-1',
    name: 'Treinar Inglês Interativo',
    estimatedTime: 30,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '14:30',
    ringtone: 'sci_fi',
    completedCount: 0,
    status: 'PENDENTE',
    subtasks: [
      { id: 'st-1', title: 'Praticar conversação com IA', completed: false },
      { id: 'st-2', title: 'Revisar 10 palavras novas', completed: false },
    ],
    progress: 0,
    notes: 'Treino diário de fluência',
  },
  {
    id: 'demo-2',
    name: 'Finalizar Relatório Semanal',
    estimatedTime: 45,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '16:45',
    ringtone: 'epic_synth',
    completedCount: 0,
    status: 'PENDENTE',
    subtasks: [
      { id: 'st-3', title: 'Consolidar métricas no gráfico', completed: false },
      { id: 'st-4', title: 'Enviar PDF por email', completed: false },
    ],
    progress: 0,
    notes: 'Relatório para a equipe de gestão',
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('vox_produtiva_tasks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_TASKS;
  });

  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(
    SUPPORTED_LANGUAGES[0]
  );
  const [inCall, setInCall] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);
  const [alertTask, setAlertTask] = useState<Task | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Persist tasks in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vox_produtiva_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  // Derived state: Active Task is any task with status EM_CURSO
  const activeTask = useMemo(
    () => tasks.find((t) => t.status === 'EM_CURSO') || null,
    [tasks]
  );

  // Mode: hyper_productive if there is an active task, otherwise normal
  const currentMode: AIMode = activeTask ? 'hyper_productive' : 'normal';

  // Check scheduled task alarms
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      const dueTask = tasks.find(
        (t) =>
          t.status === 'PENDENTE' &&
          t.startDate === todayStr &&
          t.startTime === currentTimeStr
      );

      if (dueTask && alertTask?.id !== dueTask.id) {
        setAlertTask(dueTask);
      }
    };

    const interval = setInterval(checkAlarms, 15000);
    return () => clearInterval(interval);
  }, [tasks, alertTask]);

  // Helper to update a task by ID
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleTriggerAlarmTest = (task: Task) => {
    setAlertTask(task);
  };

  // Confirm start of a task from Alert Modal -> Changes status to EM_CURSO
  const handleConfirmStartTask = (taskId: string) => {
    soundEffects.playHyperModePowerUp();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: 'EM_CURSO' };
        }
        // If another task was EM_CURSO, set it back to PENDENTE
        if (t.status === 'EM_CURSO') {
          return { ...t, status: 'PENDENTE' };
        }
        return t;
      })
    );
    setAlertTask(null);
    if (!inCall) {
      setInCall(true);
    }
  };

  const handlePostponeTask = (taskId: string) => {
    soundEffects.playTaskCompletedSound();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'ADIADA' } : t))
    );
    setAlertTask(null);
  };

  const handleCancelTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'CANCELADO' } : t))
    );
    setAlertTask(null);
  };

  const handleCompleteTask = (taskId: string) => {
    soundEffects.playTaskCompletedSound();

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) => ({
            ...st,
            completed: true,
          }));
          return {
            ...t,
            status: 'CONCLUIDO',
            progress: 100,
            completedCount: t.completedCount + 1,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const completedCount = updatedSubtasks.filter(
            (st) => st.completed
          ).length;
          const progress =
            updatedSubtasks.length > 0
              ? Math.round((completedCount / updatedSubtasks.length) * 100)
              : 0;

          const isFullyDone = progress === 100;
          return {
            ...t,
            subtasks: updatedSubtasks,
            progress,
            status: isFullyDone ? 'CONCLUIDO' : t.status,
          };
        }
        return t;
      })
    );
  };

  const handleAskNextTask = () => {
    const nextTask = tasks.find((t) => t.status === 'PENDENTE');
    if (nextTask) {
      handleConfirmStartTask(nextTask.id);
    }
  };

  // Send message to backend API /api/chat
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          tasks,
          activeTaskId: activeTask?.id || null,
          targetLang: selectedLang.code !== 'pt-BR' ? selectedLang.code : null,
          mode: currentMode,
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: data.replyText || 'Entendido!',
        translation: data.translation || undefined,
        targetLang: selectedLang.code,
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        actions: data.taskActions || [],
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak response with AI Voice
      aiVoicePlayer.speak(
        data.replyText,
        data.mode || currentMode,
        selectedLang.code,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );

      // Execute task actions returned by Gemini
      if (data.taskActions && Array.isArray(data.taskActions)) {
        data.taskActions.forEach((action: any) => {
          if (action.type === 'create' && action.task) {
            handleAddTask(action.task);
          } else if (action.type === 'update_status' && action.taskId) {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === action.taskId
                  ? { ...t, status: action.newStatus || t.status }
                  : t
              )
            );
          }
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: 'Desculpe, ocorreu uma falha na comunicação. Tente novamente!',
        timestamp: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleToggleCall = () => {
    if (inCall) {
      setInCall(false);
      aiVoicePlayer.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setInCall(true);
    }
  };

  const unreadTasksCount = tasks.filter((t) => t.status === 'PENDENTE').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] font-sans flex flex-col antialiased">
      {/* Top Header Navigation */}
      <Header
        currentMode={currentMode}
        activeTask={activeTask}
        selectedLang={selectedLang}
        languages={SUPPORTED_LANGUAGES}
        onSelectLanguage={setSelectedLang}
        onOpenTasksModal={() => setIsTasksModalOpen(true)}
        inCall={inCall}
        onToggleCall={handleToggleCall}
        unreadTasksCount={unreadTasksCount}
      />

      {/* Main View: Either Video Call or Home Dashboard */}
      <main className="flex-1 pb-12">
        {inCall ? (
          <VideoCallView
            inCall={inCall}
            onEndCall={handleToggleCall}
            currentMode={currentMode}
            activeTask={activeTask}
            selectedLang={selectedLang}
            isSpeaking={isSpeaking}
            messages={messages}
            onSendMessage={handleSendMessage}
            isAiProcessing={isAiProcessing}
            onCompleteTask={handleCompleteTask}
            onToggleSubtask={handleToggleSubtask}
            onPostponeTask={handlePostponeTask}
            onCancelTask={handleCancelTask}
            onAskNextTask={handleAskNextTask}
            onOpenTasksModal={() => setIsTasksModalOpen(true)}
          />
        ) : (
          <HomeDashboard
            onStartCall={() => setInCall(true)}
            onOpenTasksModal={() => setIsTasksModalOpen(true)}
            tasks={tasks}
            activeTask={activeTask}
            selectedLang={selectedLang}
            languages={SUPPORTED_LANGUAGES}
            onSelectLanguage={setSelectedLang}
            onTriggerAlarmTest={handleTriggerAlarmTest}
            onStartNewTask={() => setIsTasksModalOpen(true)}
          />
        )}
      </main>

      {/* Agenda & Tasks Management Modal */}
      <TasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        tasks={tasks}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onTriggerAlarmTest={handleTriggerAlarmTest}
      />

      {/* Real-time Task Trigger / Alarm Modal */}
      <TaskAlertModal
        task={alertTask}
        onConfirmStart={handleConfirmStartTask}
        onPostpone={handlePostponeTask}
        onCancel={handleCancelTask}
        onClose={() => setAlertTask(null)}
        inCall={inCall}
      />
    </div>
  );
}
