'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { NOISE_GLSL, OUTPUT_GLSL, STANDARD_VERT, UNIFORMS_GLSL } from './glsl';
import { U } from './weather';
import { DECK_Y, KIDS_POOL, PODIUM, POOL, TOWER_WEST_X } from './towerSpec';

const waterFrag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
#include <fog_pars_fragment>
varying vec3 vWPos;
varying vec3 vWNormal;
void main() {
  vec2 p = vWPos.xz;
  float t = uTime;
  float e = 0.15;
  float h0 = vnoise(p * 0.9 + vec2(t * 0.35, t * 0.2)) + 0.5 * vnoise(p * 2.3 - vec2(t * 0.5, -t * 0.3));
  float hx = vnoise((p + vec2(e, 0.0)) * 0.9 + vec2(t * 0.35, t * 0.2)) + 0.5 * vnoise((p + vec2(e, 0.0)) * 2.3 - vec2(t * 0.5, -t * 0.3));
  float hz = vnoise((p + vec2(0.0, e)) * 0.9 + vec2(t * 0.35, t * 0.2)) + 0.5 * vnoise((p + vec2(0.0, e)) * 2.3 - vec2(t * 0.5, -t * 0.3));
  vec3 n = normalize(vec3((h0 - hx) * 0.9, 1.0, (h0 - hz) * 0.9));
  vec3 V = normalize(cameraPosition - vWPos);
  vec3 R = reflect(-V, n);
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(V, n), 0.0), 5.0);
  vec3 sky = mix(uSkyHorizon, uSkyTop, smoothstep(0.0, 0.8, R.y));
  vec3 body = vec3(0.04, 0.32, 0.38) * (0.35 + 0.65 * uAmbient) + vec3(0.02, 0.1, 0.1) * uSunIntensity * 0.2;
  // underwater lights at night
  body += vec3(0.15, 0.75, 0.85) * uWindowGlow * 0.55;
  // caustic shimmer
  body += vec3(0.08, 0.2, 0.2) * pow(vnoise(p * 3.0 + t * 0.8), 3.0) * (0.4 + uSunIntensity * 0.2);
  vec3 col = mix(body, sky, fres);
  float sd = max(dot(R, uSunDir), 0.0);
  col += uSunColor * pow(sd, 220.0) * 6.0 * uSunIntensity * 0.4 * step(0.0, uSunDir.y);
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

function makeWater() {
  return new THREE.ShaderMaterial({
    vertexShader: STANDARD_VERT,
    fragmentShader: waterFrag,
    uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) },
    fog: true,
  });
}

function roundedRect(w: number, d: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function colored(geo: THREE.BufferGeometry, hex: string) {
  const c = new THREE.Color(hex);
  const count = geo.attributes.position.count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) arr.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/** Cabana: four posts, a fabric canopy and a daybed, merged into one geometry. */
function cabanaGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-1.6, -1.6],
    [1.6, -1.6],
    [-1.6, 1.6],
    [1.6, 1.6],
  ]) {
    parts.push(colored(new THREE.BoxGeometry(0.14, 2.6, 0.14).translate(x, 1.3, z), '#6b4f35'));
  }
  parts.push(colored(new THREE.BoxGeometry(3.6, 0.16, 3.6).translate(0, 2.65, 0), '#efe6d6'));
  parts.push(colored(new THREE.BoxGeometry(2.4, 0.45, 2.0).translate(0, 0.25, 0.2), '#e9e2d4'));
  return mergeGeometries(parts);
}

/** Palm: a gently curved trunk and eight drooping, tapering fronds, merged with vertex colours. */
function palmGeometry() {
  const H = 6;
  const lean = (y: number) => (y / H) ** 2 * 0.7;
  const trunk = new THREE.CylinderGeometry(0.14, 0.24, H, 7, 6).translate(0, H / 2, 0);
  const tp = trunk.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setX(i, tp.getX(i) + lean(tp.getY(i)));
  trunk.computeVertexNormals();
  const parts: THREE.BufferGeometry[] = [colored(trunk, '#7a6248')];

  const L = 3.4;
  const leaf = new THREE.Color('#47703a');
  const tip = new THREE.Color('#7f9a4a');
  for (let k = 0; k < 8; k++) {
    const frond = new THREE.PlaneGeometry(0.9, L, 1, 7).translate(0, L / 2, 0);
    const fp = frond.attributes.position;
    const cols = new Float32Array(fp.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < fp.count; i++) {
      const t = fp.getY(i) / L;
      const w = Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.05)) * (1 - t * 0.55);
      // rises from the crown, then droops under its own weight
      fp.setXYZ(i, fp.getX(i) * w, 0.9 * t * L * 0.35 - 1.7 * t * t, t * L);
      c.copy(leaf).lerp(tip, t);
      cols.set([c.r, c.g, c.b], i * 3);
    }
    frond.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    frond.rotateY((k / 8) * Math.PI * 2 + (k % 2) * 0.2);
    frond.translate(lean(H), H, 0);
    frond.computeVertexNormals();
    parts.push(frond);
  }
  return mergeGeometries(parts);
}

const POOL_Y = DECK_Y + 0.32;

export default function AmenityDeck() {

  const { water, cabanas, loungers, planters, trees, lights } = useMemo(() => {
    const water = makeWater();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3(1, 1, 1);

    // Cabanas line the south side of the lap pool
    const cabanaCount = 6;
    const cabanas = new THREE.InstancedMesh(
      cabanaGeometry(),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }),
      cabanaCount,
    );
    for (let i = 0; i < cabanaCount; i++) {
      m.compose(v.set(POOL.cx - 21 + i * 8.4, DECK_Y, POOL.cz + 10.5), q.identity(), s.set(1, 1, 1));
      cabanas.setMatrixAt(i, m);
    }

    // Loungers along the north edge
    const loungerCount = 12;
    const loungers = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.75, 0.35, 2.0).translate(0, 0.18, 0),
      new THREE.MeshStandardMaterial({ color: '#f2eee6', roughness: 0.7 }),
      loungerCount,
    );
    for (let i = 0; i < loungerCount; i++) {
      m.compose(v.set(POOL.cx - 22 + i * 4, DECK_Y, POOL.cz - POOL.d / 2 - 3.2), q.identity(), s.set(1, 1, 1));
      loungers.setMatrixAt(i, m);
    }

    // Planters + trees around the deck edge and between zones
    const spots: [number, number][] = [];
    const x0 = PODIUM.cx - PODIUM.w / 2 + 4;
    for (let x = x0; x < TOWER_WEST_X - 6; x += 11) {
      spots.push([x, PODIUM.cz - PODIUM.d / 2 + 4]);
      spots.push([x, PODIUM.cz + PODIUM.d / 2 - 4]);
    }
    for (let z = -PODIUM.d / 2 + 14; z < PODIUM.d / 2 - 12; z += 11) spots.push([x0, z]);
    for (let x = x0 + 16; x < TOWER_WEST_X - 10; x += 14) spots.push([x, -4]);
    const planters = new THREE.InstancedMesh(
      new THREE.BoxGeometry(2.6, 0.8, 2.6).translate(0, 0.4, 0),
      new THREE.MeshStandardMaterial({ color: '#8f8577', roughness: 0.9 }),
      spots.length,
    );
    const trees = new THREE.InstancedMesh(
      palmGeometry(),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }),
      spots.length,
    );
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    spots.forEach(([x, z], i) => {
      m.compose(v.set(x, DECK_Y, z), q.identity(), s.set(1, 1, 1));
      planters.setMatrixAt(i, m);
      const r = 0.75 + rand() * 0.35;
      m.compose(v.set(x, DECK_Y + 0.7, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 6), s.set(r, r, r));
      trees.setMatrixAt(i, m);
    });

    // Warm deck lights around both pools
    const lightSpots: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const x = POOL.cx - POOL.w / 2 + i * (POOL.w / 10);
      lightSpots.push([x, POOL.cz - POOL.d / 2 - 1.2], [x, POOL.cz + POOL.d / 2 + 1.2]);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lightSpots.push([KIDS_POOL.cx + Math.cos(a) * 8, KIDS_POOL.cz + Math.sin(a) * 5.5]);
    }
    const lights = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshBasicMaterial({ color: '#ffb46b', toneMapped: false }),
      lightSpots.length,
    );
    lightSpots.forEach(([x, z], i) => {
      m.compose(v.set(x, DECK_Y + 0.35, z), q.identity(), s.set(1, 1, 1));
      lights.setMatrixAt(i, m);
    });

    return { water, cabanas, loungers, planters, trees, lights };
  }, []);

  useFrame(() => {
    const mat = lights.material as THREE.MeshBasicMaterial;
    mat.color.setRGB(1.0, 0.68, 0.36).multiplyScalar(0.25 + U.uWindowGlow.value * 3.5);
  });

  const kidsShape = useMemo(() => roundedRect(KIDS_POOL.w, KIDS_POOL.d, 3), []);
  const kidsRim = useMemo(() => roundedRect(KIDS_POOL.w + 1.6, KIDS_POOL.d + 1.6, 3.6), []);

  return (
    <group>
      {/* pool deck in light stone */}
      <mesh position={[POOL.cx, DECK_Y + 0.08, POOL.cz]}>
        <boxGeometry args={[POOL.w + 10, 0.16, POOL.d + 26]} />
        <meshStandardMaterial color="#e3dbcd" roughness={0.75} />
      </mesh>
      {/* lap pool: rim and water */}
      <mesh position={[POOL.cx, DECK_Y + 0.2, POOL.cz]}>
        <boxGeometry args={[POOL.w + 1.4, 0.2, POOL.d + 1.4]} />
        <meshStandardMaterial color="#cfc6b6" roughness={0.6} />
      </mesh>
      <mesh position={[POOL.cx, POOL_Y, POOL.cz]} rotation-x={-Math.PI / 2} material={water}>
        <planeGeometry args={[POOL.w, POOL.d, 1, 1]} />
      </mesh>
      {/* kids' pool */}
      <mesh position={[KIDS_POOL.cx, DECK_Y + 0.22, KIDS_POOL.cz]} rotation-x={-Math.PI / 2}>
        <shapeGeometry args={[kidsRim, 12]} />
        <meshStandardMaterial color="#cfc6b6" roughness={0.6} />
      </mesh>
      <mesh position={[KIDS_POOL.cx, POOL_Y, KIDS_POOL.cz]} rotation-x={-Math.PI / 2} material={water}>
        <shapeGeometry args={[kidsShape, 12]} />
      </mesh>
      <primitive object={cabanas} />
      <primitive object={loungers} />
      <primitive object={planters} />
      <primitive object={trees} />
      <primitive object={lights} />
    </group>
  );
}
