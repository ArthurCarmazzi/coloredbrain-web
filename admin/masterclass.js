// Masterclass dashboard: password protected page + JSON built from the live WebinarJam API.
// Secrets live in the host's environment variables, never in this public repo:
//   WJ_API_KEY      WebinarJam API key
//   DASH_PASSWORD   password for the dashboard (username is anything, e.g. "arthur")
//   WJ_WEBINAR_ID   optional, defaults to 259 (CBCI Client Magnet Master Class)

const path = require("path");
const crypto = require("crypto");
const express = require("express");

const router = express.Router();
const WEBINAR_ID = process.env.WJ_WEBINAR_ID || "259";
const CACHE_MS = 5 * 60 * 1000;
let cache = { at: 0, data: null };

// People who are not real prospects: team, test sign ups, throwaway inbox services
const TEAM_EMAILS = ["arthur@directivecommunication.com", "arthurc@carmazzi.net", "earthwonder168@gmail.com"];
const TEST_PATTERNS = [/\+wjtest/i, /^test@/i];
const THROWAWAY_DOMAINS = ["dnsink.com", "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "yopmail.com", "sharklasers.com", "trashmail.com", "getnada.com", "maildrop.cc", "dispostable.com"];

const REGIONS = {
  "Singapore": "Singapore",
  "Malaysia": "Malaysia",
  "United Arab Emirates": "Gulf", "Saudi Arabia": "Gulf", "Qatar": "Gulf", "Kuwait": "Gulf", "Bahrain": "Gulf", "Oman": "Gulf",
};

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Basic auth on everything in this router
router.use((req, res, next) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  res.set("Cache-Control", "no-store");
  const pass = process.env.DASH_PASSWORD;
  if (!pass) return res.status(503).send("Dashboard not configured: set DASH_PASSWORD on the server.");
  const hdr = req.headers.authorization || "";
  const [scheme, b64] = hdr.split(" ");
  if (scheme === "Basic" && b64) {
    const given = Buffer.from(b64, "base64").toString().split(":").slice(1).join(":");
    if (safeEqual(given, pass)) return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Masterclass dashboard"');
  res.status(401).send("Password required.");
});

async function wj(endpoint, params) {
  const body = new URLSearchParams({ api_key: process.env.WJ_API_KEY, ...params });
  const r = await fetch(`https://api.webinarjam.com/webinarjam/${endpoint}`, { method: "POST", body });
  if (!r.ok) throw new Error(`WebinarJam ${endpoint} HTTP ${r.status}`);
  const j = await r.json();
  if (j.status !== "success") throw new Error(`WebinarJam ${endpoint}: ${j.message || "error"}`);
  return j;
}

function classify(email) {
  const e = (email || "").toLowerCase();
  if (TEAM_EMAILS.includes(e)) return "team";
  if (TEST_PATTERNS.some((r) => r.test(e))) return "test";
  if (THROWAWAY_DOMAINS.includes(e.split("@")[1] || "")) return "throwaway";
  return "real";
}

// "Mon, 26 Oct 2026, 10:22 AM" (webinar timezone, GMT+8) -> "2026-10-26"
function dayKey(s) {
  const d = new Date((s || "").replace(/^\w+, /, "") + " GMT+0800");
  return isNaN(d) ? null : new Date(d.getTime() + 8 * 3600e3).toISOString().slice(0, 10);
}

async function build() {
  const info = await wj("webinar", { webinar_id: WEBINAR_ID });
  const schedules = (info.webinar.schedules || []).map((s) => ({ id: s.schedule, label: s.comment, date: s.date }));

  // All registrant rows (one row per person per session), all pages
  let rows = [], page = 1, last = 1;
  do {
    const j = await wj("registrants", { webinar_id: WEBINAR_ID, schedule: "all", date_range: "0", page: String(page) });
    rows = rows.concat(j.registrants.data || []);
    last = j.registrants.last_page || 1;
    page++;
  } while (page <= last && page <= 50);

  // One record per person
  const people = new Map();
  for (const r of rows) {
    const email = (r.email || "").toLowerCase();
    if (!email) continue;
    let p = people.get(email);
    if (!p) {
      p = {
        name: [r.first_name, r.last_name].filter(Boolean).join(" "),
        email,
        country: (r.country && r.country.name) || "Unknown",
        signup: r.signup_date,
        day: dayKey(r.signup_date),
        source: r.utm_source || "",
        campaign: r.utm_campaign || "",
        kind: classify(email),
        sessions: {},
        attendedAny: false,
        replay: false,
      };
      people.set(email, p);
    }
    const attended = r.attended_live === "Yes";
    p.sessions[r.schedule_id] = { attended, minutes: r.time_live || "00:00:00" };
    p.attendedAny = p.attendedAny || attended;
    p.replay = p.replay || r.attended_replay === "Yes";
  }

  const all = [...people.values()].sort((a, b) => new Date(b.signup) - new Date(a.signup));
  const real = all.filter((p) => p.kind === "real");

  const count = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const byDay = count(real, (p) => p.day || "unknown");
  const byCountry = count(real, (p) => p.country);
  const byRegion = count(real, (p) => REGIONS[p.country] || "Other");
  const bySource = count(real, (p) => p.source || "(no tracking tag)");
  const attendance = schedules.map((s) => ({
    label: s.label,
    registered: real.filter((p) => p.sessions[s.id]).length,
    attended: real.filter((p) => p.sessions[s.id] && p.sessions[s.id].attended).length,
  }));

  return {
    updated: new Date().toISOString(),
    webinar: info.webinar.name,
    schedules,
    totals: {
      realPeople: real.length,
      excluded: all.length - real.length,
      rawRows: rows.length,
      attendedAny: real.filter((p) => p.attendedAny).length,
    },
    byDay, byCountry, byRegion, bySource, attendance,
    people: all,
  };
}

router.get("/api", async (req, res) => {
  if (!process.env.WJ_API_KEY) return res.status(503).json({ error: "WJ_API_KEY not set on the server." });
  try {
    if (!cache.data || Date.now() - cache.at > CACHE_MS || req.query.fresh === "1") {
      cache = { at: Date.now(), data: await build() };
    }
    res.json(cache.data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

router.get("/", (req, res) => res.sendFile(path.join(__dirname, "masterclass.html")));

module.exports = router;
