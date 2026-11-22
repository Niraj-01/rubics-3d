'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { brand } from '@/content';
import { getLenis, useStore } from '@/store';

const MIN_MS = 1800;
/** Never hold the visitor hostage: after this, show the page whatever state the scene is in. */
const MAX_MS = 12000;

/** Branded loading screen: the logo draws itself in gold, a thin progress line fills, then it fades into the opening shot. */
export default function Loader() {
  const bar = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'loading' | 'leaving' | 'gone'>('loading');

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const { sceneReady, loadProgress } = useStore.getState();
      const timeShare = Math.min(1, (now - start) / MIN_MS);
      const giveUp = now - start > MAX_MS;
      const real = sceneReady || giveUp ? 1 : Math.min(0.9, loadProgress / 100 + 0.6);
      const goal = Math.min(timeShare, real);
      if (bar.current) bar.current.style.transform = `scaleX(${goal.toFixed(4)})`;
      if ((sceneReady || giveUp) && timeShare >= 1) {
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
      <div className="relative overflow-hidden">
        <Image
          src={brand.logo}
          alt="Rubics"
          width={154}
          height={32}
          priority
          className="h-7 w-auto animate-[reveal_1.1s_cubic-bezier(0.65,0,0.35,1)_both] opacity-95"
        />
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-[shimmer_1.6s_cubic-bezier(0.65,0,0.35,1)_0.9s_both] bg-gradient-to-r from-transparent via-gold-light/60 to-transparent mix-blend-overlay"
          aria-hidden
        />
      </div>
      <p className="mt-5 animate-[fadeUp_0.9s_cubic-bezier(0.22,1,0.36,1)_0.5s_both] font-serif text-lg italic text-muted">{brand.tagline}</p>
      <div className="mt-10 h-px w-48 animate-[fadeUp_0.9s_cubic-bezier(0.22,1,0.36,1)_0.8s_both] overflow-hidden bg-gold/15">
        <div ref={bar} className="h-full w-full origin-left bg-gold transition-transform duration-500 ease-out" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  );
}
