# Wild Coast Trip App

Installable trip companion for Dan's South Africa trip with his son, June 2026.

## What this is

A Progressive Web App (PWA) — a real app you can install on your phone, your son's phone, and your ex's phone. Once installed it works offline, appears on the home screen like a native app, and has **live weather that actually works** (unlike the Claude artifact version).

## Features that work when deployed

- ✅ **Live weather** from Open-Meteo (no API key, free)
- ✅ **Home screen install** on iPhone and Android
- ✅ **Offline support** — works without internet once installed
- ✅ **Journal, memories, missions, Big Five tracker, packing, bookings, reservations, flights, maps, phrases, SOS, tip calculator, Kid Mode**
- ✅ **Per-device data** — each phone has its own copy (upgrade to shared later if you want)

---

## Deploy to Vercel (free, ~15 minutes)

You need: a GitHub account (free) and a Vercel account (free).

### Step 1: Get the code into GitHub

If you've never used GitHub before, this is the slowest step. Easiest path:

1. Go to https://github.com and create an account
2. Install **GitHub Desktop** (https://desktop.github.com) — it's a simple app, no command line needed
3. In GitHub Desktop: **File → New Repository**
    - Name: `wildcoast-trip`
    - Local path: pick any folder
    - Click **Create**
4. Copy all the files from this `wildcoast-app` folder into the GitHub Desktop folder it created
5. In GitHub Desktop you'll see all the files listed as changes
6. Add a commit message like "Initial app" and click **Commit to main**
7. Click **Publish repository** at the top — make it **private** if you want

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with your GitHub account
2. Click **Add New → Project**
3. Find `wildcoast-trip` in the list and click **Import**
4. Don't change any settings — just click **Deploy**
5. Wait ~2 minutes. You'll get a URL like `wildcoast-trip.vercel.app`

**That's it.** The app is now live on the internet.

### Step 3: Install on each phone

Send the URL to yourself, your son, and your ex. On each phone:

**iPhone:**
1. Open the URL in **Safari** (important — must be Safari, not Chrome)
2. Tap the Share button (square with up arrow)
3. Scroll down, tap **Add to Home Screen**
4. Tap **Add**

The app now appears on the home screen with the Wild Coast icon. Opens fullscreen like a native app.

**Android:**
1. Open the URL in Chrome
2. Tap the 3-dot menu
3. Tap **Install app** or **Add to Home Screen**

---

## Making changes to the app

Any edits you make to the files — push them back through GitHub Desktop, and Vercel automatically redeploys in ~1 minute. All 3 phones get the update next time they open the app.

## Running it locally first (optional)

If you want to test before deploying:

```bash
cd wildcoast-app
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Want to upgrade later?

**Shared data across all 3 phones** (real-time sync): Add Firebase. ~30 min setup once you're on Vercel. Let me know when you're ready.

**Custom domain** (e.g. `wildcoast.app`): Buy a domain, point it at Vercel. ~5 min.

## Troubleshooting

**Weather not loading:** Check you have signal. Open-Meteo is reliable but needs internet. Once fetched, it caches for offline.

**App not showing on home screen after Add to Home Screen:** Sometimes iOS takes a moment. Check your home screen pages by swiping.

**Changes not showing after redeploy:** Force-quit the app and reopen. PWAs cache aggressively.
