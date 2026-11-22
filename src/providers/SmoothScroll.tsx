'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis, useStore } from '@/store';

/** Reads scroll position against the #journey container and writes progress to the store. */
function measure(scroll: number) {
  const journey = document.getElementById('journey');
  const vh = window.innerHeight;
  if (!journey) return;
  const top = journey.offsetTop;
  const span = Math.max(1, journey.offsetHeight - vh);
  const raw = (scroll - top) / span;
  const progress = Math.min(1, Math.max(0, raw));
  const after = Math.max(0, scroll - top - span);
  useStore.getState().setProgress(progress, after);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    // reduced motion: keep smooth scrolling (it drives the camera) but with far less glide
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({ autoRaf: true, lerp: calm ? 0.3 : 0.085, wheelMultiplier: 0.9, anchors: false });
    setLenis(lenis);
    lenis.on('scroll', (l: Lenis) => measure(l.scroll));
    const onResize = () => measure(lenis.scroll);
    window.addEventListener('resize', onResize);
    measure(0);
    return () => {
      window.removeEventListener('resize', onResize);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
