/**
 * PROTOCOLO PRIMEIRA VAGA: A Jornada do Aprendiz
 * SoundEngine.js - Sintetizador Chiptune 16-bit com Web Audio API
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this.isPlayingBgm = false;
    this.bgmInterval = null;
    this.tempo = 135;
    this.step = 0;
  }

  init() {
    if (this.ctx) return;
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API não suportada neste navegador.');
      return;
    }
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime((this.bgmVolume ?? 0.65) * 0.6, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume ?? 0.85, this.ctx.currentTime);

    this.bgmGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume * 0.6, this.ctx.currentTime);
    }
  }

  // --- SÍNTESE DE NOTAS RETRÔ ---
  playTone(freq, type = 'square', duration = 0.1, startTime = null, gainVal = 0.2) {
    if (this.isMuted || !this.ctx) return;
    const time = startTime || this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  playNoise(duration = 0.1, startTime = null, gainVal = 0.15) {
    if (this.isMuted || !this.ctx) return;
    const time = startTime || this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  // --- SOUND EFFECTS (SFX) ---
  playJump() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playSwordSlash() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Fast frequency sweep down + white noise swoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);

    this.playNoise(0.08, now, 0.1);
  }

  playDash() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
    this.playNoise(0.12, now, 0.15);
  }

  playHit() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
    this.playNoise(0.09, now, 0.25);
  }

  playEnemyDeath() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);
    this.playNoise(0.2, now, 0.2);
  }

  playMentorTeleport() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Mystical golden chime arpeggio
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.15, now + idx * 0.04, 0.2);
    });
  }

  playTypewriterBeep() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    // Subtle quick beep for dialog characters
    const rndFreq = 420 + Math.random() * 80;
    this.playTone(rndFreq, 'square', 0.03, this.ctx.currentTime, 0.08);
  }

  playItemCollect() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    this.playTone(587.33, 'square', 0.08, now, 0.2);
    this.playTone(880.00, 'square', 0.15, now + 0.07, 0.25);
  }

  playLevelUp() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((f, i) => {
      this.playTone(f, 'square', 0.12, now + i * 0.08, 0.25);
    });
  }

  playVictory() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    this.stopBgm();
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, { f: 523.25, d: 0.15 }, { f: 523.25, d: 0.15 },
      { f: 523.25, d: 0.35 }, { f: 415.30, d: 0.35 }, { f: 466.16, d: 0.35 },
      { f: 523.25, d: 0.4 },  { f: 659.25, d: 0.6 }
    ];
    let offset = 0;
    melody.forEach(n => {
      this.playTone(n.f, 'triangle', n.d, now + offset, 0.3);
      this.playTone(n.f * 0.5, 'square', n.d, now + offset, 0.2);
      offset += n.d * 0.85;
    });
  }

  playGameOver() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    this.stopBgm();
    const now = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.23, 329.63, 293.66, 261.63];
    notes.forEach((f, i) => {
      this.playTone(f, 'sawtooth', 0.25, now + i * 0.18, 0.22);
    });
  }

  // --- BACKGROUND MUSIC SYNTHESIZER ---
  startBgm(trackName = 'stage') {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.currentTrack === trackName && this.isPlayingBgm) return;

    this.stopBgm();
    this.currentTrack = trackName;
    this.isPlayingBgm = true;
    this.step = 0;

    const tickMs = trackName === 'boss' ? 120 : 140;

    this.bgmInterval = setInterval(() => {
      if (!this.isPlayingBgm || this.isMuted || !this.ctx) return;
      if (this.currentTrack === 'boss') {
        this.stepBossTheme();
      } else {
        this.stepStageTheme();
      }
      this.step = (this.step + 1) % 32;
    }, tickMs);
  }

  stopBgm() {
    this.isPlayingBgm = false;
    this.currentTrack = null;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // Melodia alegre e heróica de aventura 16-bit
  stepStageTheme() {
    const bassline = [
      130.81, 0, 130.81, 164.81, 196.00, 0, 196.00, 164.81, // C Major
      110.00, 0, 110.00, 130.81, 164.81, 0, 164.81, 130.81, // A Minor
      87.31, 0, 87.31, 110.00, 130.81, 0, 130.81, 110.00,   // F Major
      98.00, 0, 123.47, 146.83, 196.00, 146.83, 123.47, 98.00 // G Major
    ];

    const leadMelody = [
      523.25, 0, 659.25, 783.99, 1046.5, 0, 783.99, 659.25,
      440.00, 523.25, 659.25, 0, 523.25, 440.00, 0, 392.00,
      349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 392.00, 349.23,
      392.00, 493.88, 587.33, 783.99, 880.00, 783.99, 587.33, 0
    ];

    const bass = bassline[this.step];
    if (bass) {
      this.playTone(bass, 'triangle', 0.14, this.ctx.currentTime, 0.22);
    }

    const lead = leadMelody[this.step];
    if (lead) {
      this.playTone(lead, 'square', 0.11, this.ctx.currentTime, 0.12);
    }

    // Hi-hat / Snare
    if (this.step % 4 === 2) {
      this.playNoise(0.06, this.ctx.currentTime, 0.08); // Snare
    } else if (this.step % 2 === 0) {
      this.playNoise(0.02, this.ctx.currentTime, 0.03); // Closed Hat
    }
  }

  // Tema tenso, rápido e ameaçador para o Boss ATS-9000
  stepBossTheme() {
    const bassline = [
      73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 87.31, 110.00, // D minor drive
      73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 110.00, 130.81,
      65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 77.78, 98.00,  // C# / intense
      73.42, 87.31, 110.00, 130.81, 146.83, 130.81, 110.00, 87.31
    ];

    const leadMelody = [
      293.66, 0, 349.23, 0, 440.00, 349.23, 293.66, 0,
      587.33, 0, 523.25, 440.00, 415.30, 440.00, 523.25, 0,
      440.00, 0, 392.00, 0, 349.23, 311.13, 293.66, 0,
      293.66, 349.23, 440.00, 587.33, 622.25, 587.33, 440.00, 349.23
    ];

    const bass = bassline[this.step];
    if (bass) {
      this.playTone(bass, 'sawtooth', 0.11, this.ctx.currentTime, 0.25);
    }

    const lead = leadMelody[this.step];
    if (lead) {
      this.playTone(lead, 'square', 0.09, this.ctx.currentTime, 0.16);
    }

    // Heavy Industrial Drums
    if (this.step % 4 === 0) {
      // Kick
      this.playTone(90, 'triangle', 0.08, this.ctx.currentTime, 0.35);
    }
    if (this.step % 4 === 2) {
      // Snare
      this.playNoise(0.08, this.ctx.currentTime, 0.16);
    }
  }
}
