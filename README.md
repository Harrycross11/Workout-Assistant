# Workout Assistant

A mobile-first, installable PWA that shows your workout/rest day and meal
plan for today, tracks weights/body weight/progress photos, and reminds you
about your workout and weekly check-ins. Everything is stored **only on your
device** (localStorage + IndexedDB) - there's no backend, no account, and
nothing is ever uploaded anywhere.

Plain HTML/CSS/JavaScript, no build step, no dependencies.

## Files

- `index.html` - the app shell (all screens live in here, shown/hidden by JS)
- `style.css` - light/dark theme, mobile-first layout
- `data.js` - the workout split + meal plan template, and the plan-builder
  (exercise/meal swaps based on your onboarding profile)
- `storage.js` - localStorage (settings, logs, profile) + IndexedDB (photos)
- `chart.js` - a tiny dependency-free line chart used by the Progress screen
- `notifications.js` - best-effort local notification scheduling (see the
  big comment at the top of that file for the real platform limitations)
- `sw.js` - service worker (offline caching + periodic background sync)
- `manifest.json` - the PWA manifest
- `icons/` - the app icon (SVG) and a one-time PNG generator page for iOS

## Running it locally

Service workers (needed for offline support) **do not work over a plain
`file://` URL** - you have to serve this over `http://` or `https://`, even
just to test it on your own computer. Pick whichever of these you already
have available:

```bash
# Python (usually preinstalled on Mac/Linux, or install from python.org)
python -m http.server 8080

# Node.js
npx serve .

# VS Code
# Install the "Live Server" extension, right-click index.html, "Open with Live Server"
```

Then open `http://localhost:8080` (or whatever port/URL your tool prints) in
your phone's or computer's browser.

To test properly on your **phone** while developing on a computer, make sure
both devices are on the same WiFi network and use your computer's local IP
instead of `localhost`, e.g. `http://192.168.1.23:8080` (find your IP with
`ipconfig` on Windows or `ifconfig`/`ip addr` on Mac/Linux).

## One-time step: generate the PNG icons

`icon.svg` works immediately for Android/Chrome, but iOS specifically wants
a real PNG file for its home-screen icon. Once the app is running (see
above), open `icons/generate-icons.html` in your browser, click each
"Download" button, and save the three files it produces
(`icon-192.png`, `icon-512.png`, `icon-180.png`) into the `icons/` folder.
You only need to do this once - after that you can delete
`generate-icons.html`.

## Deploying it so you can install it on your phone

Any static file host works. The simplest options, from easiest to most
manual:

**Netlify (drag and drop, no account setup needed for a one-off):**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole `Workout Assistant` folder onto the page
3. Netlify gives you a live `https://something.netlify.app` URL immediately

**Vercel:**
1. Install the CLI: `npm i -g vercel`
2. Run `vercel` inside this folder and follow the prompts (choose "no
   build step" / static site when asked)

**GitHub Pages:**
1. Push this folder to a GitHub repository
2. Repo Settings → Pages → set the source branch/folder
3. GitHub gives you a `https://yourname.github.io/reponame/` URL

Whichever you pick, you need the **https URL it gives you** for the next
step - service workers and camera access both require a secure context
(`https://`, or `localhost` for local testing).

## Installing on your phone's home screen

**Android (Chrome):**
1. Open the deployed https URL in Chrome
2. Tap the ⋮ menu → "Add to Home screen" (Chrome may also show an automatic
   install banner/prompt)
3. Confirm - the icon appears on your home screen and opens full-screen,
   no browser bar

**iPhone/iPad (Safari - must be Safari, not Chrome, for this to work on iOS):**
1. Open the deployed https URL in Safari
2. Tap the Share icon (square with an arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Confirm - the icon appears on your home screen

## Notifications - what to actually expect

Tap "Enable Notifications" in Settings once installed. Read
`notifications.js`'s top comment for the full detail, but the short version:
there is no way for a backend-free PWA to guarantee a notification fires at
an exact time while the app is fully closed, especially on iOS. This app
does the best a browser genuinely allows:
- Every time you open the app (or bring it back to the foreground), it
  checks "should a reminder have fired by now?" and fires it immediately if
  so.
- On Android/Chrome specifically, it also registers Periodic Background
  Sync as a secondary nudge - the browser decides the actual interval, it's
  not something you can schedule precisely.
- On iOS, realistically, reminders will only ever show up while you have
  the app open around the scheduled time - there's no background delivery
  without a real push-notification server, which this project deliberately
  doesn't have.

## The plan builder

On first launch (or via Settings → "Rebuild My Plan"), you'll go through a
short onboarding flow: basic stats, food preferences, and any injuries/
equipment limits. The app then swaps out specific exercises/meals based on
what you enter (see the big comment at the top of the "Plan builder" section
in `data.js`).

**This is a simple, rules-based tool, not medical, physiotherapy, or
dietitian advice.** It only knows about a handful of self-reported flags
(knee/back/shoulder/wrist, diet type, equipment) and swaps a pre-written
list of exercises/meals accordingly - it can't account for your specific
situation the way a real professional can. If you have an actual injury or
medical condition, please check with one before starting any new plan.

## Backing up your data

Since everything lives only in this browser, clearing your browser data,
switching phones, or reinstalling would lose everything. Go to
**Settings → Backup → Download My Data** periodically (Settings shows you
when you last did this), and keep the downloaded file somewhere safe. Restore
it any time via **Settings → Backup → Restore from backup**.

## Known limitations (documented on purpose, not overlooked)

- **No home-screen widget.** A true live-updating widget needs a native app
  (WidgetKit on iOS, App Widgets on Android) - not achievable through
  standard web/PWA APIs on either platform. The closest available
  substitute implemented here is the **Badging API**
  (`navigator.setAppBadge`), which puts a small number on the app icon when
  today's workout or a weekly check-in is still outstanding - see
  `updateAppBadge()` in `app.js`.
- **Nutrition numbers are rough estimates**, not precise nutritional data -
  see the comments in `data.js` next to each meal's protein/calorie figures.
- **"Felt easy" weight suggestions** are based on a single felt-easy tag,
  not actual rep counts per set (which would need a lot more manual entry
  per session) - see the comment above `suggestWeightIncrease()` in `app.js`.
