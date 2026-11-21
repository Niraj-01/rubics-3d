import type { WeatherName } from '@/store';

export type WeatherPreset = {
  // numbers
  sunElevation: number; // degrees
  sunAzimuth: number; // degrees, 0 = east (+X), 90 = south (+Z)
  sunIntensity: number;
  sunDisk: number;
  sunGlow: number;
  ambient: number;
  envIntensity: number;
  fogNear: number;
  fogFar: number;
  windowGlow: number;
  cityGlow: number;
  stars: number;
  cloudCover: number; // 0 = dense, 1 = sparse
  rain: number;
  wet: number;
  // colours
  sunColor: string;
  skyTop: string;
  skyHorizon: string;
  fogColor: string;
  groundColor: string;
  seaColor: string;
  cloudLit: string;
  cloudShade: string;
};

export const WEATHER_PRESETS: Record<WeatherName, WeatherPreset> = {
  sunrise: {
    sunElevation: 6,
    sunAzimuth: 18,
    sunIntensity: 2.6,
    sunDisk: 1,
    sunGlow: 1,
    ambient: 0.62,
    envIntensity: 0.75,
    fogNear: 500,
    fogFar: 7200,
    windowGlow: 0.22,
    cityGlow: 0.15,
    stars: 0,
    cloudCover: 0.42,
    rain: 0,
    wet: 0,
    sunColor: '#ffb372',
    skyTop: '#33497a',
    skyHorizon: '#f2b48a',
    fogColor: '#e2ae92',
    groundColor: '#6b5f58',
    seaColor: '#2e4160',
    cloudLit: '#ffe0c2',
    cloudShade: '#a98794',
  },
  day: {
    sunElevation: 58,
    sunAzimuth: 70,
    sunIntensity: 3.0,
    sunDisk: 1,
    sunGlow: 0.6,
    ambient: 0.95,
    envIntensity: 1,
    fogNear: 900,
    fogFar: 9500,
    windowGlow: 0,
    cityGlow: 0,
    stars: 0,
    cloudCover: 0.46,
    rain: 0,
    wet: 0,
    sunColor: '#fff3df',
    skyTop: '#2f6db3',
    skyHorizon: '#bcd5ea',
    fogColor: '#c3d5e6',
    groundColor: '#7c776d',
    seaColor: '#1f5574',
    cloudLit: '#ffffff',
    cloudShade: '#b3c2d3',
  },
  night: {
    sunElevation: 38,
    sunAzimuth: -50,
    sunIntensity: 0.35,
    sunDisk: 0.55,
    sunGlow: 0.25,
    ambient: 0.22,
    envIntensity: 0.18,
    fogNear: 700,
    fogFar: 8000,
    windowGlow: 1,
    cityGlow: 1,
    stars: 1,
    cloudCover: 0.45,
    rain: 0,
    wet: 0,
    sunColor: '#a9bde0',
    skyTop: '#03060f',
    skyHorizon: '#121f38',
    fogColor: '#0d1729',
    groundColor: '#121419',
    seaColor: '#060c18',
    cloudLit: '#3f4d69',
    cloudShade: '#121a2b',
  },
  monsoon: {
    sunElevation: 35,
    sunAzimuth: 60,
    sunIntensity: 0.7,
    sunDisk: 0,
    sunGlow: 0.15,
    ambient: 0.75,
    envIntensity: 0.55,
    fogNear: 120,
    fogFar: 2600,
    windowGlow: 0.4,
    cityGlow: 0.35,
    stars: 0,
    cloudCover: 0.3,
    rain: 1,
    wet: 1,
    sunColor: '#c9ced6',
    skyTop: '#474f59',
    skyHorizon: '#8c939b',
    fogColor: '#7f878f',
    groundColor: '#45484b',
    seaColor: '#34434b',
    cloudLit: '#b0b7bf',
    cloudShade: '#5f666e',
  },
};

export const WEATHER_ORDER: { id: WeatherName; label: string }[] = [
  { id: 'sunrise', label: 'Sunrise' },
  { id: 'day', label: 'Day' },
  { id: 'night', label: 'Night' },
  { id: 'monsoon', label: 'Monsoon' },
];
