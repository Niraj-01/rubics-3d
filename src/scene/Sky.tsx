'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NOISE_GLSL, UNIFORMS_GLSL } from './glsl';
import { U, W } from './weather';

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww; // pin to the far plane
}
`;

const frag = /* glsl */ `
${UNIFORMS_GLSL}
${NOISE_GLSL}
uniform float uSunDisk;
uniform float uSunGlow;
uniform float uStars;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uSkyHorizon, uSkyTop, pow(smoothstep(-0.02, 0.65, h), 0.55));
  // seamless with fog below the horizon
  col = mix(col, uFogCol, smoothstep(0.06, -0.04, h));

  float sd = max(dot(d, uSunDir), 0.0);
  float glow = pow(sd, 6.0) * 0.32 + pow(sd, 48.0) * 0.55 + pow(sd, 900.0) * 1.2;
  // warm band along the horizon on the sun side
  float band = pow(sd, 2.0) * exp(-abs(h) * 14.0) * 0.45;
  col += uSunColor * (glow + band) * uSunGlow;
  float disk = smoothstep(0.99955, 0.99975, sd) * uSunDisk * smoothstep(-0.01, 0.01, h);
  col += uSunColor * disk * 7.0;

  // stars
  vec3 p = d * 420.0;
  vec3 cell = floor(p);
  float s = hash13(cell);
  float star = smoothstep(0.9988, 1.0, s) * smoothstep(0.02, 0.25, h);
  float tw = 0.65 + 0.35 * sin(uTime * (1.0 + s * 3.0) + s * 40.0);
  col += vec3(0.9, 0.93, 1.0) * star * tw * uStars * 2.2;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export default function Sky() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: { ...U, uSunDisk: { value: 1 }, uSunGlow: { value: 1 }, uStars: { value: 0 } },
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ camera }) => {
    mesh.current?.position.copy(camera.position);
    material.uniforms.uSunDisk.value = W.nums.sunDisk;
    material.uniforms.uSunGlow.value = W.nums.sunGlow;
    material.uniforms.uStars.value = W.nums.stars;
  });

  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[5000, 48, 24]} />
    </mesh>
  );
}
