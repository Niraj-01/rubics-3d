# Rubics Realty 3D Experience (OnShore Labs assignment)

Product Engineer Intern assignment for OnShore Labs. Rebuild rubicsrealty.com as an immersive real-time 3D site around BeauMonté Tower C, Sion.
**Deadline: Monday 23 Nov 2026, end of day. Deliverable: one public URL that works on laptop and phone.**

## Hard rules
1. **No invented facts.** Every number, name, address and claim comes from `src/content.ts`, which is sourced only from rubicsrealty.com, /beaumonte.html and /media.html. If something isn't in content.ts, don't write it. No made-up carpet areas, prices, floor allocations or amenity locations.
2. **Real-time 3D only.** No background videos, no pre-rendered image sequences. Everything responds to scroll and input.
3. **Never leave the 3D world.** Content sections sit as frosted-glass panels over the live canvas. The canvas is `position: fixed` behind everything, always rendering.
4. **Mobile is a first-class target.** Mid-range Android must be smooth. Check every feature at 390px width before calling it done.
5. **Procedural over downloaded.** Build the tower, city, sea and clouds in code. Keep total assets under ~3 MB so the first view is fast.
6. Commit after every working feature. Push to main so Vercel redeploys.

## Stack
- Next.js (App Router) + TypeScript, `src/` dir
- three, @react-three/fiber, @react-three/drei, @react-three/postprocessing (bloom only, disabled on low tier)
- gsap (tweens for weather and fly-to moves), lenis (smooth scroll)
- zustand (global state: scroll progress, camera mode, weather, selected floor)
- Tailwind CSS
- Fonts: Cormorant Garamond (serif headlines), Manrope (body), via `next/font/google`
- Deploy: Vercel

## Next.js rules for this project
- It's a single route (`app/page.tsx`). Don't add extra pages; sections are anchors on one scroll.
- Load the 3D canvas with `next/dynamic(() => import('@/scene/Experience'), { ssr: false })`. three/R3F must never run on the server.
- Every file under `scene/` and `ui/` that uses hooks, window, Lenis or R3F starts with `'use client'`.
- `app/page.tsx` stays a thin shell: loader, dynamic canvas, overlay UI, scroll container.
- Lenis lives in a client `SmoothScroll` provider in `app/layout.tsx`.
- SEO via the `metadata` export in `layout.tsx` (title, description, og:image), favicon in `app/`.
- Static images (logo, team photos) downloaded into `public/`, rendered with `next/image` in the HTML panels.
- Run `npm run build` before every push. Fix all type and lint errors; a failed Vercel build means no live link.

## Brand
- Premium, minimal, quiet. Gold on near-black.
- Palette: bg `#0B0B0C`, gold `#C9A96E`, gold-light `#E6D3A3`, text `#F2EEE6`, muted `#9A958C`
- Glass panels: `backdrop-filter: blur(18px) saturate(140%)`, bg `rgba(18,18,20,0.45)`, 1px border `rgba(230,211,163,0.18)`, radius 18px
- Serif headlines, generous letter-spacing on small caps labels, lots of empty space. No big banners over the 3D.
- Motion: everything eased (power2/power3, or expo for camera). Nothing snaps.

## Architecture
```
src/
  app/
    layout.tsx            # fonts, metadata, SmoothScroll provider
    page.tsx              # thin shell: Loader + dynamic(Experience, ssr:false) + overlay UI
    globals.css
  providers/
    SmoothScroll.tsx      # Lenis, writes progress to the store
  content.ts              # single source of truth for all copy and facts
  store.ts                # zustand: progress, mode ('scroll'|'floor'|'pool'), weather, fog, floor
  scene/
    Experience.tsx        # <Canvas>, lights, fog, PerformanceMonitor
    Tower.tsx             # procedural tower, instanced window grid, emissive window shader
    AmenityDeck.tsx       # Level 6 deck, 50 m lap pool, kids pool, deck, cabanas
    City.tsx              # instanced buildings, night window lights, roads glow
    Sea.tsx               # sea plane on the west horizon
    Sky.tsx               # gradient sky shader + sun, driven by weather state
    Clouds.tsx            # cloud layer (opening shot + fog sea)
    CameraRig.tsx         # scroll path + fly-to modes, damped
    cameraPath.ts         # keyframes: { t, pos, target, panelId? }
    weatherPresets.ts     # sunrise / day / night / monsoon(bonus)
  ui/
    Loader.tsx            # branded loading screen (useProgress)
    Brand.tsx             # small Rubics wordmark + tagline overlay
    ScrollPanels.tsx      # panels that fade in/out by scroll range
    WeatherControl.tsx    # floating glass control
    FloorPicker.tsx       # "Choose your floor" glass panel
    AmenityControl.tsx    # "View the pool" / "Back to tower"
    sections/             # Stats, Vision, Projects, Team, About, Media, Enquiry, Footer
```

## Key technical decisions
- **Camera path:** keyframes in `cameraPath.ts`. Build two CatmullRomCurve3 (positions and look-at targets). Map Lenis scroll progress 0..1 to curve t. In `useFrame`, damp camera toward the sampled point (`maath/easing.damp3`), so reverse scroll replays the same path smoothly.
- **Modes:** in `floor` or `pool` mode, stop driving the camera from scroll (`lenis.stop()`), GSAP-tween the camera to the target, show a "Back" button. On back, tween to the current scroll sample and `lenis.start()`.
- **Weather:** one reactive state object (sunElevation, sunColor, skyTop, skyHorizon, fogColor, fogNear/Far, ambient, windowGlow, cityGlow, cloudOpacity). Presets are plain objects. Switching = `gsap.to(stateObj, preset)`, and the scene reads from it each frame. Fog toggle tweens fog distance and cloud layer height/opacity.
- **Windows:** one InstancedMesh per facade or a custom shader using a hashed per-window random so a % of windows glow at night, scaled by `windowGlow`.
- **Floor heights:** `floorToY(level)` helper. Camera for floor N sits outside the facade at that Y looking outward toward the sea/skyline, so higher floors naturally show more city and sea.
- **Perf:** `dpr={[1, 1.5]}`, drei `PerformanceMonitor` + `AdaptiveDpr`, instancing everywhere, no real-time shadows (bake fake AO into materials), bloom off on low tier, city instance count halved on mobile.
