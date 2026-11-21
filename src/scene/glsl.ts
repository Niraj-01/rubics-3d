// Shared GLSL snippets. Lighting uniforms come from `uniforms.ts` and are the same objects in every material.

export const UNIFORMS_GLSL = /* glsl */ `
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uSkyTop;
uniform vec3 uSkyHorizon;
uniform vec3 uGroundCol;
uniform vec3 uFogCol;
uniform float uAmbient;
uniform float uWindowGlow;
uniform float uCityGlow;
uniform float uWet;
`;

export const NOISE_GLSL = /* glsl */ `
float hash12(vec2 p) {
  // offset keeps small integer inputs (near the origin) from hashing to ~0
  vec3 p3 = fract(vec3(p.xyx + 61.7) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float hash13(vec3 p3) {
  p3 = fract((p3 + 37.9) * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p, int oct) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (i >= oct) break;
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p;
    a *= 0.5;
  }
  return v;
}
float coastX(float z) {
  return -1750.0 + 220.0 * sin(z * 0.0011) + 120.0 * sin(z * 0.0031 + 1.3);
}
`;

/** Diffuse lighting: sun + hemisphere sky/ground ambient. */
export const LIGHT_GLSL = /* glsl */ `
vec3 shade(vec3 albedo, vec3 n) {
  float sunUp = smoothstep(-0.08, 0.06, uSunDir.y);
  float diff = max(dot(n, uSunDir), 0.0) * uSunIntensity * mix(0.25, 1.0, sunUp);
  vec3 hemi = mix(uGroundCol * 0.55, uSkyTop * 0.7 + uSkyHorizon * 0.3, n.y * 0.5 + 0.5);
  return albedo * (uSunColor * diff * 0.6 + hemi * uAmbient * 1.2);
}
`;

export const STANDARD_VERT = /* glsl */ `
#include <fog_pars_vertex>
varying vec3 vWPos;
varying vec3 vWNormal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWPos = wp.xyz;
  vWNormal = normalize(mat3(modelMatrix) * normal);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

export const OUTPUT_GLSL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
`;
