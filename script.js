/* =========================================================
   All wedding details live in content.json (edit that file
   directly, or open editor.html for a form-based editor).
   These are just fallback values used if content.json can't
   be loaded (e.g. opening index.html directly via file://).
   ========================================================= */

let WEDDING_DATE = "2026-12-13T18:00:00";
let RSVP_EMAIL = "your-email@example.com";

/* ========================================================= */

// Lazily creates a Supabase client from the credentials in
// supabase-config.js, or returns null if they haven't been filled in
// yet (or the supabase-js library didn't load). Callers should treat a
// null return as "Supabase isn't set up — skip it", not an error.
let _sbClient;
function getSupabase() {
  if (_sbClient !== undefined) return _sbClient;
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  if (!url || !key || !window.supabase) {
    _sbClient = null;
  } else {
    _sbClient = window.supabase.createClient(url, key);
  }
  return _sbClient;
}

function updateCountdown() {
  const target = new Date(WEDDING_DATE).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  if (!els.days) return;

  if (diff <= 0) {
    els.days.textContent = "0";
    els.hours.textContent = "0";
    els.mins.textContent = "0";
    els.secs.textContent = "0";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  els.days.textContent = days;
  els.hours.textContent = String(hours).padStart(2, "0");
  els.mins.textContent = String(mins).padStart(2, "0");
  els.secs.textContent = String(secs).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- Opening curtains + music autoplay-on-tap ---------- */
const curtainOverlay = document.getElementById("curtain-overlay");
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const musicIcon = document.getElementById("music-icon");

function openCurtains() {
  if (!curtainOverlay || curtainOverlay.classList.contains("opening")) return;
  curtainOverlay.classList.add("opening");

  // Browsers require a user gesture to start audio — this click satisfies that.
  if (bgMusic) {
    bgMusic.play().catch((err) => {
      // Autoplay blocked; user can press the music button manually.
      console.warn("Could not autoplay audio/song.mp3 on curtain tap:", err);
    });
  }

  setTimeout(() => {
    curtainOverlay.classList.add("hidden");
  }, 1500);
}

if (curtainOverlay) {
  curtainOverlay.addEventListener("click", openCurtains);
}

if (musicToggle && bgMusic) {
  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch((err) => console.warn("Could not play audio/song.mp3:", err));
    } else {
      bgMusic.pause();
    }
  });
}

/* ---------- Inline song widget (Our Story section) ---------- */
const songPlayBtn = document.getElementById("song-play");
const songCurrent = document.getElementById("song-current");
const songDuration = document.getElementById("song-duration");

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

if (songPlayBtn && bgMusic) {
  songPlayBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play().catch((err) => console.warn("Could not play audio/song.mp3:", err));
    } else {
      bgMusic.pause();
    }
  });

  bgMusic.addEventListener("loadedmetadata", () => {
    songDuration.textContent = formatTime(bgMusic.duration);
  });
  bgMusic.addEventListener("timeupdate", () => {
    songCurrent.textContent = formatTime(bgMusic.currentTime);
  });
}

// Single source of truth for play/pause UI across all three controls
// (curtain autoplay, floating button, inline widget) — driven by the
// audio element's real state, so the UI never claims it's playing when
// it isn't (e.g. autoplay silently blocked by the browser).
if (bgMusic) {
  bgMusic.addEventListener("play", () => {
    musicToggle?.classList.add("spinning");
    if (musicIcon) musicIcon.textContent = "♪";
    if (songPlayBtn) songPlayBtn.textContent = "❚❚";
  });
  bgMusic.addEventListener("pause", () => {
    musicToggle?.classList.remove("spinning");
    if (musicIcon) musicIcon.textContent = "❚❚";
    if (songPlayBtn) songPlayBtn.textContent = "▶";
  });
  bgMusic.addEventListener("error", () => {
    console.error(
      "audio/song.mp3 failed to load — check the file exists at audio/song.mp3 and is a valid audio file.",
      bgMusic.error
    );
  });
}

// RSVP: submits directly to RSVP_EMAIL via FormSubmit.co (free, no signup,
// no guest email app needed) — see the comment on the form in index.html
// for the one-time activation step this requires.
async function sendRSVP(e) {
  e.preventDefault();
  const form = e.target;
  const statusEl = document.getElementById("rsvp-status");
  const submitBtn = form.querySelector("button[type=submit]");

  const name = form.name.value;
  const attending = form.attending.value;
  const guests = form.guests.value;
  const message = form.message.value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  statusEl.textContent = "";
  statusEl.classList.remove("success", "error");

  // Save to Supabase (if configured) independently of the email below —
  // this runs regardless of whether the email step succeeds, fails, or
  // is slow, so admin.html always gets the RSVP even if, say, the email
  // relay is down or (when previewing via file://) blocked by the
  // browser.
  const sb = getSupabase();
  if (sb) {
    sb.from("rsvps")
      .insert({
        name,
        attending,
        guest_count: Number(guests) || 1,
        message,
      })
      .then(({ error }) => {
        if (error) console.error("Supabase RSVP insert failed:", error);
      });
  }

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RSVP_EMAIL)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `RSVP from ${name}`,
        Name: name,
        Attending: attending,
        "Number of Guests": guests,
        Message: message,
      }),
    });
    if (!res.ok) throw new Error("Request failed");

    form.hidden = true;
    statusEl.textContent = "🎉 Thank you! Your RSVP has been sent.";
    statusEl.classList.add("success");
  } catch (err) {
    statusEl.textContent = `Something went wrong sending this automatically — please email us directly at ${RSVP_EMAIL}.`;
    statusEl.classList.add("error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Send RSVP";
  }
  return false;
}

/* =========================================================
   CONTENT LOADER
   Fetches content.json and fills in every [data-field] and
   [data-itinerary] element, the two maps links, the Amazon
   registry link, the page title/description, and the
   countdown/RSVP values above.

   Note: fetch() of a local JSON file is blocked by browsers
   when you open index.html directly (file://). Preview via a
   local server (see README) or after deploying — it works
   automatically once hosted.
   ========================================================= */

function applyContent(content) {
  // Simple text fields
  document.querySelectorAll("[data-field]").forEach((el) => {
    const key = el.getAttribute("data-field");
    if (content[key] !== undefined) {
      el.textContent = content[key];
    }
  });

  // Itinerary (array of {icon, time, label})
  if (Array.isArray(content.itinerary)) {
    content.itinerary.forEach((item, i) => {
      const icon = document.querySelector(`[data-itinerary="${i}-icon"]`);
      const time = document.querySelector(`[data-itinerary="${i}-time"]`);
      const label = document.querySelector(`[data-itinerary="${i}-label"]`);
      if (icon && item.icon !== undefined) icon.textContent = item.icon;
      if (time && item.time !== undefined) time.textContent = item.time;
      if (label && item.label !== undefined) label.textContent = item.label;
    });
  }

  // Links
  const ceremonyLink = document.getElementById("ceremony-maps-link");
  if (ceremonyLink && content.ceremonyMapsLink) ceremonyLink.href = content.ceremonyMapsLink;
  const receptionLink = document.getElementById("reception-maps-link");
  if (receptionLink && content.receptionMapsLink) receptionLink.href = content.receptionMapsLink;
  const preweddingLink = document.getElementById("prewedding-maps-link");
  if (preweddingLink && content.preWeddingMapsLink) preweddingLink.href = content.preWeddingMapsLink;

  const cashappLink = document.getElementById("cashapp-link");
  if (cashappLink && content.cashtag) {
    const tag = content.cashtag.startsWith("$") ? content.cashtag.slice(1) : content.cashtag;
    cashappLink.href = `https://cash.app/$${tag}`;
  }

  // Page title / meta description
  if (content.brideName && content.groomName) {
    const title = document.getElementById("page-title");
    if (title) title.textContent = `${content.brideName} & ${content.groomName} — Wedding`;
    const desc = document.getElementById("page-description");
    if (desc) {
      desc.setAttribute(
        "content",
        `Join us to celebrate the wedding of ${content.brideName} & ${content.groomName}.`
      );
    }
  }

  // Countdown + RSVP mailto now use the real values
  if (content.weddingDateISO) WEDDING_DATE = content.weddingDateISO;
  if (content.rsvpEmail) RSVP_EMAIL = content.rsvpEmail;
  updateCountdown();

  // Hide the "edit me" hint tags now that real content is in place
  document.body.classList.add("content-loaded");
}

/* ---------- Scroll reveal (fade + rise into view) ---------- */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* ---------- Floating RSVP button: hide once the real RSVP section is on screen ---------- */
const floatingRsvp = document.getElementById("floating-rsvp");
const rsvpSection = document.getElementById("rsvp-section");
if (floatingRsvp && rsvpSection && "IntersectionObserver" in window) {
  const rsvpVisibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        floatingRsvp.classList.toggle("hide", entry.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );
  rsvpVisibilityObserver.observe(rsvpSection);
}

fetch("content.json")
  .then((res) => {
    if (!res.ok) throw new Error("content.json not found");
    return res.json();
  })
  .then(applyContent)
  .catch(() => {
    // content.json missing or blocked (e.g. file:// preview) — placeholders stay visible.
  });
