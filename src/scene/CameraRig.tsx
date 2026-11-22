'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { easing } from 'maath';
import { useStore, type Mode } from '@/store';
import { samplePath } from './cameraPath';
import { W } from './weather';
import { DECK_Y, floorToY, POOL, TOWER, TOWER_WEST_X } from './towerSpec';

const OPENING_CLOUD_Y = 115;
const FOG_SEA_Y = 32;
const ORBIT_CENTER = new THREE.Vector3(TOWER.cx, 0, TOWER.cz);
const TOWER_AXIS = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const tmpDir = new THREE.Vector3();
const tmpRight = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const deg = THREE.MathUtils.degToRad;
/** How far you can turn your head in floor and pool views. */
const LOOK_YAW = deg(55);
const LOOK_PITCH = deg(20);

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isInteractive = (el: EventTarget | null) =>
  el instanceof Element && !!el.closest('button, a, input, select, textarea, label, [role="dialog"], .glass, .glass-strong');

type Flight = { pos: THREE.CatmullRomCurve3; target: THREE.CatmullRomCurve3 };

function floorView(level: number) {
  const y = floorToY(level) + 1.6;
  // standing inside the floor, a few steps back from the glass
  const pos = new THREE.Vector3(TOWER_WEST_X + 3.4, y, TOWER.cz + 3);
  // look west toward the sea, slightly down so higher floors reveal more city and water
  const target = pos.clone().add(new THREE.Vector3(-120, -8 - y * 0.05, -12));
  return { pos, target };
}

/** A point just outside the west glass at height y, for leaving and re-entering a floor. */
const outside = (y: number, off = 9) => new THREE.Vector3(TOWER_WEST_X - off, y, TOWER.cz + 6);

const POOL_VIEW = {
  pos: new THREE.Vector3(POOL.cx - 44, DECK_Y + 15, POOL.cz + 34),
  target: new THREE.Vector3(POOL.cx + 4, DECK_Y, POOL.cz - 3),
};

const finePointer = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export default function CameraRig() {
  const get = useThree((s) => s.get);

  const state = useRef({
    sp: 0, // smoothed journey progress
    orbit: 0, // accumulated idle orbit angle after the journey
    flying: false,
    manual: false, // camera driven by a flight / floor / pool view
    desiredPos: new THREE.Vector3(190, 196, 285),
    desiredTarget: new THREE.Vector3(TOWER.cx, 150, 0),
    lookAt: new THREE.Vector3(TOWER.cx, 150, 0),
    pathPos: new THREE.Vector3(),
    pathTarget: new THREE.Vector3(),
    shift: 0,
    tween: null as gsap.core.Tween | null,
    // head-turn on top of whatever the camera is looking at: drag / tilt in floor and pool views, cursor parallax on the journey
    yaw: 0,
    pitch: 0,
    wantYaw: 0,
    wantPitch: 0,
    dragYaw: 0,
    dragPitch: 0,
    tiltYaw: 0,
    tiltPitch: 0,
    mouseX: 0,
    mouseY: 0,
  });
  const debugEl = useRef<HTMLElement | null>(null);
  const whiteoutEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const debug = new URLSearchParams(window.location.search).has('debug');
    debugEl.current = debug ? document.getElementById('debug') : null;
    if (debug) {
      // jump straight to a journey position (skips damping) for tuning keyframes
      (window as unknown as { __snap: (p: number) => void }).__snap = (p: number) => {
        const s = state.current;
        const cam = get().camera;
        s.sp = p;
        samplePath(p, cam.position, s.lookAt);
        s.desiredPos.copy(cam.position);
        s.desiredTarget.copy(s.lookAt);
      };
    }
    whiteoutEl.current = document.getElementById('whiteout');
    get().camera.position.set(190, 196, 285);
  }, [get]);

  // Mode changes start GSAP flights.
  useEffect(() => {
    const fly = (flight: Flight, duration: number, onDone?: () => void) => {
      const s = state.current;
      const reduce = reducedMotion();
      s.tween?.kill();
      s.flying = true;
      s.manual = true;
      s.dragYaw = s.dragPitch = 0;
      useStore.getState().setFlying(true);
      const o = { u: 0 };
      s.tween = gsap.to(o, {
        u: 1,
        duration: reduce ? duration * 0.5 : duration,
        ease: reduce ? 'power2.inOut' : 'expo.inOut',
        onUpdate: () => {
          flight.pos.getPoint(o.u, s.desiredPos);
          flight.target.getPoint(o.u, s.desiredTarget);
        },
        onComplete: () => {
          s.flying = false;
          useStore.getState().setFlying(false);
          onDone?.();
        },
      });
    };

    // a tiny tap of haptics on arrival, where the phone supports it
    const buzz = () => {
      try {
        navigator.vibrate?.(12);
      } catch {}
    };

    const startFlight = (mode: Mode, prevMode: Mode, floor: number) => {
      const s = state.current;
      const start = get().camera.position.clone();
      const startT = s.lookAt.clone();
      if (mode === 'floor') {
        const end = floorView(floor);
        let posPts: THREE.Vector3[];
        let tgtPts: THREE.Vector3[];
        if (prevMode === 'floor') {
          // floor to floor: step out through the glass, slide along the facade, step back in
          const midY = (start.y + end.pos.y) / 2;
          posPts = [start, outside(start.y), new THREE.Vector3(TOWER_WEST_X - 18, midY, TOWER.cz + 12), outside(end.pos.y), end.pos];
          tgtPts = [startT, startT.clone().setY(start.y - 6), new THREE.Vector3(-200, midY - 20, -10), end.target, end.target];
        } else {
          // approach the west face low, then rise hugging the facade to the chosen floor
          const approachY = THREE.MathUtils.clamp(Math.min(start.y, end.pos.y), DECK_Y + 12, 120);
          const a = new THREE.Vector3(TOWER_WEST_X - 46, approachY, TOWER.cz + 34);
          const b = new THREE.Vector3(TOWER_WEST_X - 13, THREE.MathUtils.lerp(approachY, end.pos.y, 0.7), TOWER.cz + 12);
          // ...and finally step through the glass onto the floor
          posPts = [start, a, b, outside(end.pos.y, 7), end.pos];
          tgtPts = [
            startT,
            new THREE.Vector3(TOWER.cx, approachY + 12, TOWER.cz),
            new THREE.Vector3(TOWER.cx, end.pos.y + 14, TOWER.cz),
            new THREE.Vector3(TOWER.cx, end.pos.y + 2, TOWER.cz),
            end.target,
          ];
        }
        fly({ pos: new THREE.CatmullRomCurve3(posPts, false, 'centripetal'), target: new THREE.CatmullRomCurve3(tgtPts) }, prevMode === 'floor' ? 2.4 : 3, buzz);
      } else if (mode === 'pool') {
        const mid = start.clone().lerp(POOL_VIEW.pos, 0.5);
        mid.y = Math.max(mid.y, POOL_VIEW.pos.y + 30);
        fly(
          {
            pos: new THREE.CatmullRomCurve3([start, mid, POOL_VIEW.pos.clone()], false, 'centripetal'),
            target: new THREE.CatmullRomCurve3([startT, startT.clone().lerp(POOL_VIEW.target, 0.6), POOL_VIEW.target.clone()]),
          },
          2.4,
          buzz,
        );
      } else {
        // back to the tower: return to the current scroll sample, then hand control back to scroll
        const pos = new THREE.Vector3();
        const tgt = new THREE.Vector3();
        samplePath(s.sp, pos, tgt);
        const mid = start.clone().lerp(pos, 0.5);
        mid.y = Math.max(start.y, pos.y) + 25;
        // leaving a floor: step back out through the glass first
        const exit = prevMode === 'floor' ? [outside(start.y, 12)] : [];
        const exitT = prevMode === 'floor' ? [startT.clone()] : [];
        fly(
          {
            pos: new THREE.CatmullRomCurve3([start, ...exit, mid, pos], false, 'centripetal'),
            target: new THREE.CatmullRomCurve3([startT, ...exitT, startT.clone().lerp(tgt, 0.5), tgt]),
          },
          2.2,
          () => {
            s.manual = false;
          },
        );
      }
    };

    return useStore.subscribe((cur, prev) => {
      if (cur.mode !== prev.mode || (cur.mode === 'floor' && cur.floor !== prev.floor)) {
        startFlight(cur.mode, prev.mode, cur.floor);
      }
    });
  }, [get]);

  // Drag (and phone tilt) to look around in floor and pool views; cursor parallax on the journey.
  useEffect(() => {
    const s = state.current;
    let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
    let tiltBase: { beta: number; gamma: number } | null = null;

    const down = (e: PointerEvent) => {
      if (useStore.getState().mode === 'scroll' || s.flying || isInteractive(e.target)) return;
      drag = { x: e.clientX, y: e.clientY, yaw: s.dragYaw, pitch: s.dragPitch };
    };
    const move = (e: PointerEvent) => {
      s.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      s.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!drag) return;
      const k = Math.PI / Math.max(window.innerWidth, 600);
      s.dragYaw = THREE.MathUtils.clamp(drag.yaw + (e.clientX - drag.x) * k, -LOOK_YAW, LOOK_YAW);
      s.dragPitch = THREE.MathUtils.clamp(drag.pitch + (e.clientY - drag.y) * k * 0.7, -LOOK_PITCH, LOOK_PITCH);
    };
    const up = () => {
      drag = null;
    };
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null || useStore.getState().mode === 'scroll') {
        tiltBase = null;
        s.tiltYaw = s.tiltPitch = 0;
        return;
      }
      tiltBase ??= { beta: e.beta, gamma: e.gamma };
      s.tiltYaw = THREE.MathUtils.clamp(-deg(e.gamma - tiltBase.gamma) * 0.9, -LOOK_YAW, LOOK_YAW);
      s.tiltPitch = THREE.MathUtils.clamp(deg(e.beta - tiltBase.beta) * 0.6, -LOOK_PITCH, LOOK_PITCH);
    };

    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    // Tilt-to-look only where it needs no permission prompt (Android); iOS gets drag.
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const useTilt = coarse && !!DOE && typeof DOE.requestPermission !== 'function';
    if (useTilt) window.addEventListener('deviceorientation', tilt);
    const unsub = useStore.subscribe((cur, prev) => {
      if (cur.mode !== prev.mode || cur.floor !== prev.floor) tiltBase = null;
    });
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (useTilt) window.removeEventListener('deviceorientation', tilt);
      unsub();
    };
  }, []);

  useFrame((frame, rawDelta) => {
    const { clock, size } = frame;
    const camera = frame.camera as THREE.PerspectiveCamera;
    const delta = Math.min(rawDelta, 0.1);
    const s = state.current;
    const { progress, afterJourney } = useStore.getState();
    const t = clock.elapsedTime;

    easing.damp(s, 'sp', progress, 0.25, delta);
    samplePath(s.sp, s.pathPos, s.pathTarget);

    // gentle idle drift before the first scroll
    const calm = reducedMotion();
    const idle = calm ? 0 : 1 - THREE.MathUtils.smoothstep(s.sp, 0, 0.05);
    if (idle > 0) {
      s.pathPos.x += Math.sin(t * 0.21) * 9 * idle;
      s.pathPos.y += Math.sin(t * 0.17) * 4 * idle;
      s.pathPos.z += Math.cos(t * 0.19) * 9 * idle;
    }

    // slow ambient orbit behind the content sections
    const post = afterJourney > 0 ? 1 : 0;
    s.orbit = post ? s.orbit + delta * 0.018 : THREE.MathUtils.damp(s.orbit, 0, 1.5, delta);
    const angle = s.orbit + afterJourney * 0.00022;
    if (angle !== 0) {
      s.pathPos.sub(ORBIT_CENTER).applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle).add(ORBIT_CENTER);
      s.pathTarget.sub(ORBIT_CENTER).applyAxisAngle(THREE.Object3D.DEFAULT_UP, angle).add(ORBIT_CENTER);
    }

    if (!s.manual) {
      s.desiredPos.copy(s.pathPos);
      s.desiredTarget.copy(s.pathTarget);
      // narrow portrait frames lose the tower at the edges; aim closer to its axis
      if (size.width / size.height < 0.8) {
        TOWER_AXIS.set(TOWER.cx, s.pathTarget.y, TOWER.cz);
        s.desiredTarget.lerp(TOWER_AXIS, 0.45);
      }
    }

    const smooth = s.manual ? 0.08 : 0.14;
    easing.damp3(camera.position, s.desiredPos, smooth, delta);
    easing.damp3(s.lookAt, s.desiredTarget, smooth, delta);

    // head-turn: drag/tilt while standing on a floor or the deck, a whisper of cursor parallax otherwise
    const { mode } = useStore.getState();
    if (mode !== 'scroll' && !s.flying) {
      s.wantYaw = THREE.MathUtils.clamp(s.dragYaw + s.tiltYaw, -LOOK_YAW, LOOK_YAW);
      s.wantPitch = THREE.MathUtils.clamp(s.dragPitch + s.tiltPitch, -LOOK_PITCH, LOOK_PITCH);
    } else if (mode === 'scroll' && !calm && finePointer) {
      s.wantYaw = -s.mouseX * deg(1.6);
      s.wantPitch = -s.mouseY * deg(1.0);
    } else {
      s.wantYaw = s.wantPitch = 0;
    }
    easing.damp(s, 'yaw', s.wantYaw, 0.35, delta);
    easing.damp(s, 'pitch', s.wantPitch, 0.35, delta);
    tmpDir.subVectors(s.lookAt, camera.position);
    if (Math.abs(s.yaw) + Math.abs(s.pitch) > 1e-5) {
      tmpDir.applyAxisAngle(UP, s.yaw);
      tmpRight.crossVectors(tmpDir, UP).normalize();
      tmpDir.applyAxisAngle(tmpRight, s.pitch);
    }
    camera.lookAt(tmpLook.addVectors(camera.position, tmpDir));

    // portrait screens need a wider vertical field of view to keep the tower in frame
    const aspect = size.width / size.height;
    const fov = aspect < 0.8 ? 58 : 42;
    // shift the projection so the tower sits beside the glass panels
    // journey panels are narrow; the content sections are wide, so push the tower further right there
    // on portrait screens the tower always sits high, clear of the bottom sheets and opening title
    const panelShift =
      aspect < 0.8 ? 1 : THREE.MathUtils.smoothstep(s.sp, 0.15, 0.22) * (1 + 1.2 * THREE.MathUtils.smoothstep(s.sp, 0.92, 1));
    const wantShift = s.manual ? 0 : panelShift;
    easing.damp(s, 'shift', wantShift, 0.6, delta);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const w = size.width;
    const h = size.height;
    if (aspect < 0.8) camera.setViewOffset(w, h, 0, h * 0.13 * s.shift, w, h);
    else camera.setViewOffset(w, h, -w * 0.13 * s.shift, 0, w, h);

    // opening clouds fade out once we're through them, and never hang around a floor or the deck
    const openingWant = mode === 'scroll' ? 1 - THREE.MathUtils.smoothstep(s.sp, 0.13, 0.21) : 0;
    W.openingClouds.value = mode === 'scroll' && !s.manual ? openingWant : THREE.MathUtils.damp(W.openingClouds.value, openingWant, 2.5, delta);

    if (whiteoutEl.current) {
      const y = camera.position.y;
      const inOpening = (1 - THREE.MathUtils.smoothstep(Math.abs(y - OPENING_CLOUD_Y), 5, 26)) * W.openingClouds.value * 0.92;
      const awayFromPodium = THREE.MathUtils.smoothstep(Math.hypot(camera.position.x, camera.position.z), 120, 200);
      const inFog = (1 - THREE.MathUtils.smoothstep(Math.abs(y - FOG_SEA_Y), 4, 16)) * W.fogSea.value * 0.45 * awayFromPodium;
      const white = s.manual ? 0 : Math.max(inOpening, inFog);
      whiteoutEl.current.style.opacity = white.toFixed(3);
      whiteoutEl.current.style.background = `radial-gradient(ellipse at center, #${W.cols.cloudLit.getHexString()} 0%, #${W.cols.cloudShade.getHexString()} 140%)`;
    }

    if (debugEl.current && Math.floor(t * 10) % 2 === 0) {
      const p = camera.position;
      debugEl.current.textContent = `progress ${progress.toFixed(3)}  smooth ${s.sp.toFixed(3)}  after ${afterJourney.toFixed(0)}px
cam [${p.x.toFixed(0)}, ${p.y.toFixed(0)}, ${p.z.toFixed(0)}]  look [${s.lookAt.x.toFixed(0)}, ${s.lookAt.y.toFixed(0)}, ${s.lookAt.z.toFixed(0)}]`;
    }
  });

  return null;
}
