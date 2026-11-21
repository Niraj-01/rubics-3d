'use client';

import type { ComponentType } from 'react';
import { WEATHER_ORDER } from '@/scene/weatherPresets';
import { useStore, type WeatherName } from '@/store';
import { FogIcon, MoonIcon, RainIcon, SunIcon, SunriseIcon } from './icons';

const ICONS: Record<WeatherName, ComponentType<{ className?: string }>> = {
  sunrise: SunriseIcon,
  day: SunIcon,
  night: MoonIcon,
  monsoon: RainIcon,
};

/** Floating frosted-glass pill, bottom-left: time of day / weather + fog toggle. */
export default function WeatherControl() {
  const weather = useStore((s) => s.weather);
  const fog = useStore((s) => s.fog);
  const setWeather = useStore((s) => s.setWeather);
  const setFog = useStore((s) => s.setFog);

  return (
    <div
      className="glass fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-30 flex items-center gap-0.5 !rounded-full p-1 sm:left-8 sm:bottom-8"
      role="toolbar"
      aria-label="Weather"
    >
      {WEATHER_ORDER.map(({ id, label }) => {
        const Icon = ICONS[id];
        const active = weather === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setWeather(id)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`focus-ring flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] ${
              active ? 'bg-gold/15 text-gold-light shadow-[inset_0_0_0_1px_rgba(201,169,110,0.55)]' : 'text-cream/70 hover:text-cream'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className={`hidden overflow-hidden whitespace-nowrap lg:inline ${active ? 'max-w-24' : 'max-w-0'} transition-[max-width] duration-500`}>
              {label}
            </span>
          </button>
        );
      })}
      <span className="mx-1 h-6 w-px bg-gold/20" aria-hidden />
      <button
        type="button"
        onClick={() => setFog(!fog)}
        aria-pressed={fog}
        aria-label={fog ? 'Fog on, tap to clear' : 'Fog off, tap to add'}
        title="Fog"
        className={`focus-ring flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-500 active:scale-[0.97] ${
          fog ? 'bg-gold/15 text-gold-light shadow-[inset_0_0_0_1px_rgba(201,169,110,0.55)]' : 'text-cream/70 hover:text-cream'
        }`}
      >
        <FogIcon className="h-[18px] w-[18px]" />
        <span className="hidden lg:inline">Fog</span>
      </button>
    </div>
  );
}
