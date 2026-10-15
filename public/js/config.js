// Sync settings. Fill these in from Supabase → Project Settings → API (or "Connect").
// Both values are designed to be public: row level security in supabase/setup.sql
// is what keeps each account's data private. Never put the service_role / secret key here.
window.Lilac = window.Lilac || {};

Lilac.config = {
  supabaseUrl: "https://rapmbkxhbjobfwpssvzn.supabase.co",      // e.g. "https://abcdefghijklmnop.supabase.co"
  usernameDomain: "users.lilac-dgb.pages.dev", // usernames sign in as <name>@this; never emailed
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcG1ia3hoYmpvYmZ3cHNzdnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjY3NjYsImV4cCI6MjEwNzYwMjc2Nn0.IP_RdLsbYjF_SsXyB6H3szZpz77eCkLulIKs2uoVljA",      // the anon / publishable key
};
