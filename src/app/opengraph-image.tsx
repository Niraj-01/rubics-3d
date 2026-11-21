import { ImageResponse } from 'next/og';
import { beaumonte, brand } from '@/content';

export const alt = `${beaumonte.name} ${beaumonte.tower} · ${brand.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 72,
          background: 'linear-gradient(180deg, #1b2440 0%, #8a5a4a 62%, #e2ae92 100%)',
          color: '#F2EEE6',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 220,
            bottom: 0,
            width: 120,
            height: 520,
            background: 'linear-gradient(90deg, #6b4a2c, #c9a96e 45%, #3a2a1c)',
            display: 'flex',
          }}
        />
        <div style={{ fontSize: 22, letterSpacing: 8, color: '#C9A96E', textTransform: 'uppercase', display: 'flex' }}>
          {beaumonte.eyebrow}
        </div>
        <div style={{ fontSize: 96, marginTop: 18, display: 'flex' }}>
          {beaumonte.name} {beaumonte.tower}
        </div>
        <div style={{ fontSize: 36, marginTop: 8, color: '#E6D3A3', display: 'flex' }}>{beaumonte.tagline}</div>
      </div>
    ),
    size,
  );
}
