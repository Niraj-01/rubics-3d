'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';
import { OUTPUT_GLSL, UNIFORMS_GLSL } from './glsl';
import { U } from './weather';
import { FLOOR_H, TOWER, TOWER_WEST_X } from './towerSpec';

/**
 * The room you stand in when you pick a floor: floor, ceiling, mullions and the glass itself,
 * built just inside the west face. It follows the camera's floor so floor-to-floor moves never pop.
 */

const DEPTH = 16; // metres of room behind the glass
const SPAN = TOWER.d - 2 * TOWER.chamfer; // the flat part of the west face
const EYE = 1.6;

const roomVert = /* glsl */ `
varying vec3 vWPos;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

// Floor and ceiling: lit by the window (falls off into the room) plus warm downlights at night.
const roomFrag = /* glsl */ `
${UNIFORMS_GLSL}
uniform vec3 uAlbedo;
uniform float uCeiling;
uniform float uGlassX;
varying vec3 vWPos;
void main() {
  float d = vWPos.x - uGlassX;
  float window = exp(-d * 0.22);
  vec3 daylight = mix(uSkyHorizon, uSunColor, 0.35) * (0.25 + 0.9 * window) * (0.35 + 0.65 * uAmbient);
  vec3 warm = vec3(1.0, 0.72, 0.45);
  float night = uWindowGlow;
  vec3 col = uAlbedo * (daylight + warm * night * 0.55);
  if (uCeiling > 0.5) {
    // linear cove light along the window head
    float cove = smoothstep(0.5, 0.0, abs(d - 1.1)) * night;
    col += warm * cove * 1.4;
    // a row of downlights deeper in the room
    vec2 g = vec2(fract((vWPos.z + 0.6) / 3.1) - 0.5, d - 5.0);
    col += warm * smoothstep(0.32, 0.0, length(g)) * (0.25 + night * 2.0);
  } else {
    // polished stone: faint sky sheen near the glass, wet-look streak of the sun/sky
    float sheen = exp(-d * 0.6) * 0.18;
    col += uSkyHorizon * sheen;
    float grout = 1.0 - smoothstep(0.0, 0.02, min(fract(vWPos.z / 1.2), fract(d / 1.2)));
    col *= 1.0 - grout * 0.25;
  }
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

// The pane: almost clear, more reflective at grazing angles, catching the sun and the room at night.
const glassFrag = /* glsl */ `
${UNIFORMS_GLSL}
uniform float uFloorY;
varying vec3 vWPos;
void main() {
  vec3 V = normalize(cameraPosition - vWPos);
  float ndv = abs(V.x);
  float fres = pow(1.0 - ndv, 4.0);
  float y = vWPos.y - uFloorY;
  vec3 col = mix(uSkyHorizon, vec3(1.0), 0.35);
  float a = 0.035 + fres * 0.28;
  // reflection of the warm ceiling cove at night, a soft band near the top of the pane
  float cove = smoothstep(0.5, 0.0, abs(y - 3.05)) * uWindowGlow;
  col = mix(col, vec3(1.0, 0.75, 0.5), cove);
  a += cove * 0.18;
  // a diagonal sun sheen that drifts as you look around
  float sheen = smoothstep(0.92, 1.0, sin((vWPos.z + y * 0.8) * 0.35 + uTime * 0.05)) * 0.05 * uSunIntensity * (1.0 - uWindowGlow);
  a += sheen;
  gl_FragColor = vec4(col, a);
  ${OUTPUT_GLSL}
}
`;

export default function FloorInterior() {
  const group = useRef<THREE.Group>(null);

  const parts = useMemo(() => {
    const room = (albedo: string, ceiling: boolean) =>
      new THREE.ShaderMaterial({
        vertexShader: roomVert,
        fragmentShader: roomFrag,
        uniforms: { ...U, uAlbedo: { value: new THREE.Color(albedo) }, uCeiling: { value: ceiling ? 1 : 0 }, uGlassX: { value: TOWER_WEST_X } },
      });
    const floorMat = room('#6d6157', false);
    const ceilMat = room('#4a4540', true);
    const glassMat = new THREE.ShaderMaterial({
      vertexShader: roomVert,
      fragmentShader: glassFrag,
      uniforms: { ...U, uFloorY: { value: 0 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // bronze mullions on the facade grid (1.55 m), plus a sill and head
    const bronze = new THREE.MeshStandardMaterial({ color: '#6e5536', metalness: 0.7, roughness: 0.42 });
    const count = Math.floor(SPAN / 1.55) + 1;
    const mullions = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, FLOOR_H, 0.07), bronze, count);
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const z = Math.round((TOWER.cz - SPAN / 2) / 1.55 + i) * 1.55;
      m.makeTranslation(TOWER_WEST_X + 0.06, FLOOR_H / 2, z);
      mullions.setMatrixAt(i, m);
    }
    mullions.instanceMatrix.needsUpdate = true;
    return { floorMat, ceilMat, glassMat, bronze, mullions };
  }, []);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    const { mode } = useStore.getState();
    const p = camera.position;
    const near = p.x > TOWER_WEST_X - 10 && p.x < TOWER_WEST_X + DEPTH && Math.abs(p.z - TOWER.cz) < SPAN / 2 + 4;
    g.visible = mode === 'floor' && near;
    if (!g.visible) return;
    const level = Math.round((p.y - EYE) / FLOOR_H);
    g.position.y = level * FLOOR_H;
    parts.glassMat.uniforms.uFloorY.value = g.position.y;
  });

  const cx = TOWER_WEST_X + DEPTH / 2;
  return (
    <group ref={group} visible={false}>
      <mesh position={[cx, 0.01, TOWER.cz]} rotation-x={-Math.PI / 2} material={parts.floorMat}>
        <planeGeometry args={[DEPTH, SPAN]} />
      </mesh>
      <mesh position={[cx, FLOOR_H - 0.25, TOWER.cz]} rotation-x={Math.PI / 2} material={parts.ceilMat}>
        <planeGeometry args={[DEPTH, SPAN]} />
      </mesh>
      {/* sill and head trims along the glass line */}
      <mesh position={[TOWER_WEST_X + 0.1, 0.06, TOWER.cz]} material={parts.bronze}>
        <boxGeometry args={[0.2, 0.12, SPAN]} />
      </mesh>
      <mesh position={[TOWER_WEST_X + 0.12, FLOOR_H - 0.3, TOWER.cz]} material={parts.bronze}>
        <boxGeometry args={[0.24, 0.1, SPAN]} />
      </mesh>
      <primitive object={parts.mullions} />
      <mesh position={[TOWER_WEST_X, FLOOR_H / 2, TOWER.cz]} rotation-y={Math.PI / 2} material={parts.glassMat} renderOrder={5}>
        <planeGeometry args={[SPAN, FLOOR_H]} />
      </mesh>
    </group>
  );
}
