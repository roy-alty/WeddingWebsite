/* =========================================================
   EDIT THESE TWO VALUES FOR YOUR WEDDING
   ========================================================= */

// Wedding date/time used for the countdown. Format: "YYYY-MM-DDTHH:MM:SS"
const WEDDING_DATE = "2026-12-13T18:00:00";

// Email address the RSVP form should send responses to.
const RSVP_EMAIL = "your-email@example.com";

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
