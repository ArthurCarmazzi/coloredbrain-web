// Colored Brain website server (Express).
// Serves the static pages in /public with clean URLs: /pricing, /trainers, /intro.
// Hostinger (or any Node host) runs: npm install && npm start. Port comes from PORT.

const path = require("path");
const express = require("express");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(compression());

// Basic security headers
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
  });
  next();
});

// Old .html links keep working but move to clean URLs: /pricing.html -> /pricing
app.get(/^\/(index|pricing|trainers|intro)\.html$/, (req, res) => {
  const page = req.params[0] === "index" ? "" : req.params[0];
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(301, `/${page}${query}`);
});

// The Whop offer page is shared by direct link only: keep it out of search engines
app.use("/intro", (req, res, next) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  next();
});

// Health check for the host's monitoring
app.get("/healthz", (req, res) => res.json({ ok: true }));

// Static files: pages resolve without .html, assets get long caching
app.use(
  express.static(PUBLIC_DIR, {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (/\.(png|jpe?g|svg|webp|ico|woff2?)$/.test(filePath)) {
        res.set("Cache-Control", "public, max-age=604800");
      } else if (filePath.endsWith(".css")) {
        res.set("Cache-Control", "public, max-age=86400");
      } else {
        res.set("Cache-Control", "no-cache");
      }
    },
  })
);

// Anything else: send people home instead of a dead end
app.use((req, res) => {
  res.status(404).send(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Page not found · Colored Brain</title>' +
      '<link rel="stylesheet" href="/css/site.css">' +
      '<main class="wrap" style="padding:15vh 0;display:grid;gap:18px">' +
      '<span class="eyebrow">404</span><h1 class="tight">This page wandered off.</h1>' +
      '<p class="lede">The link may be old. Everything you need starts on the home page.</p>' +
      '<p><a class="btn btn-solid" href="/">Go to Colored Brain</a> <a class="btn btn-ghost" href="/pricing">See pricing</a></p></main>'
  );
});

app.listen(PORT, () => {
  console.log(`Colored Brain site running on port ${PORT}`);
});
