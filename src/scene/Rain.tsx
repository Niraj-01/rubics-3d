'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';
import { W } from './weather';

const BOX = new THREE.Vector3(140, 90, 140);

const vert = /* glsl */ `
uniform float uTime;
uniform vec3 uCam;
uniform vec3 uBox;
attribute float aEnd;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y = mod(p.y - uTime * 38.0, uBox.y);
  // wrap the volume around the camera so drops stay put in world space
  vec3 wp = uCam + mod(p - uCam, uBox) - uBox * 0.5;
  wp.y -= aEnd * 1.6;
  wp.x -= aEnd * 0.25;
  vAlpha = 1.0 - aEnd * 0.8;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;

const frag = /* glsl */ `
uniform float uRain;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(vec3(0.78, 0.82, 0.88), 0.32 * vAlpha * uRain);
}
`;

export default function Rain() {
  const ref = useRef<THREE.LineSegments>(null);
  const tier = useStore((s) => s.tier);
  const count = tier === 'low' ? 1200 : 3000;
  const { geometry, material } = useMemo(() => {
    let seed = 3;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pos = new Float32Array(count * 6);
    const end = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const x = rand() * BOX.x;
      const y = rand() * BOX.y;
      const z = rand() * BOX.z;
      pos.set([x, y, z, x, y, z], i * 6);
      end.set([0, 1], i * 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uBox: { value: BOX }, uRain: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });
    return { geometry, material };
  }, [count]);

  useFrame(({ camera, clock }) => {
    const r = W.nums.rain;
    if (ref.current) ref.current.visible = r > 0.01;
    material.uniforms.uRain.value = r;
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uCam.value.copy(camera.position);
  });

  return <lineSegments ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={20} />;
}
