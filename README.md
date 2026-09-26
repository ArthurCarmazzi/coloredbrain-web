# Colored Brain website

Static front end for the Colored Brain system (app.coloredbrain.com). Two pages, plain HTML and CSS, no build step, no framework.

| Page | Audience | Job |
|---|---|---|
| `index.html` | Individuals with a coach code, team leaders, HR | Take the CBCI, see the four processes, connect a team, buy codes and AI plans |
| `trainers.html` | Coaches, trainers, consultants | The team-not-person premise, Predictive Psychology AI, client flow, three certification tiers, payback calculator |

## Run it

Open `index.html` in a browser. That's it. For a local server:

```
python3 -m http.server 8080
```

## Deploy

`.github/workflows/pages.yml` publishes the repo root to GitHub Pages on every push to `main`. Turn on Pages in the repo settings (Source: GitHub Actions) once, then it's automatic. Any static host (Netlify, Cloudflare Pages, the existing WordPress server) works the same: upload the folder.

## Structure

```
index.html        client-facing home
trainers.html     practitioner landing page
css/site.css      all styles; design tokens at the top, dark theme included
img/              logo, four brain illustrations (same files the app serves), book cover, trainer kit, certified badge
```

## Rules baked into the copy

- Process names: Green = Chaotic, Red = Linear, Purple = Relational, Blue = Intuitive. Same as the app's dashboard. Colors #22C55E #EF4444 #A855F7 #3B82F6.
- The AI is called Predictive Psychology AI on the site.
- Prices match app.coloredbrain.com as of 26 Sep 2026. The "50% off until 19 October" badge in `index.html` must be removed after that date.
- No dashes in copy. Commas, colons or full stops.
- Nothing claims an outcome the assessment alone doesn't produce; client program results are labelled as such.

## Open items before launch

- Seven `[confirm]` tags on `trainers.html` (certification format, duration, AI inclusion per tier, upgrade policy, accreditation wording).
- Certification buttons link to home.coloredbrain.com/certification, whose detail pages are empty. Point them at real checkout when it exists.
- Ritz-Carlton quote: confirm permission.
- Technip / Genting / Goody figures: attribute or trim.
- Add a photo of Arthur to the proof section.

## Editing

Edit the HTML directly. Sections are marked with `<!-- COMMENTS -->`. The Situation Simulator demo, billing toggle, mobile menu and payback calculator are small inline scripts at the bottom of each page.
