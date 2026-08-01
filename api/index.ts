import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client safely
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const chatHandler = async (req: express.Request, res: express.Response) => {
  try {
    const {
      message,
      tasks = [],
      activeTaskId = null,
      targetLang = null,
      userCurrentTime = new Date().toLocaleString('pt-BR'),
      mode = 'normal',
    } = req.body || {};

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        replyText:
          'Olá! Estou funcionando no modo interativo offline agora. Para minha inteligência completa do Gemini, configure a chave GEMINI_API_KEY nas variáveis de ambiente da Vercel!',
        voiceStyle: mode === 'hyper_productive' ? 'urgent_focus' : 'cheerful_funny',
        mode,
        taskActions: [],
      });
    }

    const activeTask = tasks.find((t: any) => t.id === activeTaskId);

    const systemInstruction = `
Você é a "Parceiro Virtual AI", uma IA de chamada de vídeo MODERNA, ENGRAÇADA, EXTREMAMENTE INTELIGENTE e PRÁTICA.
Você conversa por vídeo/voz com o usuário, auxilia em suas tarefas e oferece tradução em tempo real se solicitado.

DADOS ATUAIS DO SISTEMA:
- Hora/Data atual do Usuário: ${userCurrentTime}
- Modo atual: ${mode === 'hyper_productive' ? 'HIPERPRODUTIVO / HIPER EFICIENTE (O usuário tem uma tarefa em curso agora!)' : 'NORMAL (Amigável, engraçado, esperto)'}
- Tarefas agendadas na agenda do usuário: ${JSON.stringify(tasks.map((t: any) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      startTime: t.startTime,
      estimatedTime: t.estimatedTime,
      status: t.status,
      ringtone: t.ringtone
    })))}
${activeTask ? `- TAREFA ATUAL EM AÇÃO / EM CURSO: "${activeTask.name}" (Tempo estimado: ${activeTask.estimatedTime} min, Progresso: ${activeTask.progress}%, Subtarefas: ${JSON.stringify(activeTask.subtasks)})` : ''}

COMPORTAMENTO POR MODO:
1) MODO NORMAL:
   - Voz moderna, carismática, com tiradas engraçadas, perspicaz e super rápida.
   - Responda em Português (ou no idioma em que o usuário falar), de forma enxuta e natural para conversa em chamada de vídeo (máximo de 2 a 4 frases).

2) MODO HIPERPRODUTIVO:
   - Fique EXTREMAMENTE FOCADA, EFICIENTE e ZERO DISTRAÇÕES!

REGRAS DO RETORNO JSON:
Você DEVE responder ESTRITAMENTE num objeto JSON com a seguinte estrutura:
{
  "replyText": "Sua fala de resposta direta, fluida e carismática para o usuário",
  "translation": "Sua resposta traduzida para o idioma targetLang, ou null se não aplicável",
  "voiceStyle": "cheerful_funny" | "urgent_focus" | "calm_zen" | "cyber_cool",
  "mode": "${mode}",
  "taskActions": []
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message || 'Olá',
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: mode === 'hyper_productive' ? 0.3 : 0.8,
      },
    });

    const text = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = {
        replyText: text,
        voiceStyle: 'cheerful_funny',
        mode,
        taskActions: [],
      };
    }

    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.json({
      replyText: `Desculpe, tive um problema ao consultar o Gemini (${err?.message || 'Erro de API'}). Verifique a chave GEMINI_API_KEY nas variáveis da Vercel!`,
      voiceStyle: 'cheerful_funny',
      mode: 'normal',
      taskActions: [],
    });
  }
};

const translateHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { text, targetLang = 'en-US' } = req.body || {};
    if (!text) {
      return res.json({ translation: '' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({ translation: `[Traduzido (${targetLang})]: ${text}` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text accurately and naturally into language code "${targetLang}". Return only the translated text without commentary:\n\n${text}`,
      config: {
        temperature: 0.2,
      },
    });

    return res.json({
      translation: response.text ? response.text.trim() : text,
    });
  } catch (err: any) {
    console.error('Error in /api/translate:', err);
    return res.json({ translation: text });
  }
};

const ttsHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { text } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    return res.json({ fallbackToWebSpeech: true });
  } catch (err: any) {
    return res.json({ fallbackToWebSpeech: true });
  }
};

// Route handlers for both /api/* and /* paths for 100% Vercel compatibility
app.post('/api/chat', chatHandler);
app.post('/chat', chatHandler);
app.post('/api/translate', translateHandler);
app.post('/translate', translateHandler);
app.post('/api/tts', ttsHandler);
app.post('/tts', ttsHandler);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
