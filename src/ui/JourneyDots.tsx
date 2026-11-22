'use client';

import { useEffect, useState } from 'react';
import { getLenis, goToSection, useStore } from '@/store';

/** Chapters of the camera journey, by scroll progress; the last one hands over to the sections. */
const CHAPTERS = [
  { label: 'Opening', p: 0 },
  { label: 'Arrival', p: 0.25 },
  { label: 'The view', p: 0.4 },
  { label: 'The tower', p: 0.54 },
  { label: 'Amenities', p: 0.68 },
  { label: 'Vision', p: 0.84 },
  { label: 'Projects', p: 1.01, section: 'projects' },
];

function activeIndex(progress: number, after: number) {
  if (after > 200) return CHAPTERS.length - 1;
  let best = 0;
  CHAPTERS.forEach((c, i) => {
    if (progress >= c.p - 0.07) best = i;
  });
  return best;
}

function jump(i: number) {
  const c = CHAPTERS[i];
  if (c.section) return goToSection(c.section);
  const j = document.getElementById('journey');
  const lenis = getLenis();
  if (!j) return;
  const y = j.offsetTop + c.p * (j.offsetHeight - window.innerHeight);
  if (lenis) lenis.scrollTo(y, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

/** Progress dots on the right edge: where you are on the journey, and a way to jump to any chapter. */
export default function JourneyDots() {
  const [active, setActive] = useState(0);
  const mode = useStore((s) => s.mode);
  const ready = useStore((s) => s.sceneReady);

  useEffect(
    () =>
      useStore.subscribe((s) => {
        const i = activeIndex(s.progress, s.afterJourney);
        setActive((cur) => (cur === i ? cur : i));
      }),
    [],
  );

  const show = ready && mode === 'scroll';

  return (
    <nav
      aria-label="Journey chapters"
      className={`fixed right-1 top-[30%] z-30 -translate-y-1/2 transition-opacity duration-700 sm:right-4 md:top-1/2 ${
        // on phones the sections use the full width; step out of their way
        active === CHAPTERS.length - 1 ? 'max-md:hidden' : ''
      }`}
      style={{ opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none' }}
    >
      <ol className="flex flex-col items-end">
        {CHAPTERS.map((c, i) => {
          const on = i === active;
          return (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-current={on ? 'step' : undefined}
                aria-label={`Go to ${c.label}`}
                tabIndex={show ? 0 : -1}
                className="focus-ring group flex h-7 items-center gap-3 rounded-full pl-3 pr-2.5 md:h-8"
              >
                <span
                  className={`whitespace-nowrap text-[10px] uppercase tracking-[0.22em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:hidden ${
                    on ? 'translate-x-0 text-gold-light opacity-100' : 'translate-x-1 text-cream/70 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {c.label}
                </span>
                <span
                  className={`block w-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    on ? 'h-5 bg-gold-light shadow-[0_0_10px_rgba(230,211,163,0.6)]' : 'h-1 bg-cream/55 group-hover:bg-cream/90 group-active:scale-150'
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
