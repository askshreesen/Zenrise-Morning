// Web Audio API Procedural Ambient Sound Synthesizer
// Works 100% offline with zero external assets.

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate White Noise Buffer
let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext) {
  if (noiseBuffer) return noiseBuffer;
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

interface SynthNode {
  stop: () => void;
  setVolume: (v: number) => void;
}

export class AudioSynthManager {
  private activeNodes: Record<string, { synth: SynthNode; volume: number }> = {};
  private globalVolume = 0.8;

  setGlobalVolume(volume: number) {
    this.globalVolume = volume;
    Object.keys(this.activeNodes).forEach(key => {
      this.activeNodes[key].synth.setVolume(this.activeNodes[key].volume * this.globalVolume);
    });
  }

  toggleSound(soundId: string, enabled: boolean, localVolume = 0.5) {
    if (enabled) {
      this.startSound(soundId, localVolume);
    } else {
      this.stopSound(soundId);
    }
  }

  setSoundVolume(soundId: string, localVolume: number) {
    if (this.activeNodes[soundId]) {
      this.activeNodes[soundId].volume = localVolume;
      this.activeNodes[soundId].synth.setVolume(localVolume * this.globalVolume);
    }
  }

  private startSound(soundId: string, localVolume: number) {
    this.stopSound(soundId);
    try {
      const ctx = getAudioContext();
      let synth: SynthNode;

      switch (soundId) {
        case 'rain':
          synth = this.createRain(ctx);
          break;
        case 'ocean':
          synth = this.createOcean(ctx);
          break;
        case 'wind':
          synth = this.createWind(ctx);
          break;
        case 'birds':
          synth = this.createBirds(ctx);
          break;
        case 'forest':
          synth = this.createForest(ctx);
          break;
        case 'bells':
          synth = this.createTempleBells(ctx);
          break;
        default:
          return;
      }

      synth.setVolume(localVolume * this.globalVolume);
      this.activeNodes[soundId] = { synth, volume: localVolume };
    } catch (e) {
      console.error('Failed to play synthesized sound', e);
    }
  }

  private stopSound(soundId: string) {
    if (this.activeNodes[soundId]) {
      try {
        this.activeNodes[soundId].synth.stop();
      } catch (e) {
        // Safe disposal
      }
      delete this.activeNodes[soundId];
    }
  }

  stopAll() {
    Object.keys(this.activeNodes).forEach(key => {
      this.stopSound(key);
    });
  }

  // --- Rain Synthesizer ---
  private createRain(ctx: AudioContext): SynthNode {
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 100;

    const gainNode = ctx.createGain();

    source.connect(filter);
    filter.connect(filter2);
    filter2.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);

    return {
      stop: () => {
        source.stop();
        source.disconnect();
      },
      setVolume: (v) => {
        gainNode.gain.setTargetAtTime(v * 0.4, ctx.currentTime, 0.1);
      }
    };
  }

  // --- Ocean Waves Synthesizer ---
  private createOcean(ctx: AudioContext): SynthNode {
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    filter.Q.value = 1;

    const gainNode = ctx.createGain();

    // LFO to simulate waves (modulates both cutoff frequency and amplitude)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // Wave every 12 seconds

    const lfoGainFreq = ctx.createGain();
    lfoGainFreq.gain.value = 180; // modulate filter between 170Hz and 530Hz

    const lfoGainAmp = ctx.createGain();
    lfoGainAmp.gain.value = 0.35; // volume modulation depth

    // Connect LFO
    lfo.connect(lfoGainFreq);
    lfoGainFreq.connect(filter.frequency);

    lfo.connect(lfoGainAmp);
    // Ocean amplitude base and dynamic modulation
    const ampBase = ctx.createGain();
    ampBase.gain.value = 0.45;
    
    source.connect(filter);
    filter.connect(ampBase);
    
    // Combine LFO Gain Amp to gainNode volume
    const combiner = ctx.createGain();
    combiner.gain.value = 1.0;
    lfoGainAmp.connect(combiner.gain);

    ampBase.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    lfo.start(0);

    return {
      stop: () => {
        source.stop();
        lfo.stop();
        source.disconnect();
        lfo.disconnect();
      },
      setVolume: (v) => {
        gainNode.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.1);
      }
    };
  }

  // --- Whistling Wind Synthesizer ---
  private createWind(ctx: AudioContext): SynthNode {
    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 6; // Whistling effect

    const gainNode = ctx.createGain();

    // Complex LFO to create unpredictable whistling gusty wind
    const lfo1 = ctx.createOscillator();
    lfo1.type = 'sine';
    lfo1.frequency.value = 0.05; // 20s cycle

    const lfo2 = ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.13; // 7.7s cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250; // frequency swing

    lfo1.connect(lfoGain);
    lfo2.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Modulate volume as well for gusts
    const lfoAmp = ctx.createGain();
    lfoAmp.gain.value = 0.25;
    lfo2.connect(lfoAmp);

    const baseGain = ctx.createGain();
    baseGain.gain.value = 0.35;

    source.connect(filter);
    filter.connect(baseGain);
    baseGain.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(0);
    lfo1.start(0);
    lfo2.start(0);

    return {
      stop: () => {
        source.stop();
        lfo1.stop();
        lfo2.stop();
        source.disconnect();
        lfo1.disconnect();
        lfo2.disconnect();
      },
      setVolume: (v) => {
        gainNode.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.1);
      }
    };
  }

  // --- Procedural Bird Chirping ---
  private createBirds(ctx: AudioContext): SynthNode {
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    let isPlaying = true;
    let timeoutId: number;

    const chirp = () => {
      if (!isPlaying) return;

      const osc = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      
      osc.type = 'sine';
      chirpGain.gain.setValueAtTime(0, ctx.currentTime);

      // Fast chirp sweep: start high, sweep higher, down fast
      const baseFreq = 2000 + Math.random() * 800;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      
      const duration = 0.08 + Math.random() * 0.12;
      
      // Pitch envelope
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + duration * 0.3);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + duration);

      // Gain envelope
      chirpGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + duration * 0.1);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(chirpGain);
      chirpGain.connect(gainNode);

      osc.start(0);
      osc.stop(ctx.currentTime + duration);

      // Schedule next chirp sequence
      const nextDelay = 1000 + Math.random() * 3000;
      timeoutId = window.setTimeout(chirp, nextDelay);
    };

    chirp();

    return {
      stop: () => {
        isPlaying = false;
        clearTimeout(timeoutId);
      },
      setVolume: (v) => {
        gainNode.gain.setTargetAtTime(v * 0.6, ctx.currentTime, 0.1);
      }
    };
  }

  // --- Forest Soundscape (Rustle + Wind + Birds) ---
  private createForest(ctx: AudioContext): SynthNode {
    // Rain filter settings set higher to simulate leaves rustling in soft breeze
    const rustleSource = ctx.createBufferSource();
    rustleSource.buffer = getNoiseBuffer(ctx);
    rustleSource.loop = true;

    const rustleFilter = ctx.createBiquadFilter();
    rustleFilter.type = 'bandpass';
    rustleFilter.frequency.value = 1800;
    rustleFilter.Q.value = 0.5;

    const rustleGain = ctx.createGain();
    rustleSource.connect(rustleFilter);
    rustleFilter.connect(rustleGain);

    // Custom wind background
    const windSource = ctx.createBufferSource();
    windSource.buffer = getNoiseBuffer(ctx);
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 250;
    
    const windGain = ctx.createGain();
    windSource.connect(windFilter);
    windFilter.connect(windGain);

    const mainGain = ctx.createGain();
    rustleGain.connect(mainGain);
    windGain.connect(mainGain);
    mainGain.connect(ctx.destination);

    rustleSource.start(0);
    windSource.start(0);

    // Periodic soft bird chirps inside forest
    let isPlaying = true;
    let birdTimeout: number;

    const forestBird = () => {
      if (!isPlaying) return;
      const osc = ctx.createOscillator();
      const birdG = ctx.createGain();
      osc.type = 'sine';
      birdG.gain.setValueAtTime(0, ctx.currentTime);

      const freq = 1600 + Math.random() * 600;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const len = 0.15;
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + len * 0.4);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, ctx.currentTime + len);

      birdG.gain.linearRampToValueAtTime(0.04, ctx.currentTime + len * 0.2);
      birdG.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len);

      osc.connect(birdG);
      birdG.connect(mainGain);
      osc.start(0);
      osc.stop(ctx.currentTime + len);

      birdTimeout = window.setTimeout(forestBird, 2000 + Math.random() * 5000);
    };
    forestBird();

    return {
      stop: () => {
        isPlaying = false;
        clearTimeout(birdTimeout);
        rustleSource.stop();
        windSource.stop();
        rustleSource.disconnect();
        windSource.disconnect();
      },
      setVolume: (v) => {
        rustleGain.gain.setValueAtTime(v * 0.15, ctx.currentTime);
        windGain.gain.setValueAtTime(v * 0.3, ctx.currentTime);
        mainGain.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
      }
    };
  }

  // --- Deep Synthesized Temple Bells ---
  private createTempleBells(ctx: AudioContext): SynthNode {
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    let isPlaying = true;
    let bellTimeout: number;

    const strikeBell = () => {
      if (!isPlaying) return;

      const strikeTime = ctx.currentTime;
      // Additive metallic synthesis for authentic rich deep bell tones
      // Base frequency 110Hz with metallic partial ratios: 1:2:2.4:3:4.2
      const baseFreq = 95 + Math.random() * 10;
      const partials = [1.0, 2.0, 2.4, 3.0, 4.2, 5.4, 6.8];
      const gains = [0.5, 0.25, 0.2, 0.15, 0.1, 0.05, 0.02];

      const activeOscs: OscillatorNode[] = [];
      const activeGains: GainNode[] = [];

      partials.forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        const partialGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * ratio, strikeTime);

        // Slightly detune partials over time for organic ring/beating
        osc.frequency.linearRampToValueAtTime(baseFreq * ratio + (Math.random() * 2 - 1), strikeTime + 8);

        partialGain.gain.setValueAtTime(0, strikeTime);
        partialGain.gain.linearRampToValueAtTime(gains[i] * 0.25, strikeTime + 0.05);
        // Exponential decay envelope, higher partials decay faster
        const decayRate = 8 / (ratio * 0.7);
        partialGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decayRate);

        osc.connect(partialGain);
        partialGain.connect(gainNode);

        osc.start(strikeTime);
        osc.stop(strikeTime + decayRate + 0.5);

        activeOscs.push(osc);
        activeGains.push(partialGain);
      });

      // Strike bell every 12 - 16 seconds
      const nextStrike = 12000 + Math.random() * 4000;
      bellTimeout = window.setTimeout(strikeBell, nextStrike);
    };

    strikeBell();

    return {
      stop: () => {
        isPlaying = false;
        clearTimeout(bellTimeout);
      },
      setVolume: (v) => {
        gainNode.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
      }
    };
  }
}

// Single active instance
export const audioSynth = new AudioSynthManager();
