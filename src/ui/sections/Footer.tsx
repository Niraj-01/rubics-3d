'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { beaumonte, brand, disclaimer, footer, privacyPolicy, type LegalDoc } from '@/content';
import { getLenis } from '@/store';
import { CloseIcon, SocialIcon } from '../icons';

function LegalModal({ doc, onClose }: { doc: LegalDoc | null; onClose: () => void }) {
  useEffect(() => {
    if (!doc) return;
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      getLenis()?.start();
    };
  }, [doc, onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 transition-opacity duration-500 sm:items-center sm:p-8"
      style={{ opacity: doc ? 1 : 0, pointerEvents: doc ? 'auto' : 'none' }}
      onClick={onClose}
      aria-hidden={!doc}
    >
      {doc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={doc.title}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent
          className="glass-strong relative max-h-[85svh] w-full max-w-2xl animate-[fadeUp_0.6s_cubic-bezier(0.22,1,0.36,1)] overflow-y-auto overscroll-contain p-6 sm:p-10"
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost sticky top-0 float-right !h-11 !w-11 !p-0"
            aria-label="Close"
            autoFocus
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <h2 className="font-serif text-4xl font-light text-cream">{doc.title}</h2>
          <p className="mt-5 text-[14px] leading-relaxed text-cream/80">{doc.intro}</p>
          {doc.sections.map((s) => (
            <div key={s.heading} className="mt-6">
              <h3 className="font-serif text-xl text-gold-light">{s.heading}</h3>
              {s.body && <p className="mt-2 text-[14px] leading-relaxed text-cream/75">{s.body}</p>}
              {s.list && (
                <ul className="mt-2 space-y-2 text-[14px] leading-relaxed text-cream/75">
                  {s.list.map((l) => (
                    <li key={l.lead}>
                      <strong className="font-medium text-cream">{l.lead}</strong> {l.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const [doc, setDoc] = useState<LegalDoc | null>(null);

  return (
    <footer className="relative px-4 pb-6 pt-[10vh] sm:px-8 md:px-[6vw]">
      <div className="glass-strong p-6 pb-28 sm:p-10 sm:pb-28">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Image src={brand.logo} alt="Rubics" width={140} height={29} className="h-6 w-auto" />
            <p className="mt-3 font-serif text-lg italic text-cream/70">{brand.tagline}</p>
            <p className="eyebrow mt-8">{footer.company}</p>
            <address className="mt-3 space-y-1.5 text-[14px] not-italic leading-relaxed text-cream/80">
              <p>{footer.address}</p>
              <p>
                Email:{' '}
                <a href={`mailto:${footer.email}`} className="link-gold">
                  {footer.email}
                </a>
              </p>
              <p>
                {footer.phoneLabel}:{' '}
                <a href={`tel:${footer.phone.replace(/[^+\d]/g, '')}`} className="link-gold">
                  {footer.phone}
                </a>
              </p>
            </address>
          </div>

          <div>
            <p className="eyebrow">
              {beaumonte.name} · {beaumonte.tower}
            </p>
            <div className="mt-3 space-y-1.5 text-[14px] leading-relaxed text-cream/80">
              <p>
                <a href={`tel:${beaumonte.contact.phone.replace(/\s/g, '')}`} className="link-gold">
                  {beaumonte.contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${beaumonte.contact.email}`} className="link-gold">
                  {beaumonte.contact.email}
                </a>
              </p>
              <p>{beaumonte.contact.salesOffice}</p>
            </div>
          </div>

          <div>
            <p className="eyebrow">{beaumonte.rera.label}</p>
            <p className="mt-3 font-serif text-2xl text-cream">{beaumonte.rera.number}</p>
            <a href={beaumonte.rera.url} target="_blank" rel="noreferrer" className="link-gold mt-2 inline-block text-[13px] text-cream/70">
              maharera.maharashtra.gov.in
            </a>
            <div className="mt-6 flex gap-2">
              {footer.social.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="btn btn-ghost !h-11 !w-11 !p-0"
                >
                  <SocialIcon id={s.id} className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-10 text-[11px] leading-relaxed text-muted">{footer.projectDisclaimer}</p>

        <div className="mt-6 flex flex-col gap-3 border-t border-gold/15 pt-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.poweredBy}</p>
          <div className="flex items-center gap-4">
            <span>{footer.copyright}</span>
            <button type="button" onClick={() => setDoc(privacyPolicy)} className="link-gold focus-ring min-h-11">
              Privacy Policy
            </button>
            <button type="button" onClick={() => setDoc(disclaimer)} className="link-gold focus-ring min-h-11">
              Disclaimer
            </button>
          </div>
        </div>
      </div>
      <LegalModal doc={doc} onClose={() => setDoc(null)} />
    </footer>
  );
}
