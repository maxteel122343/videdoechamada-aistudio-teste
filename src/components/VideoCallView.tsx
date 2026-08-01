import React, { useRef, useEffect, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  MessageSquare,
  Globe,
  Zap,
  Calendar,
  ListTodo,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { Task, SupportedLanguage, AIMode, ChatMessage } from '../types';
import { AIAvatarCard } from './AIAvatarCard';
import { HyperProductiveHUD } from './HyperProductiveHUD';

interface VideoCallViewProps {
  inCall: boolean;
  onEndCall: () => void;
  currentMode: AIMode;
  activeTask: Task | null;
  selectedLang: SupportedLanguage;
  isSpeaking: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isAiProcessing: boolean;
  onCompleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onPostponeTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
  onAskNextTask: () => void;
  onOpenTasksModal: () => void;
}

export const VideoCallView: React.FC<VideoCallViewProps> = ({
  inCall,
  onEndCall,
  currentMode,
  activeTask,
  selectedLang,
  isSpeaking,
  messages,
  onSendMessage,
  isAiProcessing,
  onCompleteTask,
  onToggleSubtask,
  onPostponeTask,
  onCancelTask,
  onAskNextTask,
  onOpenTasksModal,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [aiMuted, setAiMuted] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Initialize webcam when entering call
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (inCall && cameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          activeStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or device missing:', err);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inCall, cameraOn]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOn;
      });
    }
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    setMicOn(!micOn);
  };

  // Get the latest message for real-time subtitle / caption
  const latestAiMessage = [...messages]
    .reverse()
    .find((m) => m.sender === 'ai');

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Video Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: AI Avatar & User Video Picture-in-Picture */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Main AI Avatar Display Card */}
          <AIAvatarCard
            isSpeaking={isSpeaking && !aiMuted}
            currentMode={currentMode}
            selectedLang={selectedLang}
            aiName="Parceiro Virtual IA"
            isMuted={aiMuted}
            onToggleMute={() => setAiMuted(!aiMuted)}
          />

          {/* Hyper-Productive Mode HUD when active task exists */}
          {activeTask && (
            <HyperProductiveHUD
              task={activeTask}
              onCompleteTask={onCompleteTask}
              onToggleSubtask={onToggleSubtask}
              onPostponeTask={onPostponeTask}
              onCancelTask={onCancelTask}
            />
          )}

          {/* Real-time Translation Subtitles & Captions Bar */}
          <div className="bg-[#0F0F0F] rounded-sm p-5 border border-white/10 shadow-xl text-[#F5F5F0]">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <Globe className="w-4 h-4 text-[#FF5F1F]" />
                <span className="uppercase tracking-widest text-[11px]">Legendas & Tradução em Tempo Real:</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#FF5F1F] border border-white/10 text-[10px] uppercase">
                  {selectedLang.flag} {selectedLang.name}
                </span>
              </div>

              {isSpeaking && (
                <span className="flex items-center gap-1.5 text-[10px] text-[#00FF41] uppercase tracking-widest font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
                  IA Falando...
                </span>
              )}
            </div>

            {latestAiMessage ? (
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-white font-serif italic">
                  {latestAiMessage.text}
                </p>
                {latestAiMessage.translation &&
                  latestAiMessage.translation !== latestAiMessage.text && (
                    <div className="p-3 rounded-sm bg-white/5 border border-white/10 text-[#FF5F1F] text-xs sm:text-sm font-medium">
                      <span className="opacity-60 text-[10px] block uppercase tracking-widest mb-1 text-white/70">
                        Tradução Instantânea ({selectedLang.name}):
                      </span>
                      {latestAiMessage.translation}
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-white/40 italic font-serif">
                Fale algo com a IA no microfone ou digite um comando abaixo para interagir...
              </p>
            )}
          </div>
        </div>

        {/* Right Column: User Video Card + Quick AI Task Prompts + Chat Feed */}
        <div className="lg:col-span-4 flex flex-col gap-4 text-[#F5F5F0]">
          {/* User Webcam Feed Card */}
          <div className="relative rounded-sm overflow-hidden bg-black border border-white/10 shadow-xl aspect-video">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0A0A] text-white/40 p-4">
                <VideoOff className="w-8 h-8 mb-2 opacity-40" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">Câmera Oculta</span>
              </div>
            )}

            {/* Webcam Bottom Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10 text-[11px] text-white">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF41]"></span>
                Você (Ao Vivo)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-1.5 rounded-sm transition-colors ${
                    micOn
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-[#FF5F1F] text-black'
                  }`}
                  title={micOn ? 'Desativar microfone' : 'Ativar microfone'}
                >
                  {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-1.5 rounded-sm transition-colors ${
                    cameraOn
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-[#FF5F1F] text-black'
                  }`}
                  title={cameraOn ? 'Desativar câmera' : 'Ativar câmera'}
                >
                  {cameraOn ? (
                    <Video className="w-3.5 h-3.5" />
                  ) : (
                    <VideoOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick AI Task Assistant Buttons */}
          <div className="bg-[#0F0F0F] rounded-sm p-4 border border-white/10 shadow-xl space-y-2">
            <div className="text-[11px] uppercase tracking-widest font-semibold text-white/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF5F1F]" />
                <span>Atalhos Rápidos IA:</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={onAskNextTask}
                className="w-full text-left px-3.5 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF5F1F] shrink-0" />
                  <span className="font-serif italic">"Qual é a próxima tarefa na minha lista?"</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider bg-[#FF5F1F]/20 text-[#FF5F1F] px-2 py-0.5 rounded-full font-bold group-hover:bg-[#FF5F1F] group-hover:text-black transition-colors">
                  Perguntar
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSendMessage(
                    'Me sugira criar uma tarefa importante para hoje e agende para mim!'
                  )
                }
                className="w-full text-left px-3.5 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00FF41] shrink-0" />
                  <span className="font-serif italic">"Sugere e cria uma tarefa para hoje!"</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/40">+ Tarefa</span>
              </button>

              <button
                type="button"
                onClick={onOpenTasksModal}
                className="w-full text-left px-3.5 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-[#FF5F1F] shrink-0" />
                  <span>Abrir agenda e toques musicais</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/40">Ver Todas</span>
              </button>
            </div>
          </div>

          {/* Interactive Chat & Command Box */}
          <div className="bg-[#0F0F0F] rounded-sm border border-white/10 shadow-xl flex flex-col h-64 sm:h-72 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/10 bg-white/5 flex items-center justify-between text-[11px] uppercase tracking-widest font-semibold text-white/80">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#FF5F1F]" />
                <span>Conversa & Comandos</span>
              </span>
              <span className="text-[9px] text-white/40 uppercase">
                Voz + Texto
              </span>
            </div>

            {/* Message Feed */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-2.5"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-sm px-3.5 py-2 text-xs sm:text-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#FF5F1F] text-black font-medium'
                        : 'bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.translation && msg.translation !== msg.text && (
                      <p className={`text-[11px] mt-1 pt-1 border-t font-medium ${
                        msg.sender === 'user' ? 'text-black/70 border-black/20' : 'text-[#FF5F1F] border-white/10'
                      }`}>
                        🌐 {msg.translation}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 px-1 mt-0.5">
                    {msg.sender === 'user' ? 'Você' : 'Parceiro IA'} •{' '}
                    {msg.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Send Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-2 border-t border-white/10 bg-[#0F0F0F] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Fale no mic ou digite um comando..."
                className="flex-1 px-3.5 py-2 rounded-sm bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF5F1F]"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isAiProcessing}
                className="p-2.5 rounded-sm bg-[#FF5F1F] hover:bg-[#ff723b] text-black font-bold transition-all disabled:opacity-30"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Floating Bar with Call Controls */}
      <div className="bg-[#0F0F0F] border border-white/10 rounded-sm px-5 py-3 shadow-2xl flex items-center justify-between gap-3 flex-wrap text-[#F5F5F0]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMic}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-bold transition-all ${
              micOn
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                : 'bg-[#FF5F1F] text-black'
            }`}
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{micOn ? 'Microfone Ativo' : 'Mic Mudo'}</span>
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-bold transition-all ${
              cameraOn
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                : 'bg-[#FF5F1F] text-black'
            }`}
          >
            {cameraOn ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
            <span>{cameraOn ? 'Câmera Ativa' : 'Câmera Oculta'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTasksModal}
            className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#00FF41]" />
            <span>Ver Agenda & Toques</span>
          </button>

          <button
            type="button"
            onClick={onEndCall}
            className="flex items-center gap-2 px-5 py-2 rounded-sm text-xs uppercase tracking-widest font-bold bg-[#FF5F1F] hover:bg-[#ff723b] text-black transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Desligar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
