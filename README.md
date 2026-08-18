# Wedding Website

A simple, editable wedding website — cover, countdown, our story, locations,
itinerary, a Fort Worth visitor guide for out-of-town guests, gift registry,
dress code, hashtag, and an RSVP form. No build tools, no database — just
`index.html`, `style.css`, `script.js`, and an `images/` folder.

## 1. Customize the content — use the editor (easiest)

Open **`editor.html`** in your browser (double-click it, or right-click →
Open With). It's a form covering every editable detail — names, date,
venues, Google Maps links, itinerary, registry (Amazon, bank transfer,
Zelle, Cash App), dress code, hashtag, RSVP email — plus a live preview
panel on the right, and file pickers for all the photos and the song.

When you're done, click **"Save to my Computer"**:

- In **Chrome or Edge**, this opens a folder picker. Choose your
  `wedding-site` folder once, and it writes `content.json` and any photos/
  song you selected directly into the right places (`images/`, `audio/`).
  No manual file moving.
- In **Safari or Firefox** (no direct folder-saving support), that button
  is disabled — instead click **"Download content.json Only"**, which
  downloads the updated file. Replace the existing `content.json` in your
  `wedding-site` folder with it, and manually copy any new photos into
  `images/` and your song into `audio/song.mp3` using the exact filenames
  shown next to each file picker.
- Reopen `editor.html` any time to keep editing — it auto-loads your
  current `content.json` (or use **"Import Existing content.json"** if
  auto-load doesn't work, e.g. when opening the file directly instead of
  through a local server).

`index.html` reads all its text from `content.json` at load time. This
means: **to preview your changes, either run a local server (see below) or
just deploy** — opening `index.html` by double-clicking it won't load
`content.json` due to a browser security rule about local files. A quick
local preview:

```
cd wedding-site
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.

### Editing content.json by hand (alternative)

If you'd rather skip the form, `content.json` is a plain JSON file — open
it in any text editor and change the values directly. Every field maps
1:1 to what's on the page.

## 2. Add real photos

Easiest: use the file pickers in `editor.html` (see above) — it saves
photos with the correct filenames automatically in Chrome/Edge.

To do it manually instead, replace the placeholder images in `images/`
with real photos, **keeping the same filenames** (or update the `src=`
paths in `index.html` if you rename them):

- `cover.jpg` — hero background (1600×1000 or larger works best)
- `couple.jpg` — circular couple photo shown on the cover (square photo,
  900×900+, works best since it's cropped into a circle)
- `monogram.jpg` — the small circular image inside the opening curtains
  (can reuse the couple photo, or use a monogram graphic)
- `story.jpg` — "Our Story" photo
- `ceremony.jpg` / `reception.jpg` — venue photos

## 3. Opening curtains

The site loads behind two curtain panels with a monogram and "Tap to Open"
in the center — tapping anywhere slides them open and reveals the site
(and starts the music, see below). To restyle: curtain colors are set in
`style.css` under `.curtain-panel`; the open/close timing is the
`transition` value on the same rule.

## 4. Background music

There's a floating music button (bottom-right) and an inline player in the
"Our Story" section, both controlling the same track: `audio/song.mp3`.
Replace that file with your own song — **keep the filename `song.mp3`**, or
update the `src` on the `<audio>` tag in `index.html`. A placeholder tone
is included so nothing is silent/broken by default.

**Important:** only use a song you have the rights to use (a track you
purchased/licensed, royalty-free music, or one you wrote). Uploading a
copyrighted commercial song to a public website without a license can get
the site taken down or create legal risk — this matters even more if you
turn this into a service for other clients later.

Browsers block audio from autoplaying without a click, which is why the
curtain-tap is used to start it — this is standard behavior, not a bug.

## 5. RSVP form

The form submits directly to the `rsvpEmail` you set in the editor (or
`content.json`) via [FormSubmit.co](https://formsubmit.co) — a free
form-to-email relay. No signup, no guest email app: the guest clicks
"Send RSVP" and sees an inline "Thank you" message on the page, and the
answers land in your inbox. See `sendRSVP()` in `script.js` and the form
comment in `index.html`.

**Important — one-time activation:** the first time a submission is sent
to a given `rsvpEmail`, FormSubmit emails that address an activation link
instead of delivering the RSVP. **Right after you deploy, submit the form
yourself once** (any test values) and click "Activate Form" in the email
that arrives — after that, every real guest submission is delivered
automatically. Skipping this step means early guest RSVPs are silently
dropped.

**Alternative:** if you'd rather use [formspree.io](https://formspree.io)
(50 free submissions/month, a dashboard of responses) instead of
FormSubmit, sign up, create a form, then in `index.html` change
`<form class="rsvp-form" id="rsvp-form" onsubmit="return sendRSVP(event)">`
to `<form class="rsvp-form" action="https://formspree.io/f/YOUR_ID" method="POST">`
and delete the `onsubmit` attribute (the `sendRSVP` function in
`script.js` is then unused and can stay or be removed).

## 6. Host it for free

Any of these work well for a static site like this. **GitHub Pages** is the
best long-term option if you want to eventually reuse this as a template for
other clients (free custom domains, version history, easy to fork per
client).

### Option A — GitHub Pages (recommended)

1. Create a free GitHub account and a new repository (e.g. `our-wedding`).
2. Upload the whole `wedding-site` folder contents to the repo
   (`index.html`, `style.css`, `script.js`, `content.json`, `editor.html`,
   `images/`, `audio/` — drag-and-drop works on github.com, or use
   `git push`). It's fine to include `editor.html` in the deploy; it's just
   not linked from the site, so guests won't stumble onto it.
3. Go to repo **Settings → Pages**, set Source to the `main` branch, root
   folder, and save.
4. Your site is live at `https://your-username.github.io/our-wedding/`
   within a couple minutes.
5. Optional: add a custom domain (e.g. `susanandjavier.com`) in the same
   Settings → Pages screen once you buy one (~$10–15/yr from any registrar).

### Option B — Netlify (easiest, drag-and-drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole `wedding-site` folder onto the page.
3. It's live instantly at a random `*.netlify.app` URL — rename it or add a
   custom domain in site settings.

### Option C — Cloudflare Pages

1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com).
2. Create a project, connect it to a GitHub repo (same as Option A) or
   upload the folder directly.
3. Deploy — live at `*.pages.dev`, custom domain optional.

## 7. Turning this into a business

Since you mentioned wanting to eventually offer this as a service: the
cleanest path is to keep this folder as your "master template," then
duplicate it per client (new repo or new Netlify site). Because all the
content already lives in `content.json` and gets filled in through
`editor.html`, onboarding a new client is just: copy the template folder,
send them `editor.html` (or fill it out with them), swap the photos, and
deploy. No HTML editing needed per client — that's most of the way to a
repeatable product already.
