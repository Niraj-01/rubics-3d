'use client';

import * as THREE from 'three';
import gsap from 'gsap';
import type { WeatherName } from '@/store';
import { WEATHER_PRESETS, type WeatherPreset } from './weatherPresets';

type NumKeys = { [K in keyof WeatherPreset]: WeatherPreset[K] extends number ? K : never }[keyof WeatherPreset];
type ColKeys = { [K in keyof WeatherPreset]: WeatherPreset[K] extends string ? K : never }[keyof WeatherPreset];

const NUM_KEYS = Object.keys(WEATHER_PRESETS.sunrise).filter(
  (k) => typeof WEATHER_PRESETS.sunrise[k as keyof WeatherPreset] === 'number',
) as NumKeys[];
const COL_KEYS = Object.keys(WEATHER_PRESETS.sunrise).filter(
  (k) => typeof WEATHER_PRESETS.sunrise[k as keyof WeatherPreset] === 'string',
) as ColKeys[];

function fromPreset(p: WeatherPreset) {
  const nums = {} as Record<NumKeys, number>;
  NUM_KEYS.forEach((k) => (nums[k] = p[k]));
  const cols = {} as Record<ColKeys, THREE.Color>;
  COL_KEYS.forEach((k) => (cols[k] = new THREE.Color(p[k])));
  return { nums, cols };
}

/** The one reactive weather state. GSAP tweens it; the scene reads it every frame. */
const initial = fromPreset(WEATHER_PRESETS.sunrise);
export const W = {
  ...initial,
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

export function applyWeather(name: WeatherName, instant = false) {
  const target = fromPreset(WEATHER_PRESETS[name]);
  const dur = instant ? 0 : DUR;
  gsap.to(W.nums, { ...target.nums, duration: dur, ease: 'power2.inOut', overwrite: 'auto' });
  COL_KEYS.forEach((k) => {
    const c = target.cols[k];
    gsap.to(W.cols[k], { r: c.r, g: c.g, b: c.b, duration: dur, ease: 'power2.inOut', overwrite: 'auto' });
  });
}

export function applyFog(on: boolean, instant = false) {
  gsap.to(W.fogSea, { value: on ? 1 : 0, duration: instant ? 0 : DUR, ease: 'power2.inOut', overwrite: 'auto' });
}

const deg = THREE.MathUtils.degToRad;

/** Copy tweened state into shared uniforms, scene fog and lights. Called once per frame. */
export function syncWeather(time: number, fog: THREE.Fog) {
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
  fog.near = THREE.MathUtils.lerp(n.fogNear, n.fogNear * 0.85, f);
  fog.far = THREE.MathUtils.lerp(n.fogFar, n.fogFar * 0.75, f);
}
