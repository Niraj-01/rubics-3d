'use client';

import { useEffect } from 'react';
import { towerFacts } from '@/content';
import { TIME_STOPS } from '@/scene/weatherPresets';
import { useStore } from '@/store';

/**
 * Shareable views: ?floor=32&time=night&weather=monsoon&fog=0 (or ?view=pool).
 * Read once when the scene is ready; kept in sync with replaceState afterwards.
 */
export default function UrlState() {
  const sceneReady = useStore((s) => s.sceneReady);

  useEffect(() => {
    if (!sceneReady) return;
    const q = new URLSearchParams(window.location.search);
    const s = useStore.getState();

    const time = q.get('time');
    if (time) {
      const stop = TIME_STOPS.find((t) => t.id === time);
      const n = Number(time);
      if (stop) s.setTime(stop.t);
      else if (!Number.isNaN(n)) s.setTime(n);
    }
    if (q.get('weather') === 'monsoon' || q.get('weather') === 'rain') s.setWeather('monsoon');
    if (q.get('fog') === '0') s.setFog(false);

    const floor = Number(q.get('floor'));
    // let the loader fade before the flight starts
    const t = window.setTimeout(() => {
      if (q.get('view') === 'pool' || floor === towerFacts.eDeckLevel) s.enterPool();
      else if (floor > towerFacts.eDeckLevel && floor <= towerFacts.topLevel) s.enterFloor(Math.round(floor));
    }, 900);

    let pending = 0;
    const write = () => {
      const { mode, floor: f, time: tm, weather, fog } = useStore.getState();
      const next = new URLSearchParams(window.location.search);
      ['floor', 'view', 'time', 'weather', 'fog'].forEach((k) => next.delete(k));
      if (mode === 'floor') next.set('floor', String(f));
      if (mode === 'pool') next.set('view', 'pool');
      if (tm > 0.001) {
        const stop = TIME_STOPS.find((x) => Math.abs(x.t - tm) < 0.001);
        next.set('time', stop ? stop.id : tm.toFixed(2));
      }
      if (weather === 'monsoon') next.set('weather', 'monsoon');
      if (!fog) next.set('fog', '0');
      const qs = next.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(window.history.state, '', url);
      }
    };
    const unsub = useStore.subscribe((cur, prev) => {
      if (cur.mode === prev.mode && cur.floor === prev.floor && cur.time === prev.time && cur.weather === prev.weather && cur.fog === prev.fog) return;
      window.clearTimeout(pending);
      pending = window.setTimeout(write, 400);
    });
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(pending);
      unsub();
    };
  }, [sceneReady]);

  return null;
}
