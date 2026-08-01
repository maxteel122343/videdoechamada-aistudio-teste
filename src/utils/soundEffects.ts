import { RingtoneType } from '../types';

class SoundEffectsManager {
  private audioCtx: AudioContext | null = null;
  private currentRingtoneInterval: any = null;
  private isRinging: boolean = false;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play one-shot preview or start looping ringtone
  public playRingtone(type: RingtoneType, loop: boolean = false): void {
    this.stopRingtone();
    this.isRinging = true;

    const playOnce = () => {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      switch (type) {
        case 'sci_fi': {
          // Cyberpunk pulsing chord
          const freqs = [440, 554.37, 659.25, 880]; // A major 7th cyber chord
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(
              freq * 1.5,
              now + 0.35
            );

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + 0.6);
          });
          break;
        }

        case 'epic_synth': {
          // Epic arpeggio
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);

            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.45);
          });
          break;
        }

        case 'high_energy': {
          // Energetic electro bounce
          for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(
              i % 2 === 0 ? 587.33 : 880,
              now + i * 0.1
            );

            gain.gain.setValueAtTime(0.08, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              now + (i + 1) * 0.1
            );

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + (i + 1) * 0.1);
          }
          break;
        }

        case 'funny_horn': {
          // Comedic bouncy trumpet horn
          const notes = [329.63, 392.0, 523.25, 392.0, 523.25]; // E G C G C!
          const times = [0, 0.12, 0.24, 0.36, 0.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + times[idx]);

            gain.gain.setValueAtTime(0.1, now + times[idx]);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              now + times[idx] + 0.15
            );

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + times[idx]);
            osc.stop(now + times[idx] + 0.18);
          });
          break;
        }

        case 'zen_bell': {
          // Calm meditative singing bowl
          const freqs = [432, 864, 1296]; // 432Hz harmonic
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            const initialGain = idx === 0 ? 0.15 : 0.05;
            gain.gain.setValueAtTime(initialGain, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.9);
          });
          break;
        }

        case 'urgent_alert':
        default: {
          // Urgent two-tone alert
          for (let i = 0; i < 2; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(i === 0 ? 880 : 659.25, now + i * 0.18);

            gain.gain.setValueAtTime(0.12, now + i * 0.18);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              now + (i + 1) * 0.18
            );

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.18);
            osc.stop(now + (i + 1) * 0.18);
          }
          break;
        }
      }
    };

    playOnce();

    if (loop) {
      const intervalMs =
        type === 'zen_bell' ? 2200 : type === 'urgent_alert' ? 800 : 1200;
      this.currentRingtoneInterval = setInterval(() => {
        if (this.isRinging) {
          playOnce();
        } else {
          this.stopRingtone();
        }
      }, intervalMs);
    }
  }

  public stopRingtone(): void {
    this.isRinging = false;
    if (this.currentRingtoneInterval) {
      clearInterval(this.currentRingtoneInterval);
      this.currentRingtoneInterval = null;
    }
  }

  // Power-up sound when entering Hyper-Productive mode!
  public playHyperModePowerUp(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Victory celebration sound when task is completed!
  public playTaskCompletedSound(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C High
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.15, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
    });
  }
}

export const soundEffects = new SoundEffectsManager();
