'use client';

import { useState } from 'react';
import Image from 'next/image';
import { about } from '@/content';
import Section from './Section';

export default function About() {
  const [active, setActive] = useState(about.tabs[0].id);
  const tab = about.tabs.find((t) => t.id === active)!;

  return (
    <Section id="about" eyebrow="About Rubics" title={<>About Rubics <em className="text-gold-light">Realty</em></>} wide>
      <div className="mt-5 max-w-2xl space-y-3 text-[15px] leading-relaxed text-cream/80">
        {about.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
      </div>

      <div
        role="tablist"
        aria-label="About Rubics"
        data-lenis-prevent-horizontal
        className="-mx-6 mt-8 flex gap-1 overflow-x-auto border-b border-gold/15 px-6 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {about.tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={`focus-ring relative min-h-12 shrink-0 px-3 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
              active === t.id ? 'text-gold-light' : 'text-cream/60 hover:text-cream'
            }`}
          >
            {t.label}
            <span
              className={`absolute inset-x-3 -bottom-px h-px bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active === t.id ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        ))}
      </div>

      <div key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="animate-[fadeUp_0.7s_cubic-bezier(0.22,1,0.36,1)] pt-7">
        <p className="eyebrow !text-cream/50">{tab.title}</p>

        {'quote' in tab && tab.quote ? (
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-[12px] border border-gold/20">
              <Image src={tab.photo!} alt="Suhan Shetty" fill sizes="128px" className="object-cover object-top" />
            </div>
            <blockquote>
              <p className="font-serif text-[28px] font-light leading-[1.15] text-cream sm:text-4xl">
                “{tab.quote[0]}
                <br />
                <em className="text-gold-light">{tab.quote[1]}”</em>
              </p>
              <footer className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted">{tab.attribution}</footer>
            </blockquote>
          </div>
        ) : (
          <div className="mt-4 max-w-2xl space-y-2 font-serif text-[21px] font-light leading-snug text-cream/90 sm:text-2xl">
            {tab.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}

        {'items' in tab && tab.items && (
          <>
            <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {tab.items.map((it) => (
                <div key={it.title} className="border-t border-gold/15 pt-3">
                  <h3 className="font-serif text-xl text-cream">{it.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-cream/70">{it.body}</p>
                </div>
              ))}
            </div>
            <p className="eyebrow mt-10 !text-cream/50">{tab.lifestyleTitle}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              {tab.lifestyle.map((it) => (
                <div key={it.title} className="border-t border-gold/15 pt-3">
                  <h3 className="font-serif text-xl text-gold-light">{it.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-cream/70">{it.body}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
