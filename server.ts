import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

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

// API endpoint to chat with AI and handle task commands & live translation
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      tasks = [],
      activeTaskId = null,
      targetLang = null,
      userCurrentTime = new Date().toLocaleString('pt-BR'),
      mode = 'normal',
    } = req.body;

    const ai = getAiClient();
    if (!ai) {
      // Graceful fallback response if API key is missing in dev environment
      return res.json({
        replyText:
          'Olá! Estou funcionando no modo interativo offline agora. Para minha inteligência completa do Gemini, configure a chave GEMINI_API_KEY em Settings > Secrets!',
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
   - Pode perguntar ao usuário se ele quer que você CRIE alguma tarefa, acesse as tarefas existentes ou se quer fazer a PRÓXIMA TAREFA que está salva na lista!
   - Se o usuário pedir para agendar/criar uma tarefa no dia X horário Y, crie a tarefa com precisão!

2) MODO HIPERPRODUTIVO (Ativado quando uma tarefa está com status EM_CURSO / EM_AÇÃO):
   - Fique EXTREMAMENTE FOCADA, EFICIENTE e ZERO DISTRAÇÕES!
   - Seja ultra produtiva, auxiliando o usuário a cumprir a tarefa com atenção máxima sem distração.
   - Seja rápida em passar informações com clareza.
   - CORRIGA ou ALERTE o usuário se ele estiver enrolando ou demorando, para ser mais rápido e conseguir cumprir a tarefa a tempo!
   - Exemplo: "Foco total agora! Temos apenas mais alguns minutos para fechar isso. Qual é a próxima subtarefa?"

TRADUÇÃO EM TEMPO REAL:
${targetLang ? `- O usuário ativou a tradução em tempo real para o idioma código: "${targetLang}". Inclua no campo "translation" a tradução fiel da sua resposta ("replyText") no idioma ${targetLang}.` : '- Se targetLang não foi especificado, deixe "translation" nulo.'}

REGRAS DO RETORNO JSON:
Você DEVE responder ESTRITAMENTE num objeto JSON com a seguinte estrutura:
{
  "replyText": "Sua fala de resposta direta, fluida e carismática para o usuário",
  "translation": "Sua resposta traduzida para o idioma targetLang, ou null se não aplicável",
  "voiceStyle": "cheerful_funny" | "urgent_focus" | "calm_zen" | "cyber_cool",
  "mode": "${mode}",
  "taskActions": [
    // Lista opcional de ações para modificar tarefas na agenda
    // type pode ser: "create", "update_status", "edit", "delete", "ask_next", "alert_task", "suggest_list"
  ]
}

EXEMPLOS DE taskActions:
- Para CRIAR uma tarefa quando o usuário pede "Cria uma tarefa de treinar inglês hoje às 19:30 por 30 minutos, toque alarme sci-fi":
  {
    "type": "create",
    "task": {
      "id": "gerar-um-id-unico",
      "name": "Treinar inglês",
      "estimatedTime": 30,
      "startDate": "2026-07-31",
      "startTime": "19:30",
      "endDate": "2026-07-31",
      "endTime": "20:00",
      "ringtone": "sci_fi",
      "completedCount": 0,
      "status": "PENDENTE",
      "subtasks": [
        { "id": "1", "title": "Praticar conversação", "completed": false },
        { "id": "2", "title": "Revisar vocabulário", "completed": false }
      ],
      "progress": 0,
      "notes": "Criada por comando de voz com IA"
    }
  }
- Para ALTERAR STATUS (ex: para EM_CURSO, CONCLUIDO, ADIADA, CANCELADO, etc.):
  {
    "type": "update_status",
    "taskId": "id-da-tarefa",
    "newStatus": "EM_CURSO",
    "message": "Ativando Modo Hiperprodutivo agora!"
  }
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
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
    const mode = req.body?.mode || 'normal';
    return res.json({
      replyText: `Desculpe, tive um problema ao consultar o Gemini (${err?.message || 'Erro de API'}). Verifique a chave GEMINI_API_KEY nas variáveis da Vercel!`,
      voiceStyle: mode === 'hyper_productive' ? 'urgent_focus' : 'cheerful_funny',
      mode,
      taskActions: [],
    });
  }
});

// API endpoint for Live Translation of text
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang = 'en-US', sourceLang = 'pt-BR' } = req.body;
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
    const targetLang = req.body?.targetLang || 'en-US';
    const text = req.body?.text || '';
    return res.json({ translation: `[Traduzido (${targetLang})]: ${text}` });
  }
});

// API endpoint for Text-to-Speech using Gemini TTS preview
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      // Let client fall back to browser SpeechSynthesis
      return res.json({ fallbackToWebSpeech: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say with natural expression and energy: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({ audio: base64Audio, format: 'pcm_24000' });
    } else {
      return res.json({ fallbackToWebSpeech: true });
    }
  } catch (err: any) {
    console.error('Error in /api/tts:', err);
    // Let client fall back seamlessly without breaking app
    return res.json({ fallbackToWebSpeech: true, error: err?.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware in development or serve static files in production
if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== 'production') {
    import('vite').then(async (viteModule) => {
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Development Server running on http://0.0.0.0:${PORT}`);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Production Server running on port ${PORT}`);
    });
  }
}

export default app;

