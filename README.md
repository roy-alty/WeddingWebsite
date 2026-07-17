# Wedding Website

A simple, editable wedding website — cover, countdown, our story, locations,
itinerary, a Fort Worth visitor guide for out-of-town guests, gift registry,
dress code, hashtag, and an RSVP form. No build tools, no database — just
`index.html`, `style.css`, `script.js`, and an `images/` folder.

## 1. Customize the content

Everything that needs editing is marked `[LIKE THIS]` in `index.html`, or
flagged with a small red **edit** tag. Open `index.html` in any text editor
and replace:

- `[BRIDE]` / `[GROOM]` — your names (appears in the cover and footer)
- `[MONTH] [DD] [YYYY]` and time — wedding date
- `[Venue Name]` — ceremony and reception venue names/addresses
- Google Maps links (the `href="#"` next to "Open in Google Maps") — go to
  Google Maps, search the venue, click Share → Copy Link, paste it in
- Our Story paragraph, dress code note, bank details, Amazon registry link,
  hashtag

Then open `script.js` and set:

- `WEDDING_DATE` — powers the countdown timer
- `RSVP_EMAIL` — where RSVP form submissions get sent

## 2. Add real photos

Replace the placeholder images in `images/` with real photos, **keeping the
same filenames** (or update the `src=` paths in `index.html` if you rename
them):

- `cover.jpg` — hero background (1600×1000 or larger works best)
- `story.jpg` — "Our Story" photo
- `ceremony.jpg` / `reception.jpg` — venue photos

## 3. RSVP form — two options

**Zero setup (default):** the form opens the guest's email app pre-filled
with their answers, addressed to `RSVP_EMAIL`. Works immediately, no signup.

**Nicer in-page experience (optional):** sign up free at
[formspree.io](https://formspree.io) (50 submissions/month free), create a
form, and:
1. In `index.html`, change `<form class="rsvp-form" id="rsvp-form" onsubmit="return sendViaEmail(event)">`
   to `<form class="rsvp-form" action="https://formspree.io/f/YOUR_ID" method="POST">`
2. Delete the `onsubmit` attribute and the `sendViaEmail` function in `script.js`

## 4. Host it for free

Any of these work well for a static site like this. **GitHub Pages** is the
best long-term option if you want to eventually reuse this as a template for
other clients (free custom domains, version history, easy to fork per
client).

### Option A — GitHub Pages (recommended)

1. Create a free GitHub account and a new repository (e.g. `our-wedding`).
2. Upload `index.html`, `style.css`, `script.js`, and the `images/` folder
   to the repo (drag-and-drop works on github.com, or use `git push`).
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

## 5. Turning this into a business

Since you mentioned wanting to eventually offer this as a service: the
cleanest path is to keep this folder as your "master template," then
duplicate it per client (new repo or new Netlify site), swap in their
names/photos/details, and redeploy. Once you're doing this often, it's
worth scripting the placeholder swap (a small Python/Node script that reads
a JSON file of client details and fills in the template) so you're not
hand-editing HTML every time — happy to help build that when you're ready.
