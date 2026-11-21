'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { U } from './weather';
import { coastX } from './towerSpec';

/** A cable-stayed sea link silhouette on the western horizon, as named in the site's "West" view. */
export default function SeaLink() {
  const lights = useRef<THREE.MeshBasicMaterial>(null);
  const { deckLen, cables, x, angle } = useMemo(() => {
    const x = coastX(0) - 320;
    const deckLen = 3200;
    const pts: number[] = [];
    const top = 128;
    for (const pz of [-260, 260]) {
      for (let k = 1; k <= 11; k++) {
        for (const side of [-1, 1]) {
          pts.push(0, top - k * 2.2, pz, 0, 16, pz + side * (k * 22));
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return { deckLen, cables: geo, x, angle: 0.18 };
  }, []);

  useFrame(() => {
    lights.current?.color.setRGB(1.0, 0.75, 0.45).multiplyScalar(0.05 + U.uCityGlow.value * 2.2);
  });

  return (
    <group position={[x, 0, 300]} rotation-y={angle}>
      <mesh position={[0, 15, 0]}>
        <boxGeometry args={[22, 2.2, deckLen]} />
        <meshStandardMaterial color="#9a958c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 16.4, 0]}>
        <boxGeometry args={[23, 0.4, deckLen]} />
        <meshBasicMaterial ref={lights} toneMapped={false} />
      </mesh>
      {[-260, 260].map((pz) => (
        <group key={pz} position={[0, 0, pz]}>
          <mesh position={[-6, 64, 0]} rotation-z={-0.08}>
            <boxGeometry args={[3, 128, 5]} />
            <meshStandardMaterial color="#b9b3a8" roughness={0.7} />
          </mesh>
          <mesh position={[6, 64, 0]} rotation-z={0.08}>
            <boxGeometry args={[3, 128, 5]} />
            <meshStandardMaterial color="#b9b3a8" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <lineSegments geometry={cables}>
        <lineBasicMaterial color="#d8d2c6" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
