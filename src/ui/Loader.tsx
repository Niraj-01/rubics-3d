'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { brand } from '@/content';
import { getLenis, useStore } from '@/store';

const MIN_MS = 1500;

/** Branded loading screen: logo + thin gold progress line, then fades into the opening shot. */
export default function Loader() {
  const bar = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'loading' | 'leaving' | 'gone'>('loading');

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const { sceneReady, loadProgress } = useStore.getState();
      const timeShare = Math.min(1, (now - start) / MIN_MS);
      const real = sceneReady ? 1 : Math.min(0.9, loadProgress / 100 + 0.6);
      const goal = Math.min(timeShare, real);
      if (bar.current) bar.current.style.transform = `scaleX(${goal.toFixed(4)})`;
      if (sceneReady && timeShare >= 1) {
        setPhase('leaving');
        getLenis()?.scrollTo(0, { immediate: true });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = setTimeout(() => setPhase('gone'), 1300);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink transition-opacity duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
      style={{ opacity: phase === 'leaving' ? 0 : 1, pointerEvents: phase === 'leaving' ? 'none' : 'auto' }}
      role="status"
      aria-label="Loading"
    >
      <Image src={brand.logo} alt="Rubics" width={154} height={32} priority className="h-7 w-auto opacity-95" />
      <p className="mt-5 font-serif text-lg italic text-muted">{brand.tagline}</p>
      <div className="mt-10 h-px w-48 overflow-hidden bg-gold/15">
        <div ref={bar} className="h-full w-full origin-left bg-gold transition-transform duration-500 ease-out" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  );
}
