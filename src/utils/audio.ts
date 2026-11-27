/**
 * Audio Synthesizer & Player for PaisaMeter
 * Generates realistic coin clinks, coin tosses, and alert sounds via Web Audio API.
 */

import { COIN_FLIP_SPIN_AUDIO_DATA_URI } from './coinAudioBase64';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private audioEl: HTMLAudioElement | null = null;

  constructor() {
    // Lazy initialization
  }

  private getAudioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioEl) {
      try {
        this.audioEl = new Audio(COIN_FLIP_SPIN_AUDIO_DATA_URI);
        this.audioEl.preload = 'auto';
      } catch (e) {
        console.warn('HTMLAudio init error', e);
      }
    }
    return this.audioEl;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Sound played when adding an expense amount (coin.mp3 equivalent)
   * A resonant metallic double-clink of high-purity rupee coins
   */
  public playCoinSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primary metallic ping 1 (high bell strike)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2600, now);
      osc1.frequency.exponentialRampToValueAtTime(1900, now + 0.18);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Secondary coin bounce ping
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(3400, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(2700, now + 0.25);
      gain2.gain.setValueAtTime(0.25, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.4);

      // Metallic shimmer harmonic
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(5200, now + 0.015);
      gain3.gain.setValueAtTime(0.15, now + 0.015);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.015);
      osc3.stop(now + 0.45);

      // Third jingle bounce
      const osc4 = ctx.createOscillator();
      const gain4 = ctx.createGain();
      osc4.type = 'sine';
      osc4.frequency.setValueAtTime(3800, now + 0.09);
      osc4.frequency.exponentialRampToValueAtTime(3100, now + 0.28);
      gain4.gain.setValueAtTime(0.18, now + 0.09);
      gain4.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc4.connect(gain4);
      gain4.connect(ctx.destination);
      osc4.start(now + 0.09);
      osc4.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  /**
   * Sound played when flipping/spinning the coin (exact spinning coin rattle on table effect)
   * Plays the authentic recorded/synthesized coin spin & rattle audio clip with Web Audio fallback:
   * 1. Initial spin snap & flick
   * 2. Accelerating Euler wobble / precession vibration with metallic ringing
   * 3. High harmonic shimmer & table contact friction
   * 4. Final rapid settling clatter & resting flat tap
   */
  public playCoinSpinningRattleSound() {
    if (!this.soundEnabled) return;

    // 1. Try instant HTML5 Audio playback of high-definition WAV audio
    try {
      const audio = this.getAudioElement();
      if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn('HTML5 audio play blocked/error, using Web Audio API synthesis', e);
            this.playCoinSpinningRattleWebAudioFallback();
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Audio element error, falling back', err);
    }

    // 2. Fallback to Web Audio synthesis
    this.playCoinSpinningRattleWebAudioFallback();
  }

  public playCoinSpinningRattleWebAudioFallback() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const totalDuration = 3.2;

      // 1. Initial Spin Flick / Snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(3200, now);
      snapOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      snapGain.gain.setValueAtTime(0.35, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.1);

      // High overtone ping for initial snap
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(5400, now);
      pingOsc.frequency.exponentialRampToValueAtTime(3800, now + 0.15);
      pingGain.gain.setValueAtTime(0.2, now);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      pingOsc.connect(pingGain);
      pingGain.connect(ctx.destination);
      pingOsc.start(now);
      pingOsc.stop(now + 0.25);

      // 2. Metallic Coin Body Resonance (Continuous ring throughout spin)
      const metalRes1 = ctx.createOscillator();
      const metalGain1 = ctx.createGain();
      metalRes1.type = 'sine';
      metalRes1.frequency.setValueAtTime(2850, now);
      metalRes1.frequency.linearRampToValueAtTime(2900, now + totalDuration);
      metalGain1.gain.setValueAtTime(0.08, now);
      metalGain1.gain.linearRampToValueAtTime(0.12, now + 2.0);
      metalGain1.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

      const metalRes2 = ctx.createOscillator();
      const metalGain2 = ctx.createGain();
      metalRes2.type = 'sine';
      metalRes2.frequency.setValueAtTime(4200, now);
      metalRes2.frequency.linearRampToValueAtTime(4350, now + totalDuration);
      metalGain2.gain.setValueAtTime(0.06, now);
      metalGain2.gain.linearRampToValueAtTime(0.09, now + 2.2);
      metalGain2.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

      // 3. Accelerating Precession Wobble (LFO modulating amplitude from 15Hz up to 90Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(14, now);
      lfo.frequency.exponentialRampToValueAtTime(85, now + 2.8);
      lfo.frequency.linearRampToValueAtTime(120, now + totalDuration);

      lfoGain.gain.setValueAtTime(0.07, now);
      lfoGain.gain.linearRampToValueAtTime(0.1, now + 2.5);

      metalRes1.connect(metalGain1);
      metalRes2.connect(metalGain2);
      metalGain1.connect(ctx.destination);
      metalGain2.connect(ctx.destination);

      metalRes1.start(now + 0.05);
      metalRes1.stop(now + totalDuration);
      metalRes2.start(now + 0.05);
      metalRes2.stop(now + totalDuration);

      // 4. Discrete Precession Wobble Surface Taps
      let currentTime = now + 0.06;
      let interval = 0.075;
      const decayFactor = 0.965;

      while (currentTime < now + 2.9) {
        const tapOsc = ctx.createOscillator();
        const tapGain = ctx.createGain();
        const tapFilter = ctx.createBiquadFilter();

        tapFilter.type = 'bandpass';
        tapFilter.frequency.setValueAtTime(2400 + Math.random() * 800, currentTime);
        tapFilter.Q.setValueAtTime(4.0, currentTime);

        tapOsc.type = 'triangle';
        tapOsc.frequency.setValueAtTime(1800 + Math.random() * 600, currentTime);

        const tapVol = Math.min(0.22, 0.09 + (currentTime - now) * 0.045);
        tapGain.gain.setValueAtTime(tapVol, currentTime);
        tapGain.gain.exponentialRampToValueAtTime(0.001, currentTime + Math.min(interval * 0.7, 0.035));

        tapOsc.connect(tapFilter);
        tapFilter.connect(tapGain);
        tapGain.connect(ctx.destination);

        tapOsc.start(currentTime);
        tapOsc.stop(currentTime + Math.min(interval * 0.7, 0.035));

        interval = Math.max(0.009, interval * decayFactor);
        currentTime += interval;
      }

      // 5. Final Rapid Settling Flutter (2.9s - 3.2s)
      const settleTime = now + 2.9;
      const settleOsc = ctx.createOscillator();
      const settleGain = ctx.createGain();
      settleOsc.type = 'sawtooth';
      settleOsc.frequency.setValueAtTime(2200, settleTime);
      settleOsc.frequency.exponentialRampToValueAtTime(800, settleTime + 0.28);
      settleGain.gain.setValueAtTime(0.18, settleTime);
      settleGain.gain.exponentialRampToValueAtTime(0.001, settleTime + 0.28);
      settleOsc.connect(settleGain);
      settleGain.connect(ctx.destination);
      settleOsc.start(settleTime);
      settleOsc.stop(settleTime + 0.28);

      // Final resting flat clack at 3.12s
      const clackTime = now + 3.12;
      const clackOsc = ctx.createOscillator();
      const clackGain = ctx.createGain();
      clackOsc.type = 'sine';
      clackOsc.frequency.setValueAtTime(1400, clackTime);
      clackOsc.frequency.exponentialRampToValueAtTime(400, clackTime + 0.08);
      clackGain.gain.setValueAtTime(0.25, clackTime);
      clackGain.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.08);
      clackOsc.connect(clackGain);
      clackGain.connect(ctx.destination);
      clackOsc.start(clackTime);
      clackOsc.stop(clackTime + 0.08);

    } catch (e) {
      console.warn('Audio spin rattle error', e);
    }
  }

  /**
   * Sound played when clicking/flipping the coin
   */
  public playCoinTossSound() {
    this.playCoinSpinningRattleSound();
  }

  public playCoinTossFearHungerSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 1.4;

      // 1. Upward Coin Toss Whoosh
      const oscWhoosh = ctx.createOscillator();
      const gainWhoosh = ctx.createGain();
      oscWhoosh.type = 'sine';
      oscWhoosh.frequency.setValueAtTime(350, now);
      oscWhoosh.frequency.exponentialRampToValueAtTime(1600, now + 0.3);
      oscWhoosh.frequency.exponentialRampToValueAtTime(900, now + 0.6);
      gainWhoosh.gain.setValueAtTime(0.18, now);
      gainWhoosh.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      oscWhoosh.connect(gainWhoosh);
      gainWhoosh.connect(ctx.destination);
      oscWhoosh.start(now);
      oscWhoosh.stop(now + 0.6);

      // 2. Comedic "Waaahh!" Fear / Hunger Vocal Formant Scream (Boy holding the rupee arch)
      const screamOsc = ctx.createOscillator();
      const screamGain = ctx.createGain();
      const screamFilter = ctx.createBiquadFilter();

      screamFilter.type = 'bandpass';
      screamFilter.Q.setValueAtTime(3.5, now);
      screamFilter.frequency.setValueAtTime(750, now + 0.08);
      screamFilter.frequency.linearRampToValueAtTime(1450, now + 0.4);
      screamFilter.frequency.exponentialRampToValueAtTime(650, now + 0.95);

      screamOsc.type = 'sawtooth';
      screamOsc.frequency.setValueAtTime(420, now + 0.08);
      screamOsc.frequency.linearRampToValueAtTime(780, now + 0.35); // ascending panic
      screamOsc.frequency.setValueAtTime(760, now + 0.45);
      screamOsc.frequency.exponentialRampToValueAtTime(320, now + 0.95); // falling fear

      screamGain.gain.setValueAtTime(0.001, now);
      screamGain.gain.linearRampToValueAtTime(0.22, now + 0.15);
      screamGain.gain.setValueAtTime(0.22, now + 0.5);
      screamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      // Add fast comedic vibrato to scream
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(11, now); // 11Hz fear tremble
      lfoGain.gain.setValueAtTime(25, now);
      lfo.connect(screamOsc.frequency);
      lfo.start(now + 0.08);
      lfo.stop(now + 0.95);

      screamOsc.connect(screamFilter);
      screamFilter.connect(screamGain);
      screamGain.connect(ctx.destination);

      screamOsc.start(now + 0.08);
      screamOsc.stop(now + 0.95);

      // 3. Rapid Metallic Coin Spin Flutters in the air
      for (let i = 0; i < 9; i++) {
        const tickTime = now + 0.15 + i * 0.09;
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = 'triangle';
        tickOsc.frequency.setValueAtTime(2800 + (i % 3) * 350, tickTime);
        tickGain.gain.setValueAtTime(0.12, tickTime);
        tickGain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.05);

        tickOsc.connect(tickGain);
        tickGain.connect(ctx.destination);
        tickOsc.start(tickTime);
        tickOsc.stop(tickTime + 0.05);
      }

      // 4. Coin Landing & Settling Clink at t = 0.9s
      setTimeout(() => {
        this.playCoinSound();
      }, 850);
    } catch (e) {
      console.warn('Audio toss error', e);
    }
  }

  /**
   * Success Chime for Logins, Signups, and Budget Achievements
   */
  public playBudgetSuccessChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn('Audio success error', e);
    }
  }

  /**
   * Error / Buzz sound for failed validation or incorrect login credentials
   */
  public playErrorBuzz() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.warn('Audio error buzz error', e);
    }
  }

  /**
   * Alert tone for budget warning / danger
   */
  public playAlertSound(type: 'warning' | 'danger') {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'danger' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'danger' ? 440 : 587.33, now);
      osc.frequency.setValueAtTime(type === 'danger' ? 330 : 523.25, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio alert error', e);
    }
  }
}

export const soundEngine = new SoundEngine();
