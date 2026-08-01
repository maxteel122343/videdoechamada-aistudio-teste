import { GoogleGenAI } from '@google/genai';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text = '', targetLang = 'en-US' } = req.body || {};
    if (!text) {
      return res.status(200).json({ translation: '' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(200).json({ translation: `[Traduzido (${targetLang})]: ${text}` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following text accurately and naturally into language code "${targetLang}". Return only the translated text without commentary:\n\n${text}`,
      config: {
        temperature: 0.2,
      },
    });

    return res.status(200).json({
      translation: response.text ? response.text.trim() : text,
    });
  } catch (err: any) {
    console.error('Error in api/translate handler:', err);
    return res.status(200).json({ translation: req.body?.text || '' });
  }
}
