'use client';

import { useEffect, type ComponentType, type ReactNode } from 'react';
import { nearestStop, TIME_STOPS, type TimeName } from '@/scene/weatherPresets';
import { useStore } from '@/store';
import { FogIcon, MoonIcon, RainIcon, SunIcon, SunriseIcon, SunsetIcon } from './icons';

const ICONS: Record<TimeName, ComponentType<{ className?: string }>> = {
  sunrise: SunriseIcon,
  day: SunIcon,
  sunset: SunsetIcon,
  night: MoonIcon,
};

/** The slider runs 0..3 so each time-of-day stop sits on a whole number. */
const SCALE = TIME_STOPS.length - 1;
const SNAP = 0.18;

function Toggle({ on, onClick, label, title, children }: { on: boolean; onClick: () => void; label: string; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={title}
      className={`focus-ring flex h-11 w-11 items-center justify-center gap-2 rounded-full text-[11px] uppercase tracking-[0.16em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.94] sm:w-auto sm:min-w-11 sm:px-2.5 ${
        on ? 'bg-gold/15 text-gold-light shadow-[inset_0_0_0_1px_rgba(201,169,110,0.55)]' : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
      }`}
    >
      {children}
    </button>
  );
}

/** Floating frosted-glass pill, bottom-left: time-of-day slider, then monsoon and fog toggles. */
export default function WeatherControl() {
  const time = useStore((s) => s.time);
  const weather = useStore((s) => s.weather);
  const fog = useStore((s) => s.fog);
  const flying = useStore((s) => s.flying);
  const inSections = useStore((s) => s.inSections);
  const setTime = useStore((s) => s.setTime);
  const setWeather = useStore((s) => s.setWeather);
  const setFog = useStore((s) => s.setFog);

  // how bright the scene is behind the glass panels: sunrise .55, noon 1, sunset .55, night 0
  useEffect(() => {
    const seg = time * SCALE;
    const levels = [0.55, 1, 0.55, 0];
    const i = Math.min(SCALE - 1, Math.floor(seg));
    const light = (levels[i] + (levels[i + 1] - levels[i]) * (seg - i)) * (weather === 'monsoon' ? 0.7 : 1);
    document.documentElement.style.setProperty('--scene-light', light.toFixed(2));
  }, [time, weather]);

  const stop = nearestStop(time);
  const Icon = ICONS[stop.id];
  const v = time * SCALE;

  // Let go near a stop and the slider settles onto it.
  const settle = () => {
    const r = Math.round(v);
    if (Math.abs(v - r) < SNAP) setTime(r / SCALE);
  };

  return (
    <div
      className={`glass fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-30 flex items-center gap-0 !rounded-full p-1 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:bottom-8 sm:left-8 sm:gap-0.5 ${
        // on phones the content sections need the whole screen, buttons included
        inSections ? 'max-md:!pointer-events-none max-md:translate-y-4 max-md:!opacity-0' : ''
      }`}
      style={{ opacity: flying ? 0 : 1, transform: flying ? 'translateY(12px)' : 'none', pointerEvents: flying ? 'none' : 'auto' }}
      role="group"
      aria-label="Time of day and weather"
    >
      <div className="flex items-center gap-2 pl-2.5 pr-1.5 sm:pl-3 sm:pr-2" data-lenis-prevent>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setTime(TIME_STOPS[(TIME_STOPS.indexOf(stop) + 1) % TIME_STOPS.length].t)}
          className="text-gold-light transition-transform duration-500 active:scale-90"
        >
          <Icon key={stop.id} className="h-[18px] w-[18px] animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)]" />
        </button>
        <input
          type="range"
          className="time-range w-[88px] sm:w-32"
          min={0}
          max={SCALE}
          step={0.01}
          value={v}
          aria-label="Time of day"
          aria-valuetext={stop.label}
          onChange={(e) => setTime(Number(e.target.value) / SCALE)}
          onPointerUp={settle}
          onTouchEnd={settle}
          onKeyDown={(e) => {
            const next = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
            if (!next) return;
            e.preventDefault();
            const target = next > 0 ? Math.floor(v + 0.001) + 1 : Math.ceil(v - 0.001) - 1;
            setTime(Math.min(SCALE, Math.max(0, target)) / SCALE);
          }}
        />
        <span className="hidden w-[4.5rem] text-[11px] uppercase tracking-[0.16em] text-cream/80 lg:inline" aria-hidden>
          {stop.label}
        </span>
      </div>
      <span className="mx-0.5 h-6 w-px bg-gold/20 sm:mx-1" aria-hidden />
      <Toggle
        on={weather === 'monsoon'}
        onClick={() => setWeather(weather === 'monsoon' ? 'clear' : 'monsoon')}
        label={weather === 'monsoon' ? 'Monsoon on, tap to clear' : 'Monsoon off, tap for rain'}
        title="Monsoon"
      >
        <RainIcon className="h-[18px] w-[18px]" />
        <span className="hidden lg:inline">Rain</span>
      </Toggle>
      <Toggle on={fog} onClick={() => setFog(!fog)} label={fog ? 'Fog on, tap to clear' : 'Fog off, tap to add'} title="Fog">
        <FogIcon className="h-[18px] w-[18px]" />
        <span className="hidden lg:inline">Fog</span>
      </Toggle>
    </div>
  );
}
