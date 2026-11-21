'use client';

import { useEffect, type RefObject } from 'react';
import { useStore } from '@/store';

/**
 * Subscribe to journey progress and write styles straight to the element,
 * so scroll-driven fades never re-render React.
 */
export function useScrollStyle(ref: RefObject<HTMLElement | null>, apply: (el: HTMLElement, progress: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    apply(el, useStore.getState().progress);
    return useStore.subscribe((s, prev) => {
      if (s.progress !== prev.progress) apply(el, s.progress);
    });
  }, [ref, apply]);
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 0..1 visibility for a window centred on `center` with fade edges. */
export function rangeVisibility(p: number, center: number, half: number, fade = 0.03) {
  return smooth(center - half - fade, center - half + fade, p) * (1 - smooth(center + half - fade, center + half + fade, p));
}
