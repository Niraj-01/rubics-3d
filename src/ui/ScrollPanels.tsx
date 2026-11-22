'use client';

import { useCallback, useRef, type ReactNode } from 'react';
import { beaumonte, stats, vision } from '@/content';
import { PANEL_HALF_WIDTH, PANEL_RANGES, type PanelId } from '@/scene/cameraPath';
import { useStore } from '@/store';
import { rangeVisibility, useScrollStyle } from './useScrollStyle';

const STAGGER = 0.14;

function Panel({ id, children }: { id: PanelId; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const center = PANEL_RANGES.find((r) => r.id === id)!.center;
  const apply = useCallback(
    (el: HTMLElement, p: number) => {
      const v = rangeVisibility(p, center, PANEL_HALF_WIDTH);
      const dir = p < center ? 1 : -1;
      // the glass arrives a beat ahead of its contents
      const glass = Math.min(1, v * 1.6);
      el.style.opacity = glass.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - glass) * 16 * dir).toFixed(2)}px, 0)`;
      el.style.filter = glass > 0.995 ? 'none' : `blur(${((1 - glass) * 6).toFixed(2)}px)`;
      el.style.visibility = v < 0.01 ? 'hidden' : 'visible';
      el.style.pointerEvents = v > 0.6 ? 'auto' : 'none';
      if (v < 0.01) return;
      // then the lines follow one by one, top-down on the way in, bottom-up on the way back
      const kids = el.children;
      const n = kids.length;
      for (let i = 0; i < n; i++) {
        const order = dir > 0 ? i : n - 1 - i;
        const k = Math.min(1, Math.max(0, v * (1 + STAGGER * (n - 1)) - STAGGER * order));
        const e = k * k * (3 - 2 * k);
        const kid = kids[i] as HTMLElement;
        kid.style.opacity = e.toFixed(3);
        kid.style.transform = e > 0.999 ? 'none' : `translate3d(0, ${((1 - e) * 14 * dir).toFixed(2)}px, 0)`;
      }
    },
    [center],
  );
  useScrollStyle(ref, apply);
  return (
    <section
      ref={ref}
      aria-label={id}
      className="glass fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-20 max-h-[50svh] overflow-hidden p-5 will-change-transform md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-1/2 md:max-h-none md:w-[min(430px,38vw)] md:-translate-y-1/2 md:p-8"
      style={{ opacity: 0, visibility: 'hidden' }}
    >
      {children}
    </section>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="mt-3 font-serif text-[28px] font-light leading-[1.08] text-cream md:mt-4 md:text-[40px]">{children}</h2>;
}

export default function ScrollPanels() {
  const mode = useStore((s) => s.mode);
  const enterPool = useStore((s) => s.enterPool);
  return (
    <div
      className="transition-opacity duration-700"
      style={{ opacity: mode === 'scroll' ? 1 : 0, pointerEvents: mode === 'scroll' ? undefined : 'none' }}
    >
      <Panel id="stats">
        <p className="eyebrow">{beaumonte.fromMakersOf}</p>
        <Title>{beaumonte.philosophyTitle[0]} <em className="text-gold-light">{beaumonte.philosophyTitle[1]}</em></Title>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gold/15 pt-5 md:mt-7 md:pt-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-[26px] leading-none text-gold-light md:text-[34px]">{s.value}</p>
              {s.unit && <p className="mt-1 text-[9px] tracking-[0.2em] text-cream/80 md:text-[10px]">{s.unit}</p>}
              <p className="mt-1 text-[9px] leading-snug tracking-[0.16em] text-muted md:text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel id="views">
        <p className="eyebrow">{beaumonte.views.eyebrow}</p>
        <Title>{beaumonte.views.title}</Title>
        <p className="mt-4 text-sm leading-relaxed text-cream/80 md:text-[15px]">{beaumonte.views.lead}</p>
        <div className="mt-5 border-t border-gold/15 pt-4">
          <p className="eyebrow !text-[10px] !text-cream/60">West</p>
          <p className="mt-2 font-serif text-[17px] italic leading-snug text-cream/90 md:text-lg">{beaumonte.views.west}</p>
        </div>
      </Panel>

      <Panel id="facts">
        <div className="flex items-end gap-4">
          <p className="font-serif text-[64px] font-light leading-[0.8] text-gold-light md:text-[88px]">{beaumonte.tower41.value}</p>
          <div className="pb-1">
            <p className="eyebrow">{beaumonte.tower41.label}</p>
            <p className="mt-1 text-sm text-cream/70">{beaumonte.tower41.sub}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 border-t border-gold/15 pt-4 text-sm leading-snug text-cream/85 md:text-[15px]">
          {beaumonte.theTower.slice(1, 3).map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-2 h-px w-3 shrink-0 bg-gold" />
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-gold/15 pt-4">
          <p className="font-serif text-lg leading-tight text-cream md:text-xl">
            {beaumonte.location.title[0]} <span className="italic text-cream/70">{beaumonte.location.title[1]}</span>
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] md:text-[13px]">
            {beaumonte.location.keyConnections.map((c, i) => (
              <div key={c.place} className={`flex justify-between gap-2 border-b border-white/5 pb-1 ${i > 3 ? 'hidden md:flex' : ''}`}>
                <dt className="text-cream/70">{c.place}</dt>
                <dd className="shrink-0 text-gold-light">{c.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[10px] text-muted">{beaumonte.location.note}</p>
        </div>
      </Panel>

      <Panel id="amenities">
        <p className="eyebrow">{beaumonte.amenities.eyebrow}</p>
        <Title>{beaumonte.amenities.title}</Title>
        <p className="mt-3 text-sm text-cream/80 md:text-[15px]">{beaumonte.theExperience[3]}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {beaumonte.amenities.aquatique.map((a) => (
            <span key={a} className="rounded-full border border-gold/25 px-3 py-1.5 text-[11px] tracking-wide text-cream/85">
              {a}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-gold/15 pt-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="mr-2 font-serif text-2xl normal-case tracking-normal text-gold-light">{beaumonte.amenities.total.value}</span>
            {beaumonte.amenities.total.label}
          </p>
          <button type="button" className="btn btn-gold" onClick={enterPool}>
            View the pool
          </button>
        </div>
      </Panel>

      <Panel id="vision">
        <p className="eyebrow">{beaumonte.tagline}</p>
        <Title>{vision.title.charAt(0) + vision.title.slice(1).toLowerCase()}</Title>
        <p className="mt-4 text-sm leading-relaxed text-cream/80 md:text-[15px]">{vision.body[0]}</p>
        <dl className="mt-5 hidden space-y-3 border-t border-gold/15 pt-4 md:block">
          {beaumonte.partners.map((p) => (
            <div key={p.role}>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-muted">{p.role}</dt>
              <dd className="mt-0.5 text-[14px] text-cream/90">{p.name}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
