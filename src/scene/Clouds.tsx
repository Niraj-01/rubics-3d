'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';
import { NOISE_GLSL, STANDARD_VERT, UNIFORMS_GLSL } from './glsl';
import { U, W } from './weather';

const frag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
#include <fog_pars_fragment>
uniform float uLayer;     // 0 bottom .. 1 top of the stack
uniform float uOpacity;
uniform float uCover;
uniform float uScale;
uniform float uSoft;
uniform float uClear; // radius kept clear around the podium (fog sea only)
uniform int uOct;
uniform vec3 uLit;
uniform vec3 uShade;
varying vec3 vWPos;
varying vec3 vWNormal;
void main() {
  vec2 p = vWPos.xz * uScale + vec2(uTime * 0.006, uTime * 0.0025);
  float n = fbm(p, uOct);
  float n2 = vnoise(p * 4.1 + 7.3);
  float d = n * 0.82 + n2 * 0.18;
  // upper layers are thinner, so the stack reads as domed puffs
  float thr = uCover + uLayer * 0.16;
  float a = smoothstep(thr, thr + uSoft, d);
  // thin edges and lower sheets sit in shade; dense tops catch the light
  float lightness = clamp(uLayer * 0.55 + (d - thr) * 3.2 + 0.05, 0.0, 1.0);
  vec3 col = mix(uShade, uLit, lightness);
  col += uSunColor * pow(lightness, 3.0) * 0.12 * uSunIntensity;
  // soft fade as the camera passes through a sheet
  a *= smoothstep(1.5, 16.0, abs(cameraPosition.y - vWPos.y));
  a *= 1.0 - smoothstep(3200.0, 4300.0, length(vWPos.xz - cameraPosition.xz));
  a *= smoothstep(uClear, uClear * 1.9, length(vWPos.xz));
  a *= uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

type StackProps = {
  base: number;
  spacing: number;
  layers: number;
  scale: number;
  coverBias: number;
  soft: number;
  source: 'opening' | 'fogSea';
};

function CloudStack({ base, spacing, layers, scale, coverBias, soft, source }: StackProps) {
  const group = useRef<THREE.Group>(null);
  const tier = useStore((s) => s.tier);
  const materials = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => {
        return new THREE.ShaderMaterial({
          vertexShader: STANDARD_VERT,
          fragmentShader: frag,
          uniforms: {
            ...U,
            ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
            uLayer: { value: layers > 1 ? i / (layers - 1) : 0 },
            uOpacity: { value: 1 },
            uCover: { value: 0.45 },
            uScale: { value: scale },
            uSoft: { value: soft },
            uClear: { value: source === 'fogSea' ? 85 : 0 },
            uOct: { value: tier === 'low' ? 3 : 4 },
            uLit: { value: W.cols.cloudLit },
            uShade: { value: W.cols.cloudShade },
          },
          transparent: true,
          depthWrite: false,
          fog: true,
        });
      }),
    [layers, scale, soft, source, tier],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const amount = source === 'opening' ? W.openingClouds.value : W.fogSea.value;
    g.visible = amount > 0.01;
    if (!g.visible) return;
    // the fog sea sinks a little as it clears
    g.position.y = source === 'fogSea' ? -12 * (1 - amount) : 0;
    materials.forEach((m) => {
      m.uniforms.uOpacity.value = Math.min(1, amount * 1.15);
      m.uniforms.uCover.value = W.nums.cloudCover + coverBias + (1 - amount) * 0.25;
    });
  });

  return (
    <group ref={group}>
      {materials.map((m, i) => (
        <mesh key={i} position={[0, base + i * spacing, 0]} rotation-x={-Math.PI / 2} material={m} renderOrder={1 + i}>
          <planeGeometry args={[9000, 9000, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Clouds() {
  const tier = useStore((s) => s.tier);
  const low = tier === 'low';
  return (
    <>
      <CloudStack source="opening" base={104} spacing={4.5} layers={low ? 4 : 6} scale={0.0019} coverBias={-0.05} soft={0.2} />
      <CloudStack source="fogSea" base={22} spacing={5} layers={low ? 3 : 5} scale={0.0016} coverBias={-0.12} soft={0.34} />
    </>
  );
}
