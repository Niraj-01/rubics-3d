'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store';
import { LIGHT_GLSL, NOISE_GLSL, OUTPUT_GLSL, STANDARD_VERT, UNIFORMS_GLSL } from './glsl';
import { U, W } from './weather';

const SIZE = 16000;

/** Ground and sea share one plane size; each discards the other's side of the coastline. */
const groundFrag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
${LIGHT_GLSL}
#include <fog_pars_fragment>
varying vec3 vWPos;
varying vec3 vWNormal;
float roadLine(float c, float spacing, float width) {
  float f = abs(fract(c / spacing + 0.5) - 0.5) * spacing;
  float w = fwidth(c) * 1.2;
  return 1.0 - smoothstep(width - w, width + w, f);
}
void main() {
  if (vWPos.x < coastX(vWPos.z)) discard;
  vec2 p = vWPos.xz;
  float n = fbm(p * 0.004, 3);
  vec3 albedo = uGroundCol * (0.8 + 0.4 * n);
  // rotated street grid with a few arterials
  float a = 0.21;
  vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
  float roads = max(roadLine(r.x, 150.0, 5.0), roadLine(r.y, 170.0, 5.0));
  float arterial = max(roadLine(r.x + 40.0, 900.0, 11.0), roadLine(r.y - 60.0, 1100.0, 11.0));
  roads = max(roads, arterial);
  float dist = length(cameraPosition - vWPos);
  roads *= 1.0 - smoothstep(2500.0, 5000.0, dist);
  albedo = mix(albedo, albedo * 0.55 + vec3(0.03), roads * 0.7);
  vec3 col = shade(albedo, vec3(0.0, 1.0, 0.0));
  col = mix(col, col * 0.55 + uSkyHorizon * 0.12, uWet * 0.7);
  // sodium-lit streets and a warm city haze at night
  float night = uCityGlow * uCityGlow;
  col += vec3(1.0, 0.55, 0.22) * (roads * 0.9 + arterial * 0.8) * night;
  col += vec3(0.5, 0.3, 0.15) * n * 0.06 * night;
  // shoreline
  float shore = 1.0 - smoothstep(0.0, 40.0, vWPos.x - coastX(vWPos.z));
  col = mix(col, shade(vec3(0.62, 0.56, 0.46), vec3(0.0, 1.0, 0.0)), shore * 0.7);
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

const seaFrag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
#include <fog_pars_fragment>
uniform vec3 uSeaCol;
uniform int uOct;
varying vec3 vWPos;
varying vec3 vWNormal;
float waves(vec2 p) {
  float t = uTime;
  return fbm(p * 0.02 + vec2(t * 0.03, t * 0.02), uOct) + 0.5 * fbm(p * 0.07 - vec2(t * 0.05, -t * 0.04), uOct);
}
void main() {
  if (vWPos.x > coastX(vWPos.z)) discard;
  vec2 p = vWPos.xz;
  float dist = length(cameraPosition - vWPos);
  float e = 2.0 + dist * 0.004;
  float h0 = waves(p);
  float hx = waves(p + vec2(e, 0.0));
  float hz = waves(p + vec2(0.0, e));
  float amp = 1.0 - smoothstep(1500.0, 7000.0, dist);
  vec3 n = normalize(vec3((h0 - hx) * 6.0 * amp, 1.0, (h0 - hz) * 6.0 * amp));
  vec3 V = normalize(cameraPosition - vWPos);
  vec3 R = reflect(-V, n);
  float fres = 0.03 + 0.97 * pow(1.0 - max(dot(V, n), 0.0), 5.0);
  vec3 sky = mix(uSkyHorizon, uSkyTop, smoothstep(0.0, 0.6, R.y));
  vec3 body = uSeaCol * (0.45 + 0.55 * uAmbient);
  vec3 col = mix(body, sky, fres * 0.85);
  float sd = max(dot(R, uSunDir), 0.0);
  float glitter = pow(sd, 120.0) * 4.0 + pow(sd, 12.0) * 0.15;
  col += uSunColor * glitter * uSunIntensity * 0.45;
  // foam along the shore
  float shore = 1.0 - smoothstep(0.0, 30.0, coastX(vWPos.z) - vWPos.x);
  col = mix(col, vec3(0.85) * (0.4 + uAmbient * 0.6), shore * 0.35 * (0.6 + 0.4 * h0));
  gl_FragColor = vec4(col, 1.0);
  ${OUTPUT_GLSL}
}
`;

export function Ground() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STANDARD_VERT,
        fragmentShader: groundFrag,
        uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) },
        fog: true,
      }),
    [],
  );
  return (
    <mesh rotation-x={-Math.PI / 2} material={material} renderOrder={-5}>
      <planeGeometry args={[SIZE, SIZE, 1, 1]} />
    </mesh>
  );
}

export default function Sea() {
  const tier = useStore((s) => s.tier);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: STANDARD_VERT,
        fragmentShader: seaFrag,
        uniforms: {
          ...U,
          ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
          uSeaCol: { value: W.cols.seaColor },
          uOct: { value: tier === 'low' ? 2 : 4 },
        },
        fog: true,
      }),
    [tier],
  );
  return (
    <mesh rotation-x={-Math.PI / 2} material={material} renderOrder={-5}>
      <planeGeometry args={[SIZE, SIZE, 1, 1]} />
    </mesh>
  );
}
