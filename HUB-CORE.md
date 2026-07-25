# Hub Core — the reusable base for AE vertical hubs

A tenant-agnostic clone of the AEHub machine. Copy this folder, edit **one file**, add your
modules, deploy. Every vertical (Real Estate, Architecture, Engineering, …) starts here so
they stay consistent and ship fast. **Built by Accelerated Experiences, LLC.**

## What's in the box

```
hub-core/
  config.js          ← THE swap point: brand, skin, sections, departments, roles, AI persona
  hub-nav.js         ← role-aware sidebar + skin + injected header (reads config.js)
  assistant.js       ← floating AI helper (DeepSeek), signed-in only, persona from config
  hub.html           ← Command Center: boots from config, renders each role's tiles
  signin.html        ← role picker → session
  logo.svg           ← drop the tenant's logo here (any square-ish SVG/PNG)
  api/
    auth.mjs         ← sign-in + whoami. Session in KV: hub:sess:<token> = "role|name"
    data.mjs         ← generic KV spine: CRUD on collections (your "one true object")
    assistant.mjs    ← DeepSeek assistant; honesty rule enforced server-side
```

Same architecture as every AE hub: **single-file pages + a thin `/api/*.mjs` layer + KV as the
spine + one nav include + one AI include.** No build step.

## Make it a vertical (10 minutes to a booting hub)

1. **Copy** the folder to a new repo, e.g. `realestate-hub`.
2. **Edit `config.js`** — this alone re-skins and re-shapes the whole hub:
   - `tenant`, `brand` (name, short, tagline, logo, **keep the AE `credit`**)
   - `skin` (one brand `accent` + optional per-department accents)
   - `sections` (rename/add screens), `departments` (how they group)
   - `roles` (who opens what — `"*"` = admin)
   - `collections` (your data spine — put the vertical's core object first)
   - `assistant` (name, blurb, persona — `{BRAND}` is filled in)
3. **Drop the logo** at `/logo.svg`.
4. **Build your spine + modules.** Each section is a single `.html` page that:
   - loads `<script src="/config.js"></script>` then `<script src="/hub-nav.js" defer></script>` and `<script src="/assistant.js" defer></script>`,
   - has an `.eyebrow` + `<h1>` (the injected header uses them),
   - reads/writes its data through **`/api/data`** (e.g. `action:'list'|'save'|'delete', collection:'projects', record:{…}, sess`).
   - Copy `hub.html` as the pattern for a page.
5. **Deploy**: new GitHub repo → new Vercel project → domain. Deploy by GitHub web-upload to `main`; Vercel auto-builds. (Use the AE white-label machine to stand up the repo/project.)

## Environment variables (set in Vercel)

| Var | What it does | If unset |
|---|---|---|
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash/Vercel KV — the data + session spine | sign-in & data return a friendly "add KV" message |
| `DEEPSEEK_API_KEY` | the AI assistant's brain | assistant says "add the key" |
| `HUB_ADMIN_PASS` | gate the **admin** role behind a passcode | admin is **open** (fine while you explore; set it before real data) |

> **Guardrail:** you never handle these keys — the operator sets them in Vercel. The hub is
> built to run gracefully without them so you can demo it, then hardens as each key lands.

## Conventions (keep these)

- **DeepSeek is the default AI.** Only reach for a vision model when a feature must *see*.
- **Honesty is enforced** in `assistant.mjs` — never let the AI invent facts; it says "verify".
- **Session format `role|name` is permanent** — don't change it; everything reads it.
- **Money/settings = manager+/admin.** Gate writes; guests read nothing.
- **Keep the AE credit** in every footer, the quiet professional way.
- **Ship, then verify live.** Every deploy gets checked in the browser.

## The data spine, by example

```js
// list your projects
fetch('/api/data', {method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ action:'list', collection:'projects', sess })}).then(r=>r.json())
// save one (upsert by id)
fetch('/api/data', {method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ action:'save', collection:'projects',
    record:{ id, name:'Riverside Remodel', phase:'DD', client:'…' }, sess })})
```

That's the whole game: **one config, one spine, one nav, one AI — four products.**
