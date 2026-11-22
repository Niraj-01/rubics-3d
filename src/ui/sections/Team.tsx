'use client';

import { useState } from 'react';
import Image from 'next/image';
import { legacy } from '@/content';
import Section from './Section';
import { ChevronDown } from '../icons';

export default function Team() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Section id="legacy" eyebrow={legacy.subtitle} title={<>Led by <em className="text-gold-light">legacy</em></>} wide>
      <div className="mt-5 max-w-2xl space-y-2 text-[15px] leading-relaxed text-cream/80">
        {legacy.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
      </div>
      <div className="mt-8 grid items-start gap-4 md:grid-cols-3">
        {legacy.team.map((m) => {
          const isOpen = open === m.name;
          return (
            <article key={m.name} className="group overflow-hidden rounded-[14px] border border-gold/15 bg-black/25 transition-colors duration-500 hover:border-gold/35">
              {/* the portrait stays clear: no text or gradient over the face */}
              <div className="relative aspect-square overflow-hidden bg-black/40 md:aspect-[4/5]">
                <Image
                  src={m.photo}
                  alt={`${m.name}, ${m.role}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover object-[50%_18%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
              <div className="border-t border-gold/15 px-4 pb-1 pt-4">
                <h3 className="font-serif text-2xl leading-tight text-cream">{m.name}</h3>
                <p className="mt-1.5 text-[11px] uppercase leading-snug tracking-[0.16em] text-gold-light">{m.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : m.name)}
                aria-expanded={isOpen}
                className="focus-ring flex min-h-12 w-full items-center justify-between px-4 text-[11px] uppercase tracking-[0.2em] text-cream/80 transition-colors hover:text-gold-light active:scale-[0.99]"
              >
                {isOpen ? 'Close bio' : 'Read bio'}
                <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 px-4 pb-5 text-[13.5px] leading-relaxed text-cream/75">
                    {m.bio.map((b) => (
                      <p key={b}>{b}</p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
