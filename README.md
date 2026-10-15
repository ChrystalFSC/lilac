# Lilac

A private period tracker. Records periods and symptoms, estimates the next period,
and gives guidance sourced from the NHS. Plain HTML, CSS and JavaScript with no build step.

## Run locally

```
python -m http.server 5178 --directory C:/Period
```

Then open http://localhost:5178.

## Language
English and Simplified Chinese. Use the **中文 / English** button in the header. The first visit
follows the device language. All text lives in `js/i18n.js`.

## Sync across devices (optional, Supabase)

Without sync, data stays in the browser you use. With sync, you sign in with a **username and
password** and the same data appears on every device. Row level security means each account can
only read its own rows. Data is stored in Supabase as normal records, so anyone with access to your
Supabase dashboard (you) can read it there.

### 1. Create the project
1. Sign up at https://supabase.com and create a **New project** (region: Singapore for Malaysia).
2. Open **SQL Editor → New query**, paste everything from `supabase/setup.sql`, and click **Run**.

### 2. Sign-in settings
Lilac turns a username into `<username>@users.lilac-dgb.pages.dev` behind the scenes (set by
`usernameDomain` in `js/config.js`). Nothing is ever emailed to it.

Go to **Authentication → Sign In / Providers → Email** and turn **off "Confirm email"**. Save.

### 3. Connect the app
Go to **Project Settings → API keys** and copy the **Project URL** and the **anon** / **publishable**
key (never the `service_role` or secret key) into `js/config.js`.

### 4. Turn sync on
1. Click **Sync off** → **Create an account**. Choose a username and password.
2. On each other device: **Sync off** → sign in with the same username and password.
3. Then go to **Authentication → Sign In / Providers** and turn **off "Allow new users to sign up"**,
   so nobody else can create accounts in your project. Signing in still works.

### Forgot the password?
Open **SQL Editor** in Supabase and run (with your username and a new password):

```sql
update auth.users
set encrypted_password = extensions.crypt('NEW-PASSWORD-HERE', extensions.gen_salt('bf'))
where email = 'yourusername@users.lilac-dgb.pages.dev';
```

### Good to know
- Free projects **pause after a week without use**. Restore from the Supabase dashboard; Lilac keeps
  working offline meanwhile and catches up after.
- Each change syncs a moment after you save it. If the same day was edited on two devices, the later edit wins.
- Use **Export data** now and then as a backup that doesn't depend on any service.

## Updating the live site
After changing files, bump the `?v=` number on the script and stylesheet links in `index.html`
so browsers fetch the new files, then upload `deploy/lilac-site` to Cloudflare again.

## Files
| Path | What it does |
|---|---|
| `index.html` | The page |
| `css/styles.css` | Theme and layout |
| `js/cycle.js` | Groups logged days into periods; estimates the next one |
| `js/guidance.js` | Guidance rules and their sources |
| `js/store.js` | Saves data in the browser |
| `js/i18n.js` | All interface text, English and Chinese |
| `js/sync.js`, `js/sync-ui.js` | Supabase sync and its dialog |
| `js/config.js` | Your Supabase URL and public key |
| `supabase/setup.sql` | Table and access rules |
| `supabase/remove-old-encrypted-tables.sql` | One-off clean-up of the earlier encrypted tables |
