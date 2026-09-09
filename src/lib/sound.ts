const SOUND_KEY = 'photobooth-sound';
const OUTPUT_GAIN = 1.7;

let audioContext: AudioContext | null = null;

export function getSoundsEnabled(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundsEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
  } catch {
    // Sound still works for this page when storage is unavailable.
  }

  if (enabled) {
    void getAudioContext()?.resume();
  }
}

function getAudioContext(): AudioContext | null {
  if (!getSoundsEnabled()) return null;
  const AudioContextClass = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function playTone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume * OUTPUT_GAIN, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noiseBuffer(context: AudioContext, duration: number): AudioBuffer {
  const length = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
  return buffer;
}

function playNoiseBurst(
  context: AudioContext,
  start: number,
  duration: number,
  volume: number,
  frequency: number,
) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const buffer = noiseBuffer(context, duration);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) {
    channel[i] *= Math.pow(1 - i / channel.length, 2);
  }
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = 0.75;
  gain.gain.value = volume * OUTPUT_GAIN;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
}

export function playCountdownTick(count: number) {
  const context = getAudioContext();
  if (!context) return;
  const progress = Math.max(0, Math.min(2, 3 - count));
  const frequency = [520, 650, 800][progress];
  const now = context.currentTime;
  playTone(context, frequency, now, 0.085, 0.045, 'triangle');
  playTone(context, frequency * 2, now, 0.045, 0.012, 'sine');
}

export function playShutter() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  // A short release-and-return clack instead of a broad noise burst.
  playNoiseBurst(context, now, 0.035, 0.095, 2800);
  playTone(context, 210, now, 0.035, 0.032, 'square');
  playNoiseBurst(context, now + 0.055, 0.06, 0.085, 1750);
  playTone(context, 135, now + 0.05, 0.07, 0.038, 'triangle');
  playTone(context, 1200, now + 0.095, 0.045, 0.009, 'sine');
}

export function playCompletionChime() {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  playTone(context, 659.25, now, 0.2, 0.035, 'sine');
  playTone(context, 830.61, now + 0.09, 0.25, 0.032, 'sine');
  playTone(context, 987.77, now + 0.18, 0.32, 0.028, 'sine');
}
