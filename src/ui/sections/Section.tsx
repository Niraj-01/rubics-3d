import type { ReactNode } from 'react';

/** A glass panel in the normal page flow, with open space around it so the 3D stays in view. */
export default function Section({
  id,
  eyebrow,
  title,
  children,
  wide = false,
}: {
  id: string;
  eyebrow?: string;
  title?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 px-4 py-[14vh] sm:px-8 md:px-[6vw]">
      <div className={`glass p-6 sm:p-9 ${wide ? 'md:max-w-[min(980px,64vw)]' : 'md:max-w-[min(620px,52vw)]'}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="mt-3 font-serif text-[34px] font-light leading-[1.05] text-cream sm:text-5xl">{title}</h2>}
        {children}
      </div>
    </section>
  );
}
