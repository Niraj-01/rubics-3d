import * as THREE from 'three';
import { DECK_Y, TOWER, TOWER_WEST_X } from './towerSpec';

export type PanelId = 'stats' | 'views' | 'facts' | 'amenities' | 'vision';
export type Keyframe = { t: number; pos: [number, number, number]; target: [number, number, number]; panelId?: PanelId };

// Tune with ?debug (shows progress + camera position).
export const KEYFRAMES: Keyframe[] = [
  // 1. high above the cloud sea, looking down at the crown
  { t: 0.0, pos: [190, 196, 285], target: [TOWER.cx, 150, TOWER.cz] },
  // 2. descending through the clouds
  { t: 0.12, pos: [215, 116, 262], target: [TOWER.cx, 108, TOWER.cz] },
  // 3. hero 3/4 view against the skyline
  { t: 0.25, pos: [250, 50, 285], target: [6, 88, 0], panelId: 'stats' },
  // 4. orbit to the west face, the sea on the horizon
  { t: 0.4, pos: [-215, 64, 235], target: [-60, 92, -40], panelId: 'views' },
  // 5. glide up the facade
  { t: 0.54, pos: [-62, 150, 62], target: [TOWER_WEST_X + 4, 158, -6], panelId: 'facts' },
  // 6. near the Level 6 deck
  { t: 0.68, pos: [-98, DECK_Y + 24, 74], target: [-16, DECK_Y + 2, 6], panelId: 'amenities' },
  // 7. wide pull-back
  { t: 0.84, pos: [430, 205, 520], target: [0, 70, 0], panelId: 'vision' },
  // 8. settle into the slow ambient orbit used behind the content sections
  { t: 1.0, pos: [390, 120, 430], target: [TOWER.cx, 82, TOWER.cz] },
];

const posCurve = new THREE.CatmullRomCurve3(
  KEYFRAMES.map((k) => new THREE.Vector3(...k.pos)),
  false,
  'centripetal',
);
const targetCurve = new THREE.CatmullRomCurve3(
  KEYFRAMES.map((k) => new THREE.Vector3(...k.target)),
  false,
  'centripetal',
);

/** Map journey progress (0..1) to curve parameter, easing into each keyframe so the camera holds there. */
function curveParam(progress: number) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let i = 0;
  while (i < KEYFRAMES.length - 2 && p > KEYFRAMES[i + 1].t) i++;
  const a = KEYFRAMES[i].t;
  const b = KEYFRAMES[i + 1].t;
  const local = (p - a) / (b - a);
  const eased = THREE.MathUtils.lerp(local, THREE.MathUtils.smootherstep(local, 0, 1), 0.65);
  return (i + eased) / (KEYFRAMES.length - 1);
}

export function samplePath(progress: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const u = curveParam(progress);
  posCurve.getPoint(u, outPos);
  targetCurve.getPoint(u, outTarget);
}

/** Visibility ranges for the scroll panels, centred on their keyframes. */
export const PANEL_RANGES = KEYFRAMES.filter((k) => k.panelId).map((k) => ({
  id: k.panelId as PanelId,
  center: k.t,
}));
export const PANEL_HALF_WIDTH = 0.06;
