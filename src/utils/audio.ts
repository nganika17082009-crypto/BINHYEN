// Web Audio API synthesizer for ambient soundscapes and tactile SFX (zero external audio files needed)

export type AmbientPreset = 'rain' | 'ocean';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

class AmbientSoundEngine {
  private source: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentPreset: AmbientPreset = 'rain';
  private currentVolume = 0.55;

  public start(preset: AmbientPreset, volume: number): void {
    this.stop();
    const ctx = getAudioContext();

    const bufferSize = 3 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // Paul Kellet's refined pink noise algorithm for warm rain/ocean texture
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const masterGain = ctx.createGain();
    const targetGain = Math.max(0, Math.min(1, volume)) * 0.55;
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), ctx.currentTime + 0.6);

    if (preset === 'ocean') {
      filter.frequency.setValueAtTime(520, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.11, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      this.lfo = lfo;
      this.lfoGain = lfoGain;
    } else {
      filter.frequency.setValueAtTime(1650, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
    }

    source.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    source.start(0);

    this.source = source;
    this.filter = filter;
    this.masterGain = masterGain;
    this.currentPreset = preset;
    this.currentVolume = volume;
    this.isPlaying = true;
  }

  public setVolume(volume: number): void {
    this.currentVolume = volume;
    if (this.masterGain && audioCtx) {
      const target = Math.max(0.001, Math.min(1, volume) * 0.55);
      this.masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.08);
    }
  }

  public stop(): void {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch {
        // Ignore already stopped source
      }
      this.source = null;
    }
    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch {
        // Ignore already stopped LFO
      }
      this.lfo = null;
    }
    if (this.lfoGain) {
      this.lfoGain.disconnect();
      this.lfoGain = null;
    }
    if (this.filter) {
      this.filter.disconnect();
      this.filter = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    this.isPlaying = false;
  }

  public getState(): { isPlaying: boolean; preset: AmbientPreset; volume: number } {
    return {
      isPlaying: this.isPlaying,
      preset: this.currentPreset,
      volume: this.currentVolume,
    };
  }
}

export const ambientEngine = new AmbientSoundEngine();

export function playBreathChime(phase: 'inhale' | 'hold' | 'exhale'): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const freqMap = {
    inhale: 432,
    hold: 528,
    exhale: 396,
  };

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqMap[phase], now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.15);
}

export function playCrumpleSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = 0.68;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / ctx.sampleRate;
    const envelope =
      Math.exp(-t / 0.24) *
      (0.55 + 0.45 * Math.abs(Math.sin(t * 42)));
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1250, now);
  filter.Q.setValueAtTime(1.1, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.75, now);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
}

export function playSwitchClick(isOn: boolean): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isOn ? 620 : 420, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.055);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

export function playCapPop(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(920, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.11);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.13);
}

export function playBubblePop(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const startFreq = 490 + Math.random() * 220;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(65, now + 0.065);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.075);
}

export function playTrashLandSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Soft low thud as the paper ball hits the bottom of the bin
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(145, now);
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.14);

  gain.gain.setValueAtTime(0.32, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.17);

  // Subtle lid clack right after landing
  const lidOsc = ctx.createOscillator();
  const lidGain = ctx.createGain();
  lidOsc.type = 'sine';
  lidOsc.frequency.setValueAtTime(340, now + 0.14);
  lidOsc.frequency.exponentialRampToValueAtTime(110, now + 0.21);

  lidGain.gain.setValueAtTime(0.001, now);
  lidGain.gain.setValueAtTime(0.18, now + 0.14);
  lidGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  lidOsc.connect(lidGain);
  lidGain.connect(ctx.destination);
  lidOsc.start(now + 0.14);
  lidOsc.stop(now + 0.23);
}

export function playPaperSlideSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const duration = 0.22;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.25;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2200, now);
  filter.Q.setValueAtTime(1.5, now);

  noise.connect(filter);
  filter.connect(ctx.destination);
  noise.start(now);
}

export function playWoodenFishTap(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Slight organic pitch variation per strike
  const pitchJitter = 0.985 + Math.random() * 0.03;

  // 1. Hollow resonant wood body
  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.type = 'sine';
  bodyOsc.frequency.setValueAtTime(425 * pitchJitter, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(365 * pitchJitter, now + 0.16);

  bodyGain.gain.setValueAtTime(0.42, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

  bodyOsc.connect(bodyGain);
  bodyGain.connect(ctx.destination);
  bodyOsc.start(now);
  bodyOsc.stop(now + 0.25);

  // 2. Warm hollow timber overtone
  const overOsc = ctx.createOscillator();
  const overGain = ctx.createGain();
  overOsc.type = 'triangle';
  overOsc.frequency.setValueAtTime(860 * pitchJitter, now);
  overOsc.frequency.exponentialRampToValueAtTime(740 * pitchJitter, now + 0.08);

  overGain.gain.setValueAtTime(0.16, now);
  overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  overOsc.connect(overGain);
  overGain.connect(ctx.destination);
  overOsc.start(now);
  overOsc.stop(now + 0.12);

  // 3. Crisp wooden mallet strike transient
  const clickLen = Math.floor(ctx.sampleRate * 0.022);
  const clickBuffer = ctx.createBuffer(1, clickLen, ctx.sampleRate);
  const clickData = clickBuffer.getChannelData(0);
  for (let i = 0; i < clickLen; i++) {
    clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickLen * 0.28));
  }

  const clickSource = ctx.createBufferSource();
  clickSource.buffer = clickBuffer;

  const clickFilter = ctx.createBiquadFilter();
  clickFilter.type = 'bandpass';
  clickFilter.frequency.setValueAtTime(1850, now);
  clickFilter.Q.setValueAtTime(2.0, now);

  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.35, now);

  clickSource.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickSource.start(now);
}


