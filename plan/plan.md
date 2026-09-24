# BITS in Motion — Update Plan

This round adds accounts, a public landing page, an AI meal guide, a Terms & Conditions
page, and fixes two issues with exercise targets and exercise filtering.

## 1. New entry flow (landing + sign-in)

Today the app opens straight into the setup questionnaire. That changes to:

- **Home ("/") becomes a public landing page** — an energetic marketing page with the
  hero pitch, a short feature rundown (AI Camera Coach, Command Center, AI meal guide,
  privacy-first), and two calls to action: **Sign in with Google** and **Continue as guest**.
- **The dashboard (Command Center) moves to its own route** and is only reachable after a
  person signs in or enters as a guest.
- After entering, first-time users still see the quick questionnaire (Age, Goal, Equipment,
  Low-impact); returning users skip straight to the dashboard.

### Two ways in
- **Sign in with Google** — one-tap Google login. No password to manage.
- **Continue as guest** — no account, jump straight in.

## 2. Where data lives (this is the big one)

- **Guests:** everything (profile, settings, workout history, meal preferences) stays only
  in the current browser, exactly like today. Clearing browser data erases it. No cross-device
  access.
- **Google-signed-in users:** everything is **cloud-synced** to their account, so their
  history and settings follow them across devices and browsers.
- **Guest → Google:** if someone has been using the app as a guest and then signs in with
  Google, the plan is to **carry their existing local history up into their new cloud account**
  (a one-time merge on first sign-in) so nothing is lost. *Assumption — flag if you'd rather
  keep guest data and cloud data completely separate.*
- Signing out of a Google account returns to the landing page; their data remains safe in the
  cloud for next time.

## 3. AI meal / intake guide (new section)

A new **Fuel** section that gives **AI-powered, personalized meal suggestions** tuned to the
person's fitness goal and situation:

- Generates a suggested day of eating (e.g. breakfast / lunch / snack / dinner) with a short
  rationale and rough protein/calorie ballpark, oriented to **hostel-friendly, budget,
  minimal-cooking** realities.
- Uses the person's **Goal** (from onboarding) plus a few quick inputs the guide will ask once:
  **diet type** (veg / non-veg / egg-ok / vegan), optional **allergies/dislikes**, and an
  optional **budget level**. *Assumption on these inputs — adjust if you want more or fewer.*
- A **"regenerate"** option to get fresh ideas, and the ability to keep the latest plan saved
  (in the browser for guests, in the cloud for signed-in users).
- Runs on Emergent's built-in AI — **no API key or setup required from you.**
- Shown as **general guidance, not dietary/medical advice**, with a visible disclaimer.
- *Assumption:* this is a suggestion generator, not a calorie-logging tracker. Say the word if
  you want per-meal logging with intake-vs-target tracking instead (larger effort).

## 4. Terms & Conditions

- A readable **Terms & Conditions page**, linked from a **footer** across the app (and on the
  landing page). **No forced "I accept" step** — informational only, per your choice.
- Content will cover the essentials for this app: it's a fitness aid not medical advice,
  camera video is processed on-device and never uploaded, how data is stored (local for guests /
  cloud for Google accounts), the AI meal suggestions disclaimer, and basic acceptable-use.
  This is standard boilerplate tailored to the app, not legal advice.

## 5. Fix: exercise target not showing correctly

- The session goal you pick before a drill (e.g. 20 reps / 45s) will be shown clearly **during
  the workout** — a dedicated **target progress indicator** (ring/bar) that fills as you go,
  plus the "current / goal" readout, and the existing goal-reached celebration.
- The chosen target will also be reflected where you start the drill so it's obvious what's set.

## 6. Fix: same exercises regardless of goal/gear

Two things get addressed:

- **Correctness:** changing your **Goal** or **Equipment** (in onboarding or Settings) will
  immediately update the recommended drills — no more stale/identical lists.
- **Variety (expanded library):** the exercise library is **expanded** so each **Goal + Gear**
  combination surfaces a genuinely different, larger set. For example, Strength vs Endurance vs
  Fat Burn vs Mobility each lean on distinct movements, and choosing **Backpack** unlocks
  weighted variants that actually change what's shown (not just a renamed label). The existing
  drills stay; new ones are added around them.
- The **Low-impact** toggle continues to swap high-impact movements for gentler alternatives,
  now across the larger library.

## Assumptions
- Google sign-in uses Emergent's managed Google login (nothing for you to configure; no keys).
- Camera behavior, privacy (on-device pose processing), and the Cyber-Athletic look & feel are
  unchanged.
- The AI meal guide produces suggestions only; it does not track logged intake unless you ask.
- Guest local data is merged into the cloud account on first Google sign-in (see §2).

## Out of scope (unless requested)
- Email/password accounts or other social logins.
- A full calorie/macro logging tracker with daily intake-vs-target history.
- Sharing, social feeds, or leaderboards.
