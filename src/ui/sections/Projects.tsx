'use client';

import { projects, vision } from '@/content';
import { goToSection } from '@/store';
import Section from './Section';
import { ArrowIcon } from '../icons';

export default function Projects() {
  return (
    <Section id="projects" eyebrow="Projects" title={<>{vision.title.charAt(0) + vision.title.slice(1).toLowerCase()}</>} wide>
      <div className="mt-5 max-w-2xl space-y-3 text-[15px] leading-relaxed text-cream/80">
        {vision.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-[14px] border border-gold/15 bg-black/20 p-6 transition-colors duration-500 hover:border-gold/40"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-3xl tracking-wide text-cream sm:text-[34px]">{p.name}</h3>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{p.location}</span>
            </div>
            {p.status && (
              <span className="mt-3 w-fit rounded-full border border-gold/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold-light">
                {p.status}
              </span>
            )}
            <div className="mt-4 flex-1 space-y-3 text-[14px] leading-relaxed text-cream/75">
              {p.body.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </div>
            {p.cta.href.startsWith('#') ? (
              <button type="button" onClick={() => goToSection(p.cta.href.slice(1))} className="btn btn-ghost mt-6 w-fit">
                {p.cta.label}
              </button>
            ) : (
              <a href={p.cta.href} target="_blank" rel="noreferrer" className="btn btn-gold mt-6 w-fit">
                {p.cta.label} <ArrowIcon className="h-4 w-4" />
              </a>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
