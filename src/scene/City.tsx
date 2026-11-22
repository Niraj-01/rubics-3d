'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store';
import { LIGHT_GLSL, NOISE_GLSL, OUTPUT_GLSL, UNIFORMS_GLSL } from './glsl';
import { U } from './weather';
import { coastX } from './towerSpec';
import { samplePath } from './cameraPath';

/** Points along the camera journey, so no building ever sits in the camera's way. */
function pathSamples() {
  const pts: THREE.Vector3[] = [];
  const tgt = new THREE.Vector3();
  for (let i = 0; i <= 240; i++) {
    const p = new THREE.Vector3();
    samplePath(i / 240, p, tgt);
    pts.push(p);
  }
  return pts;
}

const vert = /* glsl */ `
#include <fog_pars_vertex>
attribute float aSeed;
varying vec3 vWPos;
varying vec3 vWNormal;
varying float vSeed;
varying float vHeight;
void main() {
  mat4 m = modelMatrix * instanceMatrix;
  vec4 wp = m * vec4(position, 1.0);
  vWPos = wp.xyz;
  vWNormal = normalize(mat3(m) * normal);
  vSeed = aSeed;
  vHeight = length(instanceMatrix[1].xyz);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const frag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
${LIGHT_GLSL}
#include <fog_pars_fragment>
varying vec3 vWPos;
varying vec3 vWNormal;
varying float vSeed;
varying float vHeight;
void main() {
  vec3 n = normalize(vWNormal);
  float tone = fract(vSeed * 13.7);
  // weathered Mumbai concrete: warm mid-tones, never bright white at noon
  vec3 albedo = mix(vec3(0.40, 0.38, 0.35), vec3(0.58, 0.54, 0.48), tone);
  if (fract(vSeed * 3.1) > 0.82) albedo = vec3(0.66, 0.62, 0.55);
  if (fract(vSeed * 7.3) > 0.8) albedo = vec3(0.26, 0.30, 0.34); // glassy towers
  vec3 col;
  if (n.y > 0.5) {
    col = shade(albedo * 0.7, n);
  } else {
    vec2 t2 = vec2(-n.z, n.x);
    float u = dot(vWPos.xz, t2);
    float fy = vWPos.y / 3.2;
    float fu = u / 3.4;
    float wy = fwidth(fy);
    float wu = fwidth(fu);
    float mask = smoothstep(0.25, 0.25 + wy + 0.02, fract(fy)) * smoothstep(0.0, wu + 0.15, fract(fu)) * smoothstep(0.0, wu + 0.15, 1.0 - fract(fu));
    float far = smoothstep(0.35, 0.9, max(wu, wy));
    mask = mix(mask, 0.55, far);
    vec3 wall = shade(albedo, n);
    vec3 win = shade(albedo * 0.6, n) + mix(uSkyHorizon, uSkyTop, 0.5) * 0.06;
    col = mix(wall, win, mask * 0.7);
    float h = hash13(vec3(floor(fy), floor(fu), floor(vSeed * 991.0)));
    float litFrac = 0.42 * uCityGlow;
    vec3 lamp = mix(vec3(1.0, 0.7, 0.42), vec3(0.85, 0.9, 1.0), step(0.75, fract(h * 17.0)));
    float lit = step(1.0 - litFrac, h);
    vec3 glow = lamp * lit * 1.7 * uCityGlow;
    glow = mix(glow, lamp * litFrac * 1.4 * uCityGlow, far);
    col += glow * mask;
    col *= mix(0.55, 1.0, smoothstep(0.0, 12.0, vWPos.y));
  }
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

export default function City() {
  const tier = useStore((s) => s.tier);
  const count = tier === 'low' ? 1600 : 3400;

  const mesh = useMemo(() => {
    let seed = 42;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) },
      fog: true,
    });
    const im = new THREE.InstancedMesh(geo, mat, count);
    const seeds = new Float32Array(count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const path = pathSamples();
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 20) {
      // denser close in, and biased toward the south
      const r = 170 + 3300 * Math.pow(rand(), 1.7);
      const south = rand() < 0.45;
      const a = south ? Math.PI / 2 + (rand() - 0.5) * 2.0 : rand() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (x < coastX(z) + 60) continue;
      if (Math.abs(x) < 95 && Math.abs(z) < 75) continue;
      const far = THREE.MathUtils.smoothstep(r, 600, 1600);
      let h = 9 + rand() * (16 + 36 * far);
      // the odd tall tower, kept well away so BeauMonté reads as the landmark
      if (r > 1100 && rand() > 0.9) h = 70 + rand() * 110;
      if (r < 700) h = Math.min(h, 32);
      const w = 14 + rand() * 26;
      const d = 14 + rand() * 26;
      const clear = Math.max(w, d) / 2 + 30;
      if (path.some((s) => s.y < h + 25 && Math.hypot(s.x - x, s.z - z) < clear)) continue;
      q.setFromAxisAngle(up, 0.21 + (rand() < 0.75 ? 0 : (rand() - 0.5) * 0.8));
      m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(w, h, d));
      im.setMatrixAt(placed, m);
      seeds[placed] = rand();
      placed++;
    }
    im.count = placed;
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    return im;
  }, [count]);

  return <primitive object={mesh} />;
}
