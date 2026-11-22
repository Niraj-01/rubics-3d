'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { SoundIcon } from './icons';

// loaded on first use so the audio code never weighs on the first paint
const ambience = () => import('@/ambience');

/** Ambient sound on/off. Off by default; pauses while the tab is hidden. */
export default function SoundToggle() {
  const sound = useStore((s) => s.sound);
  const setSound = useStore((s) => s.setSound);

  useEffect(() => {
    if (!sound) return;
    const onVis = () => ambience().then((a) => a.setAmbience(!document.hidden));
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [sound]);

  const toggle = () => {
    const next = !sound;
    setSound(next);
    ambience().then((a) => a.setAmbience(next));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={sound}
      aria-label={sound ? 'Ambient sound on, tap to mute' : 'Ambient sound off, tap to play'}
      title={sound ? 'Mute ambience' : 'Play ambience'}
      className={`btn btn-ghost pointer-events-auto !h-11 !w-11 !p-0 ${sound ? '!border-gold/50 text-gold-light' : 'text-cream/75'}`}
    >
      <SoundIcon on={sound} className="h-5 w-5" />
    </button>
  );
}
