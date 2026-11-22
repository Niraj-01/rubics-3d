'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIGHT_GLSL, NOISE_GLSL, OUTPUT_GLSL, STANDARD_VERT, UNIFORMS_GLSL } from './glsl';
import { U } from './weather';
import { useStore } from '@/store';
import { chamferedRect, CROWN_H, DECK_Y, FLOOR_H, PODIUM, ROOF_Y, TOWER } from './towerSpec';

/** Extrude an XZ outline upward from y0 to y1. */
function prism(outline: [number, number][], y0: number, y1: number, cx: number, cz: number) {
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  geo.translate(cx, y0, cz);
  geo.computeVertexNormals();
  return geo;
}

const facadeFrag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
${LIGHT_GLSL}
#include <fog_pars_fragment>
uniform float uBaseY;
varying vec3 vWPos;
varying vec3 vWNormal;

vec3 skyReflect(vec3 R) {
  vec3 up = mix(uSkyHorizon, uSkyTop, smoothstep(0.0, 0.7, R.y));
  vec3 down = mix(uSkyHorizon * 0.85, uGroundCol * 0.7 + uSkyTop * 0.15, smoothstep(0.0, -0.4, R.y));
  return R.y > 0.0 ? up : down;
}

void main() {
  vec3 n = normalize(vWNormal);
  vec3 V = normalize(cameraPosition - vWPos);
  float y = vWPos.y - uBaseY;
  vec3 col;

#ifdef GLASS
  if (n.y > 0.5) {
    col = shade(vec3(0.16, 0.15, 0.14), n);
  } else {
    vec2 t2 = vec2(-n.z, n.x);
    float u = dot(vWPos.xz, t2);
    float fy = y / ${FLOOR_H.toFixed(2)};
    float fu = u / 1.55;
    float fi = floor(fy);
    float ci = floor(fu);
    float fyf = fract(fy);
    float fuf = fract(fu);
    float wy = fwidth(fy);
    float wu = fwidth(fu);
    float mY = smoothstep(0.14, 0.14 + wy * 1.5 + 0.01, fyf);
    float mU = smoothstep(0.0, wu * 1.5 + 0.035, fuf) * smoothstep(0.0, wu * 1.5 + 0.035, 1.0 - fuf);
    float glassMask = mix(mY * mU, 0.78, smoothstep(0.35, 0.9, max(wu, wy)));

    float fid = floor((atan(n.z, n.x) + 3.14159) * 1.2732 + 0.5);
    float h = hash13(vec3(fi, ci, fid));
    float h2 = hash13(vec3(ci, fi * 1.7, fid + 9.0));

    vec3 R = reflect(-V, n);
    // tiny per-pane tilt so the reflection breaks up like real curtain wall
    R.y += (h2 - 0.5) * 0.03;
    float ndv = max(dot(V, n), 0.0);
    float fres = clamp(0.36 + 0.64 * pow(1.0 - ndv, 3.0), 0.0, 1.0);
    vec3 glass = mix(vec3(0.012, 0.018, 0.026), skyReflect(R), fres);
    float sd = max(dot(R, uSunDir), 0.0);
    float sunVis = smoothstep(-0.05, 0.05, uSunDir.y);
    glass += uSunColor * (pow(sd, 400.0) * 9.0 + pow(sd, 24.0) * 0.25) * uSunIntensity * 0.35 * sunVis;

    // lit interiors: hashed per window, scaled by uWindowGlow
    float litFrac = 0.62 * uWindowGlow;
    float lit = step(1.0 - litFrac, h);
    if (fi < 1.0) lit = step(0.05, uWindowGlow); // Level 6 E-Deck clubhouse always on at night
    vec3 warm = mix(vec3(1.0, 0.66, 0.36), vec3(1.0, 0.85, 0.62), h2);
    vec3 interior = warm * lit * (0.7 + 0.8 * h2) * uWindowGlow * 2.4;
    float far = smoothstep(0.35, 0.9, max(wu, wy));
    interior = mix(interior, warm * litFrac * 1.6 * uWindowGlow, far);
    glass += interior * (1.0 - 0.6 * fres);

    vec3 frame = shade(vec3(0.30, 0.235, 0.16), n);
    col = mix(frame, glass, glassMask);
    col *= mix(0.6, 1.0, smoothstep(0.0, 18.0, y));
  }
#endif

#ifdef PODIUM
  if (n.y > 0.5) {
    // Level 6 deck paving, light stone
    vec2 g = fract(vWPos.xz / 1.2);
    vec2 w = fwidth(vWPos.xz / 1.2);
    float joint = (1.0 - smoothstep(0.0, w.x * 1.5 + 0.02, g.x) * smoothstep(0.0, w.y * 1.5 + 0.02, g.y));
    vec3 stone = vec3(0.80, 0.76, 0.69) * (0.94 + 0.08 * vnoise(vWPos.xz * 0.15));
    stone = mix(stone, stone * 0.82, joint * 0.6);
    col = shade(stone, n);
    col = mix(col, col * 0.6 + uSkyTop * 0.25, uWet * 0.6);
    // contact shadow where the tower meets the deck, so it sits on the podium rather than floating
    vec2 q = abs(vWPos.xz - vec2(${TOWER.cx.toFixed(1)}, ${TOWER.cz.toFixed(1)})) - vec2(${(TOWER.w / 2).toFixed(1)}, ${(TOWER.d / 2).toFixed(1)});
    float dT = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    col *= mix(0.5, 1.0, smoothstep(0.0, 9.0, dT));
  } else {
    vec2 t2 = vec2(-n.z, n.x);
    float u = dot(vWPos.xz, t2);
    float fy = vWPos.y / ${FLOOR_H.toFixed(2)};
    float fi = floor(fy);
    float fyf = fract(fy);
    // horizontal louvres over the parking levels
    float louv = smoothstep(0.45, 0.55, fract(vWPos.y / 0.45));
    float band = step(0.82, fyf);
    vec3 stone = vec3(0.62, 0.57, 0.50);
    vec3 albedo = mix(stone * 0.55, stone, louv);
    albedo = mix(albedo, vec3(0.72, 0.66, 0.56), band);
    if (fi < 1.0) albedo = mix(vec3(0.05, 0.06, 0.07), stone, step(0.85, fyf)); // ground floor glazing
    col = shade(albedo, n);
    // warm strip under the deck edge at night
    float strip = smoothstep(0.86, 0.9, fyf) * (1.0 - smoothstep(0.95, 0.99, fyf)) * step(4.5, fi);
    col += vec3(1.0, 0.7, 0.4) * strip * uWindowGlow * 1.6;
    if (fi < 1.0) col += vec3(1.0, 0.75, 0.5) * step(fyf, 0.85) * uWindowGlow * 0.35;
    col *= mix(0.55, 1.0, smoothstep(0.0, 8.0, vWPos.y));
  }
#endif

  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

const GLINT = { value: 0 };

function facadeMaterial(kind: 'GLASS' | 'PODIUM', baseY: number) {
  return new THREE.ShaderMaterial({
    vertexShader: STANDARD_VERT,
    fragmentShader: facadeFrag,
    defines: { [kind]: '' },
    uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uBaseY: { value: baseY } },
    fog: true,
  });
}

/** Points around the outline every ~spacing metres, with outward normal and position along its edge (-1..1). */
function perimeterPoints(outline: [number, number][], spacing: number) {
  const pts: { x: number; z: number; nx: number; nz: number; s: number; long: boolean }[] = [];
  for (let i = 0; i < outline.length; i++) {
    const [ax, az] = outline[i];
    const [bx, bz] = outline[(i + 1) % outline.length];
    const len = Math.hypot(bx - ax, bz - az);
    const count = Math.max(1, Math.round(len / spacing));
    const tx = (bx - ax) / len;
    const tz = (bz - az) / len;
    // counter-clockwise in XZ (with -Z north) → outward normal is (tz, -tx)
    const nx = tz;
    const nz = -tx;
    for (let k = 0; k < count; k++) {
      const f = (k + 0.5) / count;
      pts.push({ x: ax + (bx - ax) * f, z: az + (bz - az) * f, nx, nz, s: f * 2 - 1, long: len > 25 });
    }
  }
  return pts;
}

export default function Tower() {
  const aviation = useRef<THREE.MeshBasicMaterial>(null);
  const crownGlow = useRef<THREE.MeshBasicMaterial>(null);

  const { bodyGeo, podiumGeo, roofGeo, glassMat, podiumMat, fins } = useMemo(() => {
    const towerOutline = chamferedRect(TOWER.w, TOWER.d, TOWER.chamfer);
    const bodyGeo = prism(towerOutline, DECK_Y, ROOF_Y, TOWER.cx, TOWER.cz);
    const podiumGeo = prism(chamferedRect(PODIUM.w, PODIUM.d, PODIUM.chamfer), 0, DECK_Y, PODIUM.cx, PODIUM.cz);
    const roofGeo = prism(chamferedRect(TOWER.w - 7, TOWER.d - 12, 2), ROOF_Y, ROOF_Y + 6, TOWER.cx, TOWER.cz);

    // Vertical gold-bronze fins; on the long faces they rise into an arched crown.
    const pts = perimeterPoints(towerOutline, 4.2);
    const finGeo = new THREE.BoxGeometry(1, 1, 1);
    finGeo.translate(0, 0.5, 0);
    const finMat = new THREE.MeshStandardMaterial({ color: '#b08a55', metalness: 0.85, roughness: 0.3 });
    // a slow glint of light travelling up the gold fins
    finMat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = U.uTime;
      sh.uniforms.uGlint = GLINT;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vGlintPos;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvGlintPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uGlint;\nvarying vec3 vGlintPos;')
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float sweep = sin(vGlintPos.y * 0.03 - uTime * 0.45);
          totalEmissiveRadiance += vec3(1.0, 0.82, 0.55) * pow(max(sweep, 0.0), 160.0) * uGlint * 0.55;`,
        );
    };
    const fins = new THREE.InstancedMesh(finGeo, finMat, pts.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    pts.forEach((p, i) => {
      const crown = p.long ? CROWN_H * (1 - p.s * p.s * 0.85) : CROWN_H * 0.35;
      const height = ROOF_Y - DECK_Y + crown;
      q.setFromAxisAngle(up, Math.atan2(p.nx, p.nz));
      m.compose(
        new THREE.Vector3(TOWER.cx + p.x + p.nx * 0.55, DECK_Y, TOWER.cz + p.z + p.nz * 0.55),
        q,
        new THREE.Vector3(0.32, height, 1.1),
      );
      fins.setMatrixAt(i, m);
    });
    fins.instanceMatrix.needsUpdate = true;

    return {
      bodyGeo,
      podiumGeo,
      roofGeo,
      glassMat: facadeMaterial('GLASS', DECK_Y),
      podiumMat: facadeMaterial('PODIUM', 0),
      fins,
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const glow = U.uWindowGlow.value;
    // fins right outside the glass would blow out in the floor view; calm them there
    const inside = useStore.getState().mode === 'floor';
    const fm = fins.material as THREE.MeshStandardMaterial;
    fm.envMapIntensity = THREE.MathUtils.damp(fm.envMapIntensity, inside ? 0.25 : 1, 3, delta);
    const daylight = Math.min(1, U.uSunIntensity.value / 2.6) * (1 - glow * 0.6);
    GLINT.value = THREE.MathUtils.damp(GLINT.value, inside ? 0 : daylight, 3, delta);
    if (aviation.current) {
      const blink = Math.sin(clock.elapsedTime * 2.2) > 0.6 ? 1 : 0.15;
      aviation.current.color.setRGB(3 * blink, 0.15 * blink, 0.1 * blink);
    }
    if (crownGlow.current) crownGlow.current.color.setRGB(1.0, 0.72, 0.4).multiplyScalar(0.15 + glow * 2.6);
  });

  return (
    <group>
      <mesh geometry={podiumGeo} material={podiumMat} />
      <mesh geometry={bodyGeo} material={glassMat} />
      <mesh geometry={roofGeo}>
        <meshStandardMaterial color="#3a3631" roughness={0.8} />
      </mesh>
      <primitive object={fins} />
      {/* crown light ring traced inside the fins */}
      <mesh position={[TOWER.cx, ROOF_Y + 0.6, TOWER.cz]}>
        <boxGeometry args={[TOWER.w - 0.6, 0.35, TOWER.d - 0.6]} />
        <meshBasicMaterial ref={crownGlow} toneMapped={false} />
      </mesh>
      <mesh position={[TOWER.cx, ROOF_Y + 6.6, TOWER.cz]}>
        <sphereGeometry args={[0.45, 12, 8]} />
        <meshBasicMaterial ref={aviation} toneMapped={false} />
      </mesh>
    </group>
  );
}
