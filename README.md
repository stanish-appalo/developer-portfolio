# Developer Portfolio — Stanish Appalo JA

A light, editorial personal-brand site that showcases **12 web & software projects** in one
place — including a live, deployed SaaS, an animated agency site, a Next.js app, and a PWA.
Built with **vanilla HTML, CSS, and JavaScript** (no framework, no build step).

> The umbrella site to link from an Upwork profile or proposals — it ties the projects
> together and presents skills, process, FAQ, and contact info.

## ✨ Highlights

- **Cream "editorial" design** — warm paper background, oversized Bricolage Grotesque
  headlines, Space Mono labels, generous whitespace.
- **Bundled project screenshots** — each project card shows a real screenshot of the deployed
  site (in `assets/shots/`), with a styled fallback if an image can't load.
- **Featured rows + grid** — flagship projects as large alternating rows, the rest in a
  compact card grid. Code-only and confidential client work get tasteful no-preview tiles.
- **Scroll-into-TV showreel** — a retro TV plays a live animated code screen; scroll *into* it
  (GSAP ScrollTrigger zoom) and the screen hands off to the Design Lab. Drop a clip at
  `assets/video/reel.mp4` to replace the code screen.
- **The Design Lab** (`demos/`) — six full standalone pages, each a different visual language:
  Spatial 3D, Interactive 3D, Neo-Brutalist, Glass & Aurora, Cyber-Terminal, Kinetic Type.
- **"Pixel"** — a procedural Three.js robot near the footer that hops, tracks drags, and waves on tap.
- **Sections** — Hero · marquee · stats · Work · Showreel · Design Lab · About · Process · FAQ · Contact.
- **Motion** — custom cursor, magnetic buttons, scroll reveals, count-up stats, scroll
  progress, FAQ accordion, GSAP + Three.js. All gated by `prefers-reduced-motion`.
- Fully responsive, accessible, mobile nav.

## 📂 Projects featured

Uptime Monitor (live SaaS) · norml. Studio (3D WebGL) · StanishTech (Next.js) · GymTrack (PWA) ·
norml. agency site · Service-Business Website · Lead-Gen Landing · Redesign Case Study ·
Multilingual Contact Form · URL Shortener API · Inventory Management · Real-Time Chat ·
Acheron Billing App (confidential client work).

## 🧪 Design Lab demos (`demos/`)

Self-contained single-file pages (inline CSS+JS, CDN libs) linked from the Lab section:
`3d-pitch.html` · `interactive-3d.html` · `neobrutalism.html` · `glassmorphism.html` ·
`cyberpunk.html` · `kinetic.html`.

## 🚀 Run locally

```bash
python -m http.server 5500
# visit http://localhost:5500
```

Bundled screenshots load offline; the Design Lab demos pull GSAP/Three.js from CDNs at runtime.

---

*Designed & built by Stanish Appalo JA — from scratch, by hand.*
