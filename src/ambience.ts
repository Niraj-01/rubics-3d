'use client';

import { W } from '@/scene/weather';
import { useStore } from '@/store';

/**
 * Procedural ambience, synthesised in the browser (no audio files):
 * wind that grows with height, rain in the monsoon, water at the pool deck,
 * a low city hum after dark and distant surf from the floors. Off until the visitor turns it on.
 */

/** Written by the camera rig every frame. */
export const listener = { height: 0 };

type Layer = { gain: GainNode; filter: BiquadFilterNode };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let layers: Record<'wind' | 'rain' | 'water' | 'city' | 'surf', Layer> | null = null;
let timer = 0;

function noiseBuffer(c: AudioContext, brown: boolean) {
  const len = c.sampleRate * 3;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = white;
  }
  return buf;
}

function layer(c: AudioContext, out: AudioNode, buf: AudioBuffer, type: BiquadFilterType, freq: number, q = 0.7): Layer {
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  // start each loop somewhere different so layers never phase together
  src.start(0, Math.random() * buf.duration);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(out);
  return { gain, filter };
}

function build() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const white = noiseBuffer(ctx, false);
  const brown = noiseBuffer(ctx, true);
  layers = {
    wind: layer(ctx, master, brown, 'bandpass', 420, 0.6),
    rain: layer(ctx, master, white, 'highpass', 1400, 0.4),
    water: layer(ctx, master, brown, 'lowpass', 520, 0.5),
    city: layer(ctx, master, brown, 'lowpass', 160, 0.5),
    surf: layer(ctx, master, brown, 'lowpass', 380, 0.5),
  };
}

const ramp = (p: AudioParam, v: number, tc = 0.6) => ctx && p.setTargetAtTime(v, ctx.currentTime, tc);

/** Re-evaluated a few times a second from the current scene state. */
function update() {
  if (!ctx || !layers) return;
  const t = ctx.currentTime;
  const { mode } = useStore.getState();
  const h = Math.min(1, Math.max(0, (listener.height - 20) / 140));
  const rain = W.rain.value;
  const night = W.nums.windowGlow;
  const gust = 0.75 + 0.25 * Math.sin(t * 0.37) * Math.sin(t * 0.11 + 1.3);
  const swell = 0.55 + 0.45 * Math.sin(t * 0.5) * Math.sin(t * 0.17);

  ramp(layers.wind.gain.gain, (0.05 + 0.22 * h) * gust * (mode === 'floor' ? 0.55 : 1));
  ramp(layers.wind.filter.frequency, 300 + 380 * h + 120 * gust, 1.2);
  ramp(layers.rain.gain.gain, 0.16 * rain);
  ramp(layers.water.gain.gain, mode === 'pool' ? 0.12 * swell : 0);
  ramp(layers.city.gain.gain, 0.09 * night * (1 - h * 0.6));
  ramp(layers.surf.gain.gain, mode === 'floor' ? 0.05 * swell : 0, 1.2);
}

export async function setAmbience(on: boolean) {
  if (on && !ctx) build();
  if (!ctx || !master) return;
  if (on) {
    await ctx.resume();
    ramp(master.gain, 0.9, 0.8);
    window.clearInterval(timer);
    timer = window.setInterval(update, 200);
    update();
  } else {
    ramp(master.gain, 0, 0.3);
    window.clearInterval(timer);
    window.setTimeout(() => {
      if (!useStore.getState().sound) ctx?.suspend();
    }, 1200);
  }
}
