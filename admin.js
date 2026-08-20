/* Wedding admin dashboard — RSVPs, seating, and gift/money tracking.
   Everything here requires an authenticated Supabase login; the Row
   Level Security policies in supabase/schema.sql enforce that
   server-side too, so this page being unlisted/unlinked is not the
   real security boundary — the login is. */

const notConfiguredEl = document.getElementById("not-configured");
const loginViewEl = document.getElementById("login-view");
const dashboardViewEl = document.getElementById("dashboard-view");

let sb = null;

function init() {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  if (!url || !key || !window.supabase) {
    notConfiguredEl.hidden = false;
    return;
  }
  sb = window.supabase.createClient(url, key);

  sb.auth.getSession().then(({ data }) => {
    if (data.session) showDashboard(data.session);
    else showLogin();
  });

  sb.auth.onAuthStateChange((_event, session) => {
    if (session) showDashboard(session);
    else showLogin();
  });

  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("logout-btn").addEventListener("click", () => sb.auth.signOut());

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.getElementById("seating-form").addEventListener("submit", handleAddSeating);
  document.getElementById("money-form").addEventListener("submit", handleAddMoney);
}

function showLogin() {
  loginViewEl.hidden = false;
  dashboardViewEl.hidden = true;
}

function showDashboard(session) {
  loginViewEl.hidden = true;
  dashboardViewEl.hidden = false;
  document.getElementById("who-label").textContent = session.user.email;
  loadRsvps();
  loadSeating();
  loadMoney();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const statusEl = document.getElementById("login-status");
  statusEl.textContent = "";
  statusEl.classList.remove("error");

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    statusEl.textContent = error.message;
    statusEl.classList.add("error");
  }
}

function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${name}`));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ---------- RSVPs ---------- */

async function loadRsvps() {
  const tbody = document.getElementById("rsvps-body");
  const { data, error } = await sb.from("rsvps").select("*").order("created_at", { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Couldn't load RSVPs: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  const attending = data.filter((r) => /yes/i.test(r.attending));
  const declined = data.filter((r) => !/yes/i.test(r.attending));
  const headcount = attending.reduce((sum, r) => sum + (r.guest_count || 1), 0);
  document.getElementById("stat-responses").textContent = data.length;
  document.getElementById("stat-attending").textContent = attending.length;
  document.getElementById("stat-declined").textContent = declined.length;
  document.getElementById("stat-headcount").textContent = headcount;

  if (data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No RSVPs yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (r) => `
    <tr>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.attending)}</td>
      <td>${escapeHtml(r.guest_count)}</td>
      <td class="message-cell">${escapeHtml(r.message)}</td>
      <td>${new Date(r.created_at).toLocaleDateString()}</td>
      <td><button class="btn danger" data-delete-rsvp="${r.id}">Delete</button></td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-delete-rsvp]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this RSVP?")) return;
      const { error } = await sb.from("rsvps").delete().eq("id", btn.dataset.deleteRsvp);
      if (error) alert(error.message);
      else loadRsvps();
    });
  });
}

/* ---------- Seating ---------- */

async function loadSeating() {
  const tbody = document.getElementById("seating-body");
  const { data, error } = await sb
    .from("seating")
    .select("*")
    .order("table_number", { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">Couldn't load seating: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  if (data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No seats assigned yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (s) => `
    <tr>
      <td>${escapeHtml(s.table_number)}</td>
      <td>${escapeHtml(s.guest_name)}</td>
      <td>${escapeHtml(s.seat_count)}</td>
      <td class="note-cell">${escapeHtml(s.notes)}</td>
      <td><button class="btn danger" data-delete-seat="${s.id}">Delete</button></td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-delete-seat]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this seating entry?")) return;
      const { error } = await sb.from("seating").delete().eq("id", btn.dataset.deleteSeat);
      if (error) alert(error.message);
      else loadSeating();
    });
  });
}

async function handleAddSeating(e) {
  e.preventDefault();
  const guest_name = document.getElementById("seat-guest").value.trim();
  const table_number = document.getElementById("seat-table").value.trim();
  const seat_count = Number(document.getElementById("seat-count").value) || 1;
  const notes = document.getElementById("seat-notes").value.trim();
  if (!guest_name || !table_number) return;

  const { error } = await sb.from("seating").insert({ guest_name, table_number, seat_count, notes });
  if (error) {
    alert(error.message);
    return;
  }
  e.target.reset();
  document.getElementById("seat-count").value = 1;
  loadSeating();
}

/* ---------- Contributions / Money ---------- */

async function loadMoney() {
  const tbody = document.getElementById("money-body");
  const { data, error } = await sb
    .from("contributions")
    .select("*")
    .order("received_on", { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Couldn't load contributions: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  const total = data.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  document.getElementById("stat-total").textContent = `$${total.toFixed(2)}`;
  document.getElementById("stat-count").textContent = data.length;

  if (data.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No gifts logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (c) => `
    <tr>
      <td>${escapeHtml(c.giver_name)}</td>
      <td>$${Number(c.amount).toFixed(2)}</td>
      <td>${escapeHtml(c.method)}</td>
      <td>${escapeHtml(c.received_on)}</td>
      <td class="note-cell">${escapeHtml(c.note)}</td>
      <td><button class="btn danger" data-delete-money="${c.id}">Delete</button></td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll("[data-delete-money]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this entry?")) return;
      const { error } = await sb.from("contributions").delete().eq("id", btn.dataset.deleteMoney);
      if (error) alert(error.message);
      else loadMoney();
    });
  });
}

async function handleAddMoney(e) {
  e.preventDefault();
  const giver_name = document.getElementById("money-name").value.trim();
  const amount = Number(document.getElementById("money-amount").value);
  const method = document.getElementById("money-method").value;
  const dateVal = document.getElementById("money-date").value;
  const note = document.getElementById("money-note").value.trim();
  if (!giver_name || !amount) return;

  const row = { giver_name, amount, method, note };
  if (dateVal) row.received_on = dateVal;

  const { error } = await sb.from("contributions").insert(row);
  if (error) {
    alert(error.message);
    return;
  }
  e.target.reset();
  loadMoney();
}

init();
