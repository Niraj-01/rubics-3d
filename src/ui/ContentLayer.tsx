'use client';

import type { ReactNode } from 'react';
import { useStore } from '@/store';

/** In-flow content above the canvas; steps aside while exploring a floor or the pool. */
export default function ContentLayer({ children }: { children: ReactNode }) {
  const mode = useStore((s) => s.mode);
  const away = mode !== 'scroll';
  return (
    <main
      className="relative z-10 transition-[opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity: away ? 0 : 1, filter: away ? 'blur(6px)' : 'none', pointerEvents: away ? 'none' : undefined }}
      aria-hidden={away}
    >
      {children}
    </main>
  );
}
