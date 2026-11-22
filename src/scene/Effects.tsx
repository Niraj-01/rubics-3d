'use client';

import { Bloom, EffectComposer, Noise, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';

/** High tier only, and loaded on demand so phones never download it. */
export default function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.92} luminanceSmoothing={0.25} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* a breath of film grain, after tone mapping so it reads evenly in shadows and highlights */}
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.06} />
    </EffectComposer>
  );
}
