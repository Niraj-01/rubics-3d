'use client';

import { useEffect } from 'react';
import { beaumonte, floorInfo } from '@/content';
import { useStore } from '@/store';
import { BackIcon } from './icons';

/** Quiet cue that the view can be turned. */
function LookHint() {
  return (
    <p className="mt-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted">
      <span className="h-px w-4 bg-gold/50" />
      <span className="[@media(pointer:coarse)]:hidden">Drag to look around</span>
      <span className="hidden [@media(pointer:coarse)]:inline">Swipe to look around</span>
      <span className="h-px w-4 bg-gold/50" />
    </p>
  );
}

/** HUD for floor and pool modes: where you are, what you're looking at, and the way back. */
export default function AmenityControl() {
  const mode = useStore((s) => s.mode);
  const floor = useStore((s) => s.floor);
  const backToTower = useStore((s) => s.backToTower);
  const flying = useStore((s) => s.flying);
  const info = floorInfo(floor);

  useEffect(() => {
    if (mode !== 'pool') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && backToTower();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, backToTower]);

  // arrives once the camera has landed, so the flight itself stays uncluttered
  const show = mode !== 'scroll' && !flying;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(76px,calc(env(safe-area-inset-top)+64px))] z-30 flex justify-center px-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:top-24"
      style={{ opacity: show ? 1 : 0, transform: `translateY(${show ? 0 : -10}px)` }}
      aria-live="polite"
    >
      <div className="glass pointer-events-auto max-w-xl px-5 py-4 text-center sm:px-7">
        {mode === 'pool' ? (
          <>
            <p className="eyebrow">Level 6 amenity deck</p>
            <p className="mt-2 font-serif text-2xl text-cream sm:text-3xl">{beaumonte.theLifestyle[1]}</p>
            <p className="mt-1 text-[12px] text-muted">{beaumonte.amenities.aquatique.slice(1).join(' · ')}</p>
            <LookHint />
            <button type="button" onClick={backToTower} className="btn btn-ghost mt-3" tabIndex={show ? 0 : -1}>
              <BackIcon className="h-4 w-4" /> Back to tower
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">{info.title} · Looking west</p>
            {info.view && (
              <p className="mt-2 hidden font-serif text-[17px] italic leading-snug text-cream/90 sm:block">{info.view}</p>
            )}
            <LookHint />
          </>
        )}
      </div>
    </div>
  );
}
