'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { applyFog, applyRain, applyTime, syncWeather, U, W } from './weather';
import Sky from './Sky';
import Tower from './Tower';
import AmenityDeck from './AmenityDeck';
import City from './City';
import Sea, { Ground } from './Sea';
import Clouds from './Clouds';
import SeaLink from './SeaLink';
import Rain from './Rain';
import CameraRig from './CameraRig';
import FloorInterior from './FloorInterior';
import TowerPicker from './TowerPicker';

const Effects = lazy(() => import('./Effects'));

function detectLowTier() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  return cores <= 4 || mem <= 4 || window.innerWidth < 768;
}

/** Drives lights, fog and shared uniforms from the tweened weather state. */
function WeatherDriver() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  useEffect(() => {
    const { time, weather, fog } = useStore.getState();
    applyTime(time, true);
    applyRain(weather === 'monsoon', true);
    applyFog(fog, true);
    return useStore.subscribe((cur, prev) => {
      if (cur.time !== prev.time) applyTime(cur.time);
      if (cur.weather !== prev.weather) applyRain(cur.weather === 'monsoon');
      if (cur.fog !== prev.fog) applyFog(cur.fog);
    });
  }, []);

  useFrame(({ clock, scene: sc }) => {
    if (sc.fog instanceof THREE.Fog) syncWeather(clock.elapsedTime, sc.fog);
    sc.environmentIntensity = W.nums.envIntensity;
    if (sun.current) {
      sun.current.position.copy(U.uSunDir.value).multiplyScalar(800);
      sun.current.color.copy(W.cols.sunColor);
      sun.current.intensity = W.nums.sunIntensity * Math.max(0.15, Math.min(1, U.uSunDir.value.y * 6 + 0.4));
    }
    if (hemi.current) {
      hemi.current.color.copy(W.cols.skyHorizon);
      hemi.current.groundColor.copy(W.cols.groundColor);
      hemi.current.intensity = W.nums.ambient * 1.4;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#e2ae92', 500, 7000]} />
      <directionalLight ref={sun} />
      <hemisphereLight ref={hemi} />
    </>
  );
}

/**
 * Dynamic resolution: when frame times climb, render fewer pixels (smoothly, in steps),
 * and if the device keeps struggling drop to the low tier for good.
 */
function PerfGovernor({ maxDpr }: { maxDpr: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const setTier = useStore((s) => s.setTier);
  return (
    <PerformanceMonitor
      flipflops={3}
      onChange={({ factor }) => setDpr(Math.round((1 + (maxDpr - 1) * factor) * 4) / 4)}
      onFallback={() => setTier('low')}
      onDecline={({ factor }) => factor < 0.3 && setTier('low')}
    />
  );
}

/** Reports load progress and flags the scene ready after a few rendered frames. */
function ReadyReporter() {
  const { progress } = useProgress();
  const frames = useRef(0);
  useEffect(() => {
    useStore.getState().setLoadProgress(progress);
  }, [progress]);
  useFrame(() => {
    frames.current++;
    if (frames.current === 6) useStore.getState().setSceneReady();
  });
  return null;
}

export default function Experience() {
  const tier = useStore((s) => s.tier);
  const setTier = useStore((s) => s.setTier);

  useEffect(() => {
    if (detectLowTier()) setTier('low');
  }, [setTier]);

  const high = tier === 'high';
  useEffect(() => {
    document.documentElement.dataset.tier = tier;
  }, [tier]);

  return (
    <Canvas
      dpr={high ? [1, 1.5] : [1, 1.25]}
      gl={{ antialias: !high, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 42, near: 1, far: 16000, position: [190, 196, 285] }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
    >
      <PerfGovernor maxDpr={high ? 1.5 : 1.25} />
      <WeatherDriver />
      <ReadyReporter />
      <Environment resolution={64} frames={1}>
        <Lightformer form="ring" intensity={2} color="#ffd9a8" scale={20} position={[0, 2, -10]} />
        <Lightformer intensity={1.2} color="#cfe0ff" scale={[40, 10, 1]} position={[0, 10, 0]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={0.6} color="#ffffff" scale={[20, 4, 1]} position={[10, 1, 5]} rotation-y={-Math.PI / 2} />
      </Environment>
      <Sky />
      <Ground />
      <Sea />
      <City />
      <SeaLink />
      <Tower />
      <AmenityDeck />
      <FloorInterior />
      <TowerPicker />
      <Clouds />
      <Rain />
      <CameraRig />
      {high && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
    </Canvas>
  );
}
