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

type Flight = { pos: THREE.CatmullRomCurve3; target: THREE.CatmullRomCurve3 };

function floorView(level: number) {
  const y = floorToY(level) + 1.7;
  const pos = new THREE.Vector3(TOWER_WEST_X - 5, y, TOWER.cz + 5);
  // look west toward the sea, slightly down so higher floors reveal more city and water
  const target = pos.clone().add(new THREE.Vector3(-120, -10 - y * 0.06, -14));
  return { pos, target };
}

const POOL_VIEW = {
  pos: new THREE.Vector3(POOL.cx - 44, DECK_Y + 15, POOL.cz + 34),
  target: new THREE.Vector3(POOL.cx + 4, DECK_Y, POOL.cz - 3),
};

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
      s.tween?.kill();
      s.flying = true;
      s.manual = true;
      const o = { u: 0 };
      s.tween = gsap.to(o, {
        u: 1,
        duration,
        ease: 'expo.inOut',
        onUpdate: () => {
          flight.pos.getPoint(o.u, s.desiredPos);
          flight.target.getPoint(o.u, s.desiredTarget);
        },
        onComplete: () => {
          s.flying = false;
          onDone?.();
        },
      });
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
          // floor to floor: slide along the facade
          const mid = new THREE.Vector3(TOWER_WEST_X - 16, (start.y + end.pos.y) / 2, TOWER.cz + 12);
          posPts = [start, mid, end.pos];
          tgtPts = [startT, new THREE.Vector3(-200, (start.y + end.pos.y) / 2 - 20, -10), end.target];
        } else {
          // approach the west face low, then rise hugging the facade to the chosen floor
          const approachY = THREE.MathUtils.clamp(Math.min(start.y, end.pos.y), DECK_Y + 12, 120);
          const a = new THREE.Vector3(TOWER_WEST_X - 46, approachY, TOWER.cz + 34);
          const b = new THREE.Vector3(TOWER_WEST_X - 13, THREE.MathUtils.lerp(approachY, end.pos.y, 0.7), TOWER.cz + 12);
          posPts = [start, a, b, end.pos];
          tgtPts = [
            startT,
            new THREE.Vector3(TOWER.cx, approachY + 12, TOWER.cz),
            new THREE.Vector3(TOWER.cx, end.pos.y + 14, TOWER.cz),
            end.target,
          ];
        }
        fly({ pos: new THREE.CatmullRomCurve3(posPts, false, 'centripetal'), target: new THREE.CatmullRomCurve3(tgtPts) }, 2.6);
      } else if (mode === 'pool') {
        const mid = start.clone().lerp(POOL_VIEW.pos, 0.5);
        mid.y = Math.max(mid.y, POOL_VIEW.pos.y + 30);
        fly(
          {
            pos: new THREE.CatmullRomCurve3([start, mid, POOL_VIEW.pos.clone()], false, 'centripetal'),
            target: new THREE.CatmullRomCurve3([startT, startT.clone().lerp(POOL_VIEW.target, 0.6), POOL_VIEW.target.clone()]),
          },
          2.4,
        );
      } else {
        // back to the tower: return to the current scroll sample, then hand control back to scroll
        const pos = new THREE.Vector3();
        const tgt = new THREE.Vector3();
        samplePath(s.sp, pos, tgt);
        const mid = start.clone().lerp(pos, 0.5);
        mid.y = Math.max(start.y, pos.y) + 25;
        fly(
          {
            pos: new THREE.CatmullRomCurve3([start, mid, pos], false, 'centripetal'),
            target: new THREE.CatmullRomCurve3([startT, startT.clone().lerp(tgt, 0.5), tgt]),
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
    const idle = 1 - THREE.MathUtils.smoothstep(s.sp, 0, 0.05);
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
    camera.lookAt(s.lookAt);

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

    // opening clouds fade out once we're through them
    W.openingClouds.value = 1 - THREE.MathUtils.smoothstep(s.sp, 0.13, 0.21);

    if (whiteoutEl.current) {
      const y = camera.position.y;
      const inOpening = (1 - THREE.MathUtils.smoothstep(Math.abs(y - OPENING_CLOUD_Y), 5, 26)) * W.openingClouds.value * 0.92;
      const awayFromPodium = THREE.MathUtils.smoothstep(Math.hypot(camera.position.x, camera.position.z), 120, 200);
      const inFog = (1 - THREE.MathUtils.smoothstep(Math.abs(y - FOG_SEA_Y), 4, 16)) * W.fogSea.value * 0.45 * awayFromPodium;
      const white = Math.max(inOpening, inFog);
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
