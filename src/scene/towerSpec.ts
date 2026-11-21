// World units are metres. +X = east, -X = west (toward the sea), +Z = south, -Z = north.
import { towerFacts } from '@/content';

export const FLOOR_H = 3.3;
export const floorToY = (level: number) => level * FLOOR_H;

/** Top of the 5-level podium = the Level 6 E-Deck surface. */
export const DECK_Y = floorToY(towerFacts.eDeckLevel);
/** Roof of the top habitable level. */
export const ROOF_Y = floorToY(towerFacts.topLevel + 1);
export const CROWN_H = 15;

export const TOWER = { cx: 28, cz: 0, w: 22, d: 46, chamfer: 4 };
export const PODIUM = { cx: 0, cz: 0, w: 118, d: 78, chamfer: 9 };
export const TOWER_WEST_X = TOWER.cx - TOWER.w / 2;
export const TOWER_CENTER_Y = (DECK_Y + ROOF_Y) / 2;

/** 50 m lap pool on the Level 6 deck, laid east–west so it points at the sea. */
export const POOL = { cx: -20, cz: 16, w: 50, d: 9 };
export const KIDS_POOL = { cx: -32, cz: -18, w: 12, d: 7 };

/** Western coastline; everything west of it is sea. Mirrored in GLSL as coastX(). */
export const coastX = (z: number) => -1750 + 220 * Math.sin(z * 0.0011) + 120 * Math.sin(z * 0.0031 + 1.3);

/** Chamfered rectangle outline (counter-clockwise, XZ plane) centred on (0,0). */
export function chamferedRect(w: number, d: number, c: number): [number, number][] {
  const x = w / 2;
  const z = d / 2;
  return [
    [-x + c, -z],
    [x - c, -z],
    [x, -z + c],
    [x, z - c],
    [x - c, z],
    [-x + c, z],
    [-x, z - c],
    [-x, -z + c],
  ];
}
