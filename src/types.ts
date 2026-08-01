export type TaskStatus =
  | 'PENDENTE'
  | 'EM_CURSO'
  | 'CONCLUIDO'
  | 'ADIADA'
  | 'NAO_FEITO'
  | 'CANCELADO';

export type RingtoneType =
  | 'sci_fi'
  | 'epic_synth'
  | 'high_energy'
  | 'funny_horn'
  | 'zen_bell'
  | 'urgent_alert';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  estimatedTime: number; // in minutes
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm (24h)
  ringtone: RingtoneType;
  completedCount: number;
  status: TaskStatus;
  subtasks: Subtask[];
  progress: number; // 0 to 100
  notes: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  flag: string;
}

export type AICallState = 'idle' | 'calling' | 'in_call';

export type AIMode = 'normal' | 'hyper_productive';

export interface AITaskAction {
  type:
    | 'create'
    | 'update_status'
    | 'edit'
    | 'delete'
    | 'ask_next'
    | 'alert_task'
    | 'suggest_list';
  task?: Task;
  taskId?: string;
  newStatus?: TaskStatus;
  message?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string; // Real-time translation in the selected target language
  targetLang?: string;
  timestamp: string;
  actions?: AITaskAction[];
}

export interface AIResponsePayload {
  replyText: string;
  translation?: string;
  voiceStyle?: string;
  mode?: AIMode;
  taskActions?: AITaskAction[];
}
