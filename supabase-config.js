// Supabase project credentials.
//
// These are safe to expose in client-side code — the anon/public key
// only grants what the Row Level Security policies in
// supabase/schema.sql allow (guests can submit an RSVP; everything
// else requires an authenticated admin login via admin.html).
//
// Get these two values from your Supabase project:
//   Settings → API → Project URL, and Project API keys → anon public
//
// Until you fill these in, the site still works normally — RSVPs just
// keep going out by email only (Supabase writes are skipped), and
// admin.html will show a "not configured" message instead of a login.
window.SUPABASE_URL = "https://tgrffytvcpbhtvaivqeh.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncmZmeXR2Y3BiaHR2YWl2cWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNTE4NDEsImV4cCI6MjEwMjgyNzg0MX0.yB5xysQzG_cQ4qTQ6eB0ALN_LzJ_Bmx8EoY6xhfZ9S0";
