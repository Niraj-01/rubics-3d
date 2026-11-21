'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { beaumonte, brand, nav } from '@/content';
import { getLenis, goToSection, useStore } from '@/store';
import { useScrollStyle } from './useScrollStyle';
import { CloseIcon, MenuIcon } from './icons';

/** Small wordmark + tagline top-left, minimal nav, and the quiet opening title + scroll cue. */
export default function Brand() {
  const tagline = useRef<HTMLParagraphElement>(null);
  const opening = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const exploring = useStore((s) => s.mode !== 'scroll');

  const fadeOnScroll = useCallback((el: HTMLElement, p: number) => {
    const v = Math.max(0, 1 - p / 0.04);
    el.style.opacity = v.toFixed(3);
    el.style.transform = `translateY(${((1 - v) * -8).toFixed(2)}px)`;
    el.style.visibility = v < 0.01 ? 'hidden' : 'visible';
  }, []);
  useScrollStyle(tagline, fadeOnScroll);
  useScrollStyle(opening, fadeOnScroll);

  const jump = (id: string) => {
    setOpen(false);
    goToSection(id);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-ink/45 to-transparent" aria-hidden />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-8 sm:pt-7">
        <button
          type="button"
          onClick={() => getLenis()?.scrollTo(0, { duration: 2.2 })}
          className="focus-ring pointer-events-auto -m-2 rounded-lg p-2 text-left"
          aria-label="Rubics Realty, back to top"
        >
          <Image src={brand.logo} alt="Rubics" width={116} height={24} priority className="h-[18px] w-auto sm:h-5" />
          <p ref={tagline} className="mt-2 font-serif text-[15px] italic leading-none text-cream/75 sm:text-base">
            {brand.tagline}
          </p>
        </button>

        <nav className="pointer-events-auto hidden items-center gap-1 md:flex" aria-label="Sections">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => jump(n.id)}
              className="link-gold focus-ring px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-cream/80"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="btn btn-ghost pointer-events-auto !h-11 !w-11 !p-0 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      {/* mobile menu sheet */}
      <div
        className="glass-strong fixed inset-x-4 top-[max(72px,calc(env(safe-area-inset-top)+64px))] z-40 p-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden"
        style={{ opacity: open ? 1 : 0, transform: `translateY(${open ? 0 : -10}px)`, pointerEvents: open ? 'auto' : 'none' }}
        aria-hidden={!open}
      >
        {nav.map((n) => (
          <button
            key={n.id}
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => jump(n.id)}
            className="focus-ring flex min-h-12 w-full items-center rounded-xl px-4 text-left font-serif text-2xl text-cream active:bg-white/5"
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* opening title: small, quiet, gone as soon as the journey starts */}
      <div className="transition-opacity duration-700" style={{ opacity: exploring ? 0 : 1 }}>
      <div
        ref={opening}
        className="pointer-events-none fixed inset-x-0 bottom-[96px] z-10 flex flex-col items-center px-6 text-center md:bottom-[112px] md:left-[6vw] md:right-auto md:items-start md:px-0 md:text-left"
      >
        <div className="absolute -inset-x-6 -inset-y-14 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(11,11,12,0.3),rgba(11,11,12,0)_70%)] md:-left-[6vw] md:right-auto md:w-[720px]" />
        <p className="eyebrow">{beaumonte.eyebrow}</p>
        <h1 className="mt-4 font-serif [text-shadow:0_2px_30px_rgba(0,0,0,0.35)] text-[40px] font-light leading-[1.05] text-cream sm:text-6xl">
          {beaumonte.name} <span className="italic text-gold-light">{beaumonte.tower}</span>
        </h1>
        <p className="mt-3 font-serif text-lg italic text-cream/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)] sm:text-xl">{beaumonte.tagline}</p>
        <div className="mt-8 flex flex-col items-center gap-2 md:items-start text-[10px] uppercase tracking-[0.3em] text-cream/60">
          <span>Scroll to explore</span>
          <span className="relative block h-8 w-px overflow-hidden bg-cream/15">
            <span className="cue-dot absolute left-0 top-0 block h-3 w-px bg-gold" />
          </span>
        </div>
      </div>
      </div>
    </>
  );
}
