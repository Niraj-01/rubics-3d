'use client';

import { useEffect, useState } from 'react';
import { floorInfo, towerFacts } from '@/content';
import { useStore } from '@/store';
import { BackIcon, ChevronDown, ChevronUp, CloseIcon, LayersIcon } from './icons';

const MIN = towerFacts.eDeckLevel;
const MAX = towerFacts.topLevel;

/** "Choose your floor": pick a level, then fly up the facade to the view from outside it. */
export default function FloorPicker() {
  const mode = useStore((s) => s.mode);
  const floor = useStore((s) => s.floor);
  const setFloor = useStore((s) => s.setFloor);
  const enterFloor = useStore((s) => s.enterFloor);
  const enterPool = useStore((s) => s.enterPool);
  const backToTower = useStore((s) => s.backToTower);
  const [open, setOpen] = useState(false);
  // while flying between floors, the slider holds a draft until release
  const [draft, setDraft] = useState<number | null>(null);

  // keep the picker open while exploring a floor
  const visible = (open && mode !== 'pool') || mode === 'floor';
  const shown = draft ?? floor;
  const info = floorInfo(shown);
  const fill = ((shown - MIN) / (MAX - MIN)) * 100;

  const step = (d: number) => {
    const next = Math.min(MAX, Math.max(MIN, floor + d));
    if (mode === 'floor' && next !== MIN) enterFloor(next);
    else setFloor(next);
  };

  const commitDraft = () => {
    if (draft === null) return;
    setDraft(null);
    if (draft === MIN) enterPool();
    else enterFloor(draft);
  };

  const enter = () => {
    if (floor === MIN) enterPool();
    else enterFloor(floor);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'floor') backToTower();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, mode, backToTower]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost glass fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-4 z-30 !rounded-full !border-gold/30 transition-all duration-500 max-sm:h-[54px] max-sm:w-[68px] max-sm:flex-col max-sm:gap-1 max-sm:px-0 max-sm:text-[9px] max-sm:tracking-[0.18em] sm:bottom-8 sm:right-8"
        style={{ opacity: visible || mode === 'pool' ? 0 : 1, pointerEvents: visible || mode === 'pool' ? 'none' : 'auto' }}
        aria-haspopup="dialog"
      >
        <LayersIcon className="h-[18px] w-[18px] text-gold-light" />
        <span className="hidden sm:inline">Choose your floor</span>
        <span className="leading-none sm:hidden">Floors</span>
      </button>

      <div
        role="dialog"
        aria-label="Choose your floor"
        aria-hidden={!visible}
        className="glass-strong fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 p-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-auto sm:bottom-8 sm:right-8 sm:w-[360px] sm:p-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateY(${visible ? 0 : 14}px)`,
          filter: visible ? 'none' : 'blur(6px)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="flex items-start justify-between">
          <p className="eyebrow">Choose your floor</p>
          {mode !== 'floor' && (
            <button
              type="button"
              tabIndex={visible ? 0 : -1}
              onClick={() => setOpen(false)}
              className="focus-ring -mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full text-cream/70 hover:text-cream active:scale-[0.97]"
              aria-label="Close floor picker"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-serif text-[44px] font-light leading-none text-cream sm:text-5xl">
              {shown === MIN ? (
                <>Level 6 <span className="text-2xl italic text-gold-light">deck</span></>
              ) : (
                <>Level <span className="text-gold-light">{shown}</span></>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              tabIndex={visible ? 0 : -1}
              onClick={() => step(1)}
              disabled={floor >= MAX}
              className="btn btn-ghost !h-11 !w-11 !p-0 disabled:opacity-30"
              aria-label="Up one level"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              tabIndex={visible ? 0 : -1}
              onClick={() => step(-1)}
              disabled={floor <= (mode === 'floor' ? MIN + 1 : MIN)}
              className="btn btn-ghost !h-11 !w-11 !p-0 disabled:opacity-30"
              aria-label="Down one level"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        <input
          type="range"
          min={MIN}
          max={MAX}
          value={shown}
          tabIndex={visible ? 0 : -1}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (mode === 'floor') setDraft(v);
            else setFloor(v);
          }}
          onPointerUp={commitDraft}
          onKeyUp={commitDraft}
          onBlur={commitDraft}
          className={`gold-range mt-3 ${mode === 'floor' ? 'hidden sm:block' : ''}`}
          style={{ ['--fill' as string]: `${fill}%` }}
          aria-label="Level"
          aria-valuetext={info.title}
        />
        <div className={`justify-between text-[10px] uppercase tracking-[0.2em] text-muted ${mode === 'floor' ? 'hidden sm:flex' : 'flex'}`}>
          <span>Deck · 6</span>
          <span>{MAX}</span>
        </div>

        <ul className={`mt-4 space-y-1.5 border-t border-gold/15 pt-4 text-[13px] leading-snug text-cream/85 ${mode === 'floor' ? 'hidden sm:block' : ''}`}>
          {info.lines.map((l) => (
            <li key={l} className="flex gap-3">
              <span className="mt-2 h-px w-3 shrink-0 bg-gold" />
              {l}
            </li>
          ))}
        </ul>

        <div className={`flex gap-2 ${mode === 'floor' ? 'mt-3 sm:mt-5' : 'mt-5'}`}>
          {mode === 'floor' ? (
            <button type="button" tabIndex={visible ? 0 : -1} onClick={() => {
                backToTower();
                setOpen(false);
              }}
              className="btn btn-ghost flex-1">
              <BackIcon className="h-4 w-4" /> Back to tower
            </button>
          ) : (
            <button type="button" tabIndex={visible ? 0 : -1} onClick={enter} className="btn btn-gold flex-1">
              {floor === MIN ? 'View the pool' : `Enter level ${floor}`}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
