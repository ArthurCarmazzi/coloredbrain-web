# Colored Brain website

Node.js (Express) server for the Colored Brain marketing site (app.coloredbrain.com is the separate CBCI app). The pages are plain HTML and CSS in `public/`; `server.js` serves them with clean URLs and is the place to add dynamic features later (affiliate pages, Whop or Stripe webhooks).

| URL | Audience | Job |
|---|---|---|
| `/` | Individuals with a coach code, team leaders, HR | Take the CBCI, see the four processes, connect a team, buy codes and AI plans |
| `/pricing` | Buyers | Code packs and AI plans; every buy button goes to app.coloredbrain.com checkout |
| `/trainers` | Coaches, trainers, consultants | The team-not-person premise, Predictive Psychology AI, client flow, three certification tiers, payback calculator |
| `/intro` | Whop buyers (hidden) | Copy of the home page with a Special Introductory Offer banner, no Classic CBCI button, buy buttons pointing to Whop. Not linked from any menu, noindex; share the direct URL only |

Old `.html` links (e.g. `/pricing.html`) redirect permanently to the clean URL. Unknown URLs get a branded 404 page. `/healthz` returns `{"ok":true}` for uptime checks.

## Run it locally

```
npm install
npm start          # http://localhost:3000
npm run dev        # restarts on file changes
```

Set `PORT` to change the port.

## Deploy to Hostinger (Cloud hosting, Node.js app)

1. hPanel → Websites → your site → **Node.js** (or Advanced → Node.js), create an application:
   - Node version: 18 or newer
   - Application root: the folder you deploy this repo into
   - Startup file: `server.js`
2. Get the code there: connect this GitHub repo in hPanel (Git → repository `ArthurCarmazzi/coloredbrain-web`, branch `main`), or upload the files. Do not upload `node_modules`.
3. Run **npm install** from the Node.js panel, then **Start/Restart** the app. Hostinger sets `PORT` itself.
4. Add the domain `home.coloredbrain.com` to that website in hPanel and issue the free SSL there.
5. DNS (SiteGround zone editor for coloredbrain.com): delete the `home` CNAME that points to `arthurcarmazzi.github.io`, then add an A record `home` pointing to the Hostinger server IP shown in hPanel.
6. In GitHub → Settings → Pages, remove the custom domain so GitHub stops claiming it.

After any change: push to `main`, then pull/redeploy and restart the app in hPanel.

## GitHub Pages (until Hostinger is live)

`.github/workflows/pages.yml` still publishes `public/` to GitHub Pages on every push, so home.coloredbrain.com keeps working during the move. Delete the workflow once Hostinger serves the domain.

## Structure

```
server.js            Express server: clean URLs, redirects, headers, 404
package.json         dependencies and npm scripts
public/index.html    client-facing home
public/pricing.html  pricing page
public/trainers.html practitioner landing page
public/intro.html    hidden Whop offer page (Whop links in the WHOP list at the bottom)
public/css/site.css  all styles; design tokens at the top, dark theme included
public/img/          logo, brain illustrations, book cover, trainer kit, seals
```

## Rules baked into the copy

- Process names: Green = Chaotic, Red = Linear, Purple = Relational, Blue = Intuitive. Same as the app's dashboard. Colors #22C55E #EF4444 #A855F7 #3B82F6.
- The AI is called Predictive Psychology AI on the site.
- Prices match app.coloredbrain.com as of 26 Sep 2026. The "50% off until 19 October" badge in `public/index.html` and `public/intro.html` must be removed after that date.
- No dashes in copy. Commas, colons or full stops.
- Nothing claims an outcome the assessment alone doesn't produce; client program results are labelled as such.

## Open items before launch

- Paste the 11 Whop checkout URLs into the `WHOP` list at the bottom of `public/intro.html`. Until then those buttons fall back to the pricing section.
- When the home page changes, update `public/intro.html` to match (it is a copy, not a template).

- Seven `[confirm]` tags on `trainers.html` (certification format, duration, AI inclusion per tier, upgrade policy, accreditation wording).
- Certification buttons link to home.coloredbrain.com/certification, whose detail pages are empty. Point them at real checkout when it exists.
- Ritz-Carlton quote: confirm permission.
- Technip / Genting / Goody figures: attribute or trim.
- Add a photo of Arthur to the proof section.

## Editing

Edit the HTML directly. Sections are marked with `<!-- COMMENTS -->`. The Situation Simulator demo, billing toggle, mobile menu and payback calculator are small inline scripts at the bottom of each page.
