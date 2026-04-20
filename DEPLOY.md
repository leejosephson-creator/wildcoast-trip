# Deploy Your Trip App — The Simple Way

**Total time: ~15 minutes. No coding, no terminal, no GitHub.**

You'll drag-and-drop the folder onto a website, get a URL, and install that URL on your phones.

---

## Before you start

Make sure you have:
- The `wildcoast-app` folder unzipped on your computer (not the .zip — the actual folder)
- Your phone nearby
- Your son's phone and his mother's phone (or you can send them the URL later)

---

## Step 1 — Create a Vercel account (3 min)

1. Go to **https://vercel.com/signup**
2. Click **Continue with Email** (easiest — no GitHub needed)
3. Enter your email → check inbox → click the verification link
4. When it asks about a team name, pick anything (e.g. your first name)
5. Skip the "invite teammates" step

You're in. Leave this browser tab open.

---

## Step 2 — Deploy the app (2 min)

1. In Vercel, click **Add New → Project** (top right)
2. You'll see options. Look for **"Deploy without Git"** or **"Upload"** — click it
   - *If you don't see it, scroll down — there's a small link that says "Import Third-Party Git Repository?" — ignore that and look for an upload option*
3. **Drag the entire `wildcoast-app` folder onto the upload area**
4. Click **Deploy**

Wait ~2 minutes while it builds. You'll see logs scrolling — that's normal.

When it's done, you'll see **"Congratulations!"** and a URL like:
`wildcoast-app-xyz123.vercel.app`

**Copy that URL.** That's your app, live on the internet.

---

## Step 3 — Install on your iPhone (2 min)

1. Open **Safari** on your iPhone (MUST be Safari — not Chrome, not any other browser)
2. Type the URL from Step 2 into the address bar
3. Wait for the app to load fully
4. Tap the **Share button** at the bottom (square with up arrow)
5. Scroll down in the share menu
6. Tap **"Add to Home Screen"**
7. Tap **"Add"** in the top right

Go to your home screen. You'll see a **Wild Coast** icon (mountains with sun). Tap it — the app opens fullscreen, no browser bars. That's your installed app.

**Test it:** Open Weather, tap "Get live" on Cape Town. You should see real current temperatures in a few seconds. If you do, the deployment worked.

---

## Step 4 — Install on your son's and his mother's phones (2 min each)

Two options:

**Option A: Text them the URL**
Just send the Vercel URL via iMessage/WhatsApp. Tell them to:
- Open the URL in **Safari** (iPhone) or **Chrome** (Android)
- iPhone: Share button → Add to Home Screen → Add
- Android: Menu (3 dots) → Install app OR Add to Home Screen

**Option B: Do it yourself on their phones**
If they're with you, just open Safari on their phone and follow the same steps as Step 3.

---

## That's it. You're done.

The app is now installed on all 3 phones. Each phone has its own data (journal, memories, Big Five count), but the itinerary, bookings, weather, maps, and all other read-only info is the same across all phones.

---

## Common problems

**"I don't see the 'Deploy without Git' option"**
Newer Vercel sometimes requires Git. If that's the case, tell me and I'll walk you through the 5-minute GitHub path instead.

**"The build failed"**
Take a screenshot of the error log and send it to me. 99% of the time it's one file in the wrong place — I can fix it instantly.

**"Weather still doesn't load"**
Open the URL on your laptop first (in Safari or Chrome). Open browser developer tools (F12 → Console tab). Tap "Get live" and tell me what error appears in the console. That'll tell us exactly what's blocking it.

**"I added to home screen but it looks like just a Safari bookmark"**
You used Chrome instead of Safari on iPhone. Delete it, open the URL in Safari, try again.

**"I want to make changes to the app later"**
After the first deploy, Vercel gives you a dashboard. To push updates, you drag-and-drop the folder again from **Project Settings → Deployments → Redeploy**. Or we can move to the GitHub method which auto-updates whenever you change files.

---

## I'm stuck

Tell me **which step number** you're on and **what you see on screen**. I'll walk you through exactly what to click. We'll get it done.
