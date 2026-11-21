# Rubics 3D: build plan (Fri 20 Nov to Mon 23 Nov)

**Target: submit Monday by 6 pm, not midnight.** Leave buffer for a broken deploy or a phone bug.

The thing that wins this: the opening shot, the weather switch and the floor fly-up feeling *cinematic*. Content completeness is table stakes. Spend polish time on camera motion and lighting, not on extra features.

## Setup (do this first, 15 min)
```bash
npx create-next-app@latest rubics-3d --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd rubics-3d
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis zustand maath
npm i -D @types/three
gh repo create rubics-3d --public --source=. --push
```
Run `npm run build` once locally to confirm the empty app builds before you start.
Drop `CLAUDE.md` in the repo root and `content.ts` in `src/`. Connect the repo to Vercel right away so every push gives you a live URL you can open on your phone.

---

## Tonight (Fri): skeleton that's already live
Goal by bed: public URL showing a tower in a sky, and scrolling moves the camera along a path.

**Prompt 1: content**
> Read CLAUDE.md. Open rubicsrealty.com, /beaumonte.html and /media.html with your fetch tool and fill every TODO_VERBATIM in src/content.ts with the exact site wording. Don't paraphrase, don't add anything. List anything you couldn't find.

(Media page loads client-side. Check it yourself in Chrome. If empty, the plan is a "View all media" link, which the brief allows.)

**Prompt 2: scene base**
> Build the scene base per CLAUDE.md, following the Next.js rules (Experience loaded via next/dynamic with ssr:false, 'use client' everywhere it's needed): fixed full-screen Canvas, Sky.tsx gradient shader with a sun, a ground plane, and a procedural Tower.tsx. Tower: ~47 storeys total (podium + 41 habitable), slender rectangular plan with chamfered corners, glass curtain wall with vertical gold-bronze fins, a crown at the top, a visible Level 6 podium deck. Windows as an instanced grid with a shader uniform `windowGlow` so lit windows can be driven later. Add floorToY(level). Keep it premium and minimal, not blocky.

**Prompt 3: scroll camera**
> Add Lenis as a client SmoothScroll provider in app/layout.tsx and build CameraRig.tsx. Page is a tall scroll container (~800vh). cameraPath.ts holds ~8 keyframes: (1) high above clouds looking down at the crown, (2) descending through clouds, (3) hero 3/4 view of the tower against the skyline, (4) orbit to the west face toward the sea, (5) glide up the facade, (6) near the Level 6 deck, (7) wide pull-back, (8) slow ambient orbit for the content sections. Use CatmullRom curves for position and target, damp in useFrame. Reverse scroll must replay smoothly. Add a debug overlay (?debug) showing progress and camera pos so I can tune keyframes.

Push. Open on your phone. Sleep.

---

## Saturday: world + weather + opening
**Prompt 4: world**
> Add City.tsx (instanced buildings in a ring around the tower, denser toward the south, lower near the tower, emissive windows driven by `cityGlow`), Sea.tsx (sea plane on the west horizon with a cheap animated normal or fresnel shimmer), and Clouds.tsx (a cloud layer below tower top for the opening, using drei Clouds or soft billboards). Halve instance counts on mobile.

**Prompt 5: weather**
> Build the weather system per CLAUDE.md. weatherPresets.ts with sunrise (warm golden, low sun, soft fog below the tower), day, and night (dark sky, city lights on, tower windows lit). Fog on/off toggle: on = sea of clouds hides the city, off = full city visible. Switching tweens every value with GSAP over ~2.5s. WeatherControl.tsx: small floating frosted-glass pill, bottom-left, icons + labels, thumb-friendly (44px targets), active state in gold. Bonus if time: monsoon (grey sky, rain particles, wet sheen).

**Prompt 6: opening + overlay**
> Make the opening shot cinematic: start high above the cloud layer at sunrise, crown piercing the clouds, slight idle drift before the user scrolls. Add Brand.tsx: small Rubics logo top-left and the tagline in small serif type, fading out once scrolling starts. Add a subtle "Scroll to explore" cue. No big text blocks over the 3D.

**Prompt 7: scroll panels**
> Build ScrollPanels.tsx. Each panel has a progress range from cameraPath keyframes and fades + slides in (opacity, 16px y, blur 6px→0) and out as the camera moves on. Panels in order: Stats, Where Vision Meets Form, BeauMonté facts (41 floors, 7 per floor, configs, location + connectivity), Views, Amenities teaser. All copy from content.ts. Glass styling per CLAUDE.md. Position panels so they never cover the tower on mobile (bottom sheet style on small screens).

---

## Sunday: floors, pool, all content
**Prompt 8: floor picker**
> Build FloorPicker.tsx: "Choose your floor" glass panel opened from a floating button. Up/down arrows plus a slider for levels 6 to 47 (confirm the top level matches 41 habitable floors in the model). Shows level number and floorInfo(level) from content.ts. "Enter level N" sets mode='floor', stops Lenis, and GSAP-flies the camera up the outside of the facade (path hugs the tower, ~2.5s, expo ease) to a point outside that floor looking west toward the sea. Higher floors must visibly reveal more sea and city. Add a "Back to tower" button that returns to the current scroll position.

**Prompt 9: amenity deck**
> Build AmenityDeck.tsx on Level 6: 50 m lap pool (to scale relative to the tower), kids' pool, pool deck in light stone, cabanas, planters, warm deck lights for night. Water shader with gentle ripples and reflection of the sky colour. Add a "Level 6 amenity deck" entry in the floor picker and on the scroll path, and a "View the pool" button that sets mode='pool' and moves the camera close over the pool, with "Back to tower".

**Prompt 10: content sections**
> After the camera path, render the remaining sections as glass panels over the slow ambient orbit, so the 3D never disappears: Projects (BeauMonté hero + Lalbaug "Rising soon"), Led By Legacy (3 team cards with photo, role, bio, expand on tap), About Rubics (tabs: Life at Rubics, Design Philosophy, Our Vision, Founder's Message, Our Mission, Sustainability & Lifestyle), Media (items or link out), Enquiry, Footer. Add a minimal top nav that jumps to sections via Lenis scrollTo.

**Prompt 11: enquiry + footer + loader**
> Enquiry form: name, phone (Indian 10-digit, optional +91), email, project of interest (select from content.enquiry.projects). Inline validation on blur, disabled submit until valid, fake 800ms submit then a confirmation state in the same panel. Footer with Worli address, email, phone, social icons, Privacy Policy, Disclaimer, and MahaRERA P51900050715 with link. Loader.tsx: branded screen with logo, thin gold progress line driven by useProgress, fades into the opening shot.

---

## Monday: phone, polish, ship
**Prompt 12: performance**
> Do a mobile performance pass. Add PerformanceMonitor + AdaptiveDpr, cap dpr at 1.5, detect low tier (hardwareConcurrency, deviceMemory, screen width) and reduce city instances, disable bloom, simplify water. Make sure touch scrolling drives the camera, no scroll jank, no layout shift. Report bundle size and draw calls.

Then **you** test on a real mid-range Android in Chrome. Check: loader, opening, full scroll down and back up, every weather state, floor 6 / 20 / 41, pool, form, footer links. Also Safari on iPhone if you can borrow one.

**Prompt 13: detail pass**
> Polish pass: hover and tap states on every button (gold underline or glow, scale 0.97 on press), focus rings, panel enter/exit timing, consistent spacing scale, serif headline sizes on mobile, safe-area insets on iOS, favicon + og:image + title via the Next metadata export. Run npm run build and fix every warning. Check every fact on the page against content.ts and list any mismatch.

Final checklist before sending:
- [ ] Every fact matches the live Rubics site
- [ ] Opening, scroll path, weather, fog, floor picker, pool all work forward and back
- [ ] Works on laptop and phone, link opens without login
- [ ] No console errors
- [ ] Short reply email with the link, plus 2 to 3 lines on what you built and the stack

## If you're running behind (cut in this order)
1. Monsoon state
2. Day preset (keep sunrise + night, those are required)
3. Fancy water, use a flat tinted plane
4. Team card expand animation

Never cut: opening shot, smooth reverse scroll, floor fly-up, mobile.
