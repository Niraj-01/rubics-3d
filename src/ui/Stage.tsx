'use client';

import dynamic from 'next/dynamic';

const Experience = dynamic(() => import('@/scene/Experience'), { ssr: false });

/** Fixed full-screen canvas behind everything, plus the cloud whiteout and debug overlays. */
export default function Stage() {
  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden>
        <Experience />
      </div>
      <div id="whiteout" className="pointer-events-none fixed inset-0 z-[1]" style={{ opacity: 0 }} aria-hidden />
      <pre
        id="debug"
        className="pointer-events-none fixed left-3 top-24 z-[60] whitespace-pre font-mono text-[11px] leading-4 text-gold-light empty:hidden"
      />
    </>
  );
}
