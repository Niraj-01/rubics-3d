'use client';

import * as THREE from 'three';
import gsap from 'gsap';
import { MONSOON_DAY, MONSOON_NIGHT, TIME_STOPS, type WeatherPreset } from './weatherPresets';

type NumKeys = { [K in keyof WeatherPreset]: WeatherPreset[K] extends number ? K : never }[keyof WeatherPreset];
type ColKeys = { [K in keyof WeatherPreset]: WeatherPreset[K] extends string ? K : never }[keyof WeatherPreset];

const SAMPLE = TIME_STOPS[0].preset;
const NUM_KEYS = Object.keys(SAMPLE).filter((k) => typeof SAMPLE[k as keyof WeatherPreset] === 'number') as NumKeys[];
const COL_KEYS = Object.keys(SAMPLE).filter((k) => typeof SAMPLE[k as keyof WeatherPreset] === 'string') as ColKeys[];
/** The sun's position always follows the time of day, even in the rain. */
const OVERLAY_NUMS = NUM_KEYS.filter((k) => k !== 'sunElevation' && k !== 'sunAzimuth');

type Parsed = { nums: Record<NumKeys, number>; cols: Record<ColKeys, THREE.Color> };

function parse(p: WeatherPreset): Parsed {
  const nums = {} as Record<NumKeys, number>;
  NUM_KEYS.forEach((k) => (nums[k] = p[k]));
  const cols = {} as Record<ColKeys, THREE.Color>;
  COL_KEYS.forEach((k) => (cols[k] = new THREE.Color(p[k])));
  return { nums, cols };
}

const STOPS = TIME_STOPS.map((s) => ({ t: s.t, ...parse(s.preset) }));
const MON_DAY = parse(MONSOON_DAY);
const MON_NIGHT = parse(MONSOON_NIGHT);

/**
 * The one reactive weather state. GSAP tweens the three inputs (time, rain, fogSea);
 * the blended numbers and colours are rebuilt from them every frame.
 */
export const W = {
  ...parse(TIME_STOPS[0].preset),
  /** 0 = sunrise, 1/3 = day, 2/3 = sunset, 1 = night. */
  time: { value: 0 },
  /** 0 = clear, 1 = monsoon. */
  rain: { value: 0 },
  /** 0 = clear, 1 = sea of clouds hiding the city. */
  fogSea: { value: 1 },
  /** 0..1 opening cloud layer, driven by scroll in CameraRig. */
  openingClouds: { value: 1 },
};

/** Shared uniform objects, referenced (not copied) by every custom material. */
export const U = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(1, 0.1, 0.3).normalize() },
  uSunColor: { value: new THREE.Color() },
  uSunIntensity: { value: 1 },
  uSkyTop: { value: new THREE.Color() },
  uSkyHorizon: { value: new THREE.Color() },
  uGroundCol: { value: new THREE.Color() },
  uFogCol: { value: new THREE.Color() },
  uAmbient: { value: 0.5 },
  uWindowGlow: { value: 0 },
  uCityGlow: { value: 0 },
  uWet: { value: 0 },
};

const DUR = 2.5;

/** Time-of-day slider. Small nudges (dragging) follow quickly; jumps take longer. */
export function applyTime(t: number, instant = false) {
  const dist = Math.abs(t - W.time.value);
  const duration = instant ? 0 : Math.min(DUR, 0.45 + dist * 3);
  gsap.to(W.time, { value: t, duration, ease: dist > 0.1 ? 'power2.inOut' : 'power2.out', overwrite: 'auto' });
}

export function applyRain(on: boolean, instant = false) {
  gsap.to(W.rain, { value: on ? 1 : 0, duration: instant ? 0 : DUR, ease: 'power2.inOut', overwrite: 'auto' });
}

export function applyFog(on: boolean, instant = false) {
  gsap.to(W.fogSea, { value: on ? 1 : 0, duration: instant ? 0 : DUR, ease: 'power2.inOut', overwrite: 'auto' });
}

const lerp = THREE.MathUtils.lerp;
const tmpCol = new THREE.Color();

/** Rebuild W.nums / W.cols in place from time + rain (colour objects are shared by reference). */
function blend() {
  const t = THREE.MathUtils.clamp(W.time.value, 0, 1);
  let i = 0;
  while (i < STOPS.length - 2 && t > STOPS[i + 1].t) i++;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const s = THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1);
  const k = s * s * (3 - 2 * s);
  const rain = W.rain.value;
  const nightness = THREE.MathUtils.smoothstep(t, 0.6, 1);

  for (const key of NUM_KEYS) W.nums[key] = lerp(a.nums[key], b.nums[key], k);
  for (const key of COL_KEYS) W.cols[key].copy(a.cols[key]).lerp(b.cols[key], k);
  if (rain <= 0.001) return;
  for (const key of OVERLAY_NUMS) {
    W.nums[key] = lerp(W.nums[key], lerp(MON_DAY.nums[key], MON_NIGHT.nums[key], nightness), rain);
  }
  for (const key of COL_KEYS) {
    tmpCol.copy(MON_DAY.cols[key]).lerp(MON_NIGHT.cols[key], nightness);
    W.cols[key].lerp(tmpCol, rain * 0.9);
  }
}

const deg = THREE.MathUtils.degToRad;

/** Copy the blended state into shared uniforms, scene fog and lights. Called once per frame. */
export function syncWeather(time: number, fog: THREE.Fog) {
  blend();
  const n = W.nums;
  const c = W.cols;
  const el = deg(n.sunElevation);
  const az = deg(n.sunAzimuth);
  U.uTime.value = time;
  U.uSunDir.value.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize();
  U.uSunColor.value.copy(c.sunColor);
  U.uSunIntensity.value = n.sunIntensity;
  U.uSkyTop.value.copy(c.skyTop);
  U.uSkyHorizon.value.copy(c.skyHorizon);
  U.uGroundCol.value.copy(c.groundColor);
  U.uFogCol.value.copy(c.fogColor);
  U.uAmbient.value = n.ambient;
  U.uWindowGlow.value = n.windowGlow;
  U.uCityGlow.value = n.cityGlow;
  U.uWet.value = n.wet;

  const f = W.fogSea.value;
  fog.color.copy(c.fogColor);
  fog.near = lerp(n.fogNear, n.fogNear * 0.85, f);
  fog.far = lerp(n.fogFar, n.fogFar * 0.75, f);
}
