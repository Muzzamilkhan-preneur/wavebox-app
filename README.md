# Wavebox 🎵

Your personal offline music player — built with React + TypeScript + Vite + Tailwind CSS.

## Setup (local)

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Option B — Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Vercel auto-detects Vite — just click **Deploy**

### Option C — Drag & Drop
1. Run `npm run build` locally — it creates a `dist/` folder
2. Go to [vercel.com](https://vercel.com) → New Project → drag the `dist/` folder

## Install on Android as PWA
1. Open your Vercel URL in **Chrome**
2. Tap the menu (⋮) → **"Add to Home Screen"**
3. It installs like a native app — icon on home screen, full screen, no browser chrome
4. Lock-screen / swipe-down notification controls work automatically via the **Media Session API**

## Features
- Upload MP3, AAC, FLAC, WAV
- Play / Pause / Next / Previous
- Shuffle & Repeat (off / all / one)
- Like songs ❤️
- Queue view — see and manage what's playing next
- Scrubber with drag-to-seek
- Volume control
- Lock-screen media controls (Media Session API)
- Keyboard shortcuts:
  - `Space` — play / pause
  - `←` — previous song
  - `→` — next song

## Tech Stack
- **React 18** + **TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS 3** (styling)
- **Zustand** (state management)
- **Lucide React** (icons)
