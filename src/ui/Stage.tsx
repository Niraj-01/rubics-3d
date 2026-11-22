'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store';

const Experience = dynamic(() => import('@/scene/Experience'), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Still image of the tower at sunrise, for browsers that can't run the 3D scene. */
function Fallback() {
  useEffect(() => {
    useStore.getState().setSceneReady();
  }, []);
  const fins = Array.from({ length: 9 }, (_, i) => 612 + i * 22);
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#33497a_0%,#8a5a6a_45%,#e2ae92_78%,#6b5f58_100%)]">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="fb-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#6b4a2c" />
            <stop offset="0.45" stopColor="#c9a96e" />
            <stop offset="1" stopColor="#3a2a1c" />
          </linearGradient>
        </defs>
        <rect x="440" y="900" width="420" height="100" fill="#4a3f3a" />
        <rect x="600" y="190" width="200" height="720" fill="url(#fb-gold)" />
        {fins.map((x) => (
          <rect key={x} x={x} y={150 + Math.abs(x - 700) * 0.5} width="5" height={760 - Math.abs(x - 700) * 0.5} fill="#2b1f14" opacity="0.55" />
        ))}
        <rect x="0" y="880" width="1000" height="120" fill="#e9d6c4" opacity="0.55" />
      </svg>
    </div>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

/** Fixed full-screen canvas behind everything, plus the cloud whiteout, vignette and debug overlays. */
export default function Stage() {
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability probe, client only
    setGl(hasWebGL());
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden>
        {gl === false ? (
          <Fallback />
        ) : gl ? (
          <SceneBoundary>
            <Experience />
          </SceneBoundary>
        ) : null}
      </div>
      <div id="whiteout" className="pointer-events-none fixed inset-0 z-[1]" style={{ opacity: 0 }} aria-hidden />
      {/* soft lens vignette: draws the eye to the middle of the frame, costs nothing per frame */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,rgba(8,6,4,0.42)_100%)]"
        aria-hidden
      />
      <pre
        id="debug"
        className="pointer-events-none fixed left-3 top-24 z-[60] whitespace-pre font-mono text-[11px] leading-4 text-gold-light empty:hidden"
      />
    </>
  );
}
