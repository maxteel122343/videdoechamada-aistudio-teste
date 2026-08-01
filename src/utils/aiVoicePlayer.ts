class AIVoicePlayer {
  private isSpeaking: boolean = false;
  private audioCtx: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private currentSpeechUtterance: SpeechSynthesisUtterance | null = null;

  public stopSpeaking(): void {
    this.isSpeaking = false;
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {}
      this.activeSource = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public async speak(
    text: string,
    mode: 'normal' | 'hyper_productive' = 'normal',
    targetLangCode?: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();
    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    if (onStart) onStart();

    // Determine voice rate and pitch based on mode
    const rate = mode === 'hyper_productive' ? 1.25 : 1.05;
    const pitch = mode === 'hyper_productive' ? 1.15 : 1.1;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: mode === 'hyper_productive' ? 'Fenrir' : 'Zephyr',
        }),
      });

      const data = await response.json();

      if (data.audio && !data.fallbackToWebSpeech) {
        // Decode base64 PCM 24kHz audio and play
        await this.playBase64PCM(data.audio, onEnd);
        return;
      }
    } catch (err) {
      console.warn('Backend TTS unreachable, falling back to Web Speech:', err);
    }

    // Fallback to Web Speech API
    this.speakWithWebSpeech(text, rate, pitch, targetLangCode || 'pt-BR', onEnd);
  }

  private async playBase64PCM(
    base64: string,
    onEnd?: () => void
  ): Promise<void> {
    try {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const binaryStr = atob(base64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Convert 16-bit PCM little endian to Float32Array
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = this.audioCtx.createBuffer(
        1,
        float32Array.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);
      this.activeSource = source;

      source.onended = () => {
        this.isSpeaking = false;
        this.activeSource = null;
        if (onEnd) onEnd();
      };

      source.start();
    } catch (err) {
      console.warn('Error decoding PCM, fallback to Web Speech:', err);
      this.speakWithWebSpeech(
        'Aviso do assistente: ' + err,
        1.1,
        1.1,
        'pt-BR',
        onEnd
      );
    }
  }

  private speakWithWebSpeech(
    text: string,
    rate: number,
    pitch: number,
    lang: string,
    onEnd?: () => void
  ): void {
    if (!('speechSynthesis' in window)) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voices = window.speechSynthesis.getVoices();
    const targetVoice =
      voices.find(
        (v) =>
          v.lang.toLowerCase().includes(lang.toLowerCase()) &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Luciana') ||
            v.name.includes('Francisca'))
      ) ||
      voices.find((v) => v.lang.toLowerCase().includes(lang.toLowerCase())) ||
      voices[0];

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }
}

export const aiVoicePlayer = new AIVoicePlayer();
