'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { towerFacts } from '@/content';
import { useStore } from '@/store';
import { chamferedRect, FLOOR_H, floorToY, TOWER } from './towerSpec';

const MIN = towerFacts.firstHabitableLevel;
const MAX = towerFacts.topLevel;
const BOX = new THREE.Box3(
  new THREE.Vector3(TOWER.cx - TOWER.w / 2 - 0.6, floorToY(MIN), TOWER.cz - TOWER.d / 2 - 0.6),
  new THREE.Vector3(TOWER.cx + TOWER.w / 2 + 0.6, floorToY(MAX + 1), TOWER.cz + TOWER.d / 2 + 0.6),
);
const TAP_SLOP = 8;

const isInteractive = (el: EventTarget | null) =>
  el instanceof Element && !!el.closest('button, a, input, select, textarea, label, [role="dialog"], .glass, .glass-strong');

/** A gold band that follows the cursor up the tower; click or tap it to fly to that floor. */
export default function TowerPicker() {
  const get = useThree((s) => s.get);
  const band = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const hover = useRef({ level: 0, alpha: 0, y: 0 });

  const geo = useMemo(() => {
    const ring = (scale: number) => chamferedRect(TOWER.w * scale, TOWER.d * scale, TOWER.chamfer * scale).map(([x, z]) => new THREE.Vector2(x, -z));
    const shape = new THREE.Shape(ring(1.06));
    shape.holes.push(new THREE.Path(ring(1.0).reverse()));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.translate(TOWER.cx, 0, TOWER.cz);
    return g;
  }, []);

  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const tip = document.createElement('div');
    tip.className = 'glass tower-tip';
    tip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tip);
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let downAt: { x: number; y: number; t: number } | null = null;
    let shownLevel = 0;
    const last = { x: -1, y: -1, mouse: false };

    const pick = (x: number, y: number) => {
      const { camera } = get();
      ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectBox(BOX, hit)) return 0;
      return THREE.MathUtils.clamp(Math.floor(hit.y / FLOOR_H), MIN, MAX);
    };
    const active = () => {
      const s = useStore.getState();
      return s.sceneReady && s.mode === 'scroll' && !s.flying;
    };
    const show = (level: number, x: number, y: number) => {
      if (!level && !hover.current.level) return;
      hover.current.level = level;
      if (!level) {
        tip.style.opacity = '0';
        document.documentElement.style.cursor = '';
        shownLevel = 0;
        return;
      }
      document.documentElement.style.cursor = 'pointer';
      if (level !== shownLevel) {
        tip.innerHTML = `<span class="eyebrow">Level ${level}</span><span>${coarse ? 'Tap' : 'Click'} to step inside</span>`;
        shownLevel = level;
      }
      tip.style.opacity = '1';
      tip.style.transform = `translate3d(${Math.min(x + 18, window.innerWidth - 190)}px, ${y - 22}px, 0)`;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      last.x = e.clientX;
      last.y = e.clientY;
      last.mouse = true;
      if (!active() || isInteractive(e.target)) return show(0, 0, 0);
      show(pick(e.clientX, e.clientY), e.clientX, e.clientY);
    };
    const down = (e: PointerEvent) => {
      downAt = active() && !isInteractive(e.target) ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    };
    const up = (e: PointerEvent) => {
      if (!downAt || !active()) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const quick = performance.now() - downAt.t < 450;
      downAt = null;
      if (moved > TAP_SLOP || !quick) return;
      const level = pick(e.clientX, e.clientY);
      if (!level) return;
      show(0, 0, 0);
      useStore.getState().enterFloor(level);
    };
    const leave = () => {
      last.mouse = false;
      show(0, 0, 0);
    };
    // the tower slides under a still cursor as the journey scrolls: re-pick against the last position
    const onScroll = () => {
      if (!last.mouse || !active()) return show(0, 0, 0);
      const el = document.elementFromPoint(last.x, last.y);
      show(isInteractive(el) ? 0 : pick(last.x, last.y), last.x, last.y);
    };
    const unsub = useStore.subscribe((cur, prev) => {
      if (cur.progress !== prev.progress || cur.mode !== prev.mode || cur.flying !== prev.flying) onScroll();
    });

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);
    return () => {
      unsub();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.style.cursor = '';
      tip.remove();
    };
  }, [get]);

  useFrame((_, delta) => {
    const h = hover.current;
    const want = h.level && useStore.getState().mode === 'scroll' ? 1 : 0;
    h.alpha = THREE.MathUtils.damp(h.alpha, want, 10, delta);
    if (h.level) h.y = h.alpha < 0.05 ? floorToY(h.level) : THREE.MathUtils.damp(h.y, floorToY(h.level), 18, delta);
    if (band.current && mat.current) {
      band.current.visible = h.alpha > 0.01;
      band.current.position.y = h.y + FLOOR_H * 0.45;
      mat.current.opacity = h.alpha * 0.9;
    }
  });

  return (
    <mesh ref={band} geometry={geo} visible={false} renderOrder={4}>
      <meshBasicMaterial ref={mat} color={new THREE.Color('#e6c88f').multiplyScalar(1.6)} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}
