'use client';

import { create } from 'zustand';
import type Lenis from 'lenis';

export type Mode = 'scroll' | 'floor' | 'pool';
export type WeatherName = 'sunrise' | 'day' | 'night' | 'monsoon';
export type Tier = 'high' | 'low';

type State = {
  /** 0..1 across the camera journey (the tall scroll container). */
  progress: number;
  /** Pixels scrolled past the end of the journey, for the ambient orbit. */
  afterJourney: number;
  mode: Mode;
  weather: WeatherName;
  fog: boolean;
  floor: number;
  tier: Tier;
  sceneReady: boolean;
  loadProgress: number;
  setProgress: (progress: number, afterJourney: number) => void;
  setWeather: (weather: WeatherName) => void;
  setFog: (fog: boolean) => void;
  setFloor: (floor: number) => void;
  setTier: (tier: Tier) => void;
  setSceneReady: () => void;
  setLoadProgress: (p: number) => void;
  enterFloor: (floor: number) => void;
  enterPool: () => void;
  backToTower: () => void;
};

let lenisRef: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenisRef = l;
};
export const getLenis = () => lenisRef;

export const useStore = create<State>((set, get) => ({
  progress: 0,
  afterJourney: 0,
  mode: 'scroll',
  weather: 'sunrise',
  fog: true,
  floor: 20,
  tier: 'high',
  sceneReady: false,
  loadProgress: 0,
  setProgress: (progress, afterJourney) => set({ progress, afterJourney }),
  setWeather: (weather) => set({ weather }),
  setFog: (fog) => set({ fog }),
  setFloor: (floor) => set({ floor }),
  setTier: (tier) => set({ tier }),
  setSceneReady: () => set({ sceneReady: true }),
  setLoadProgress: (loadProgress) => set({ loadProgress }),
  enterFloor: (floor) => {
    lenisRef?.stop();
    set({ floor, mode: 'floor' });
  },
  enterPool: () => {
    lenisRef?.stop();
    set({ mode: 'pool' });
  },
  backToTower: () => {
    if (get().mode === 'scroll') return;
    set({ mode: 'scroll' });
    lenisRef?.start();
  },
}));

/** Scroll to a section anchor, leaving floor/pool mode first if needed. */
export function goToSection(id: string) {
  const s = useStore.getState();
  if (s.mode !== 'scroll') s.backToTower();
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisRef) lenisRef.scrollTo(el, { offset: -24, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: 'smooth' });
}
