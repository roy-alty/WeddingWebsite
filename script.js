/* =========================================================
   All wedding details live in content.json (edit that file
   directly, or open editor.html for a form-based editor).
   These are just fallback values used if content.json can't
   be loaded (e.g. opening index.html directly via file://).
   ========================================================= */

let WEDDING_DATE = "2026-12-13T18:00:00";
let RSVP_EMAIL = "your-email@example.com";

/* ========================================================= */

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
    bgMusic.play().then(() => {
      musicToggle.classList.add("spinning");
      musicIcon.textContent = "♪";
    }).catch(() => {
      // Autoplay blocked; user can press the music button manually.
    });
  }

  setTimeout(() => {
    curtainOverlay.classList.add("hidden");
  }, 1200);
}

if (curtainOverlay) {
  curtainOverlay.addEventListener("click", openCurtains);
}

if (musicToggle && bgMusic) {
  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.classList.add("spinning");
      musicIcon.textContent = "♪";
    } else {
      bgMusic.pause();
      musicToggle.classList.remove("spinning");
      musicIcon.textContent = "❚❚";
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
      bgMusic.play();
      songPlayBtn.textContent = "❚❚";
      musicToggle.classList.add("spinning");
    } else {
      bgMusic.pause();
      songPlayBtn.textContent = "▶";
      musicToggle.classList.remove("spinning");
    }
  });

  bgMusic.addEventListener("loadedmetadata", () => {
    songDuration.textContent = formatTime(bgMusic.duration);
  });
  bgMusic.addEventListener("timeupdate", () => {
    songCurrent.textContent = formatTime(bgMusic.currentTime);
  });
  bgMusic.addEventListener("play", () => { songPlayBtn.textContent = "❚❚"; });
  bgMusic.addEventListener("pause", () => { songPlayBtn.textContent = "▶"; });
}

// RSVP: zero-setup mailto handler. Replace with a Formspree action for a
// nicer in-page experience (see README.md).
function sendViaEmail(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value;
  const attending = form.attending.value;
  const guests = form.guests.value;
  const message = form.message.value;

  const subject = encodeURIComponent(`RSVP from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nAttending: ${attending}\nNumber of Guests: ${guests}\nMessage: ${message}`
  );

  window.location.href = `mailto:${RSVP_EMAIL}?subject=${subject}&body=${body}`;
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
  const amazonLink = document.getElementById("amazon-registry-link");
  if (amazonLink && content.amazonRegistryLink) amazonLink.href = content.amazonRegistryLink;

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

fetch("content.json")
  .then((res) => {
    if (!res.ok) throw new Error("content.json not found");
    return res.json();
  })
  .then(applyContent)
  .catch(() => {
    // content.json missing or blocked (e.g. file:// preview) — placeholders stay visible.
  });
