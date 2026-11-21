import { media } from '@/content';
import Section from './Section';
import { ArrowIcon } from '../icons';

export default function Media() {
  return (
    <Section id="media" eyebrow={media.title} title={media.subtitle} wide>
      <ul className="mt-7 divide-y divide-gold/10 border-y border-gold/10">
        {media.items.map((m) => (
          <li key={m.url}>
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring group grid gap-1 py-5 transition-colors sm:grid-cols-[150px_1fr_auto] sm:gap-6"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted">
                <p className="text-gold">{m.source}</p>
                <p className="mt-1">{m.date}</p>
              </div>
              <div>
                <h3 className="font-serif text-xl leading-snug text-cream transition-colors duration-300 group-hover:text-gold-light sm:text-[22px]">
                  {m.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-cream/65">{m.description}</p>
              </div>
              <ArrowIcon className="hidden h-5 w-5 self-center text-gold transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
            </a>
          </li>
        ))}
      </ul>
      <a href={media.allUrl} target="_blank" rel="noreferrer" className="btn btn-ghost mt-7">
        View all media <ArrowIcon className="h-4 w-4" />
      </a>
    </Section>
  );
}
