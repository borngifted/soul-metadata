# Soul Metadata

A single-page numerology reading app with a paper-notebook scroll journey design.
No build step, no dependencies — everything lives in `index.html`.

**Live site:** https://borngifted.github.io/soul-metadata/

## Using the app

### Personal reading
1. Enter your **full birth name** (the name on your birth certificate).
2. Enter your **date of birth** as month / day / 4-digit year.
3. Optionally add the name you go by and your **birth time + time zone** — the
   birth time unlocks the Human Design chart (type, strategy, authority,
   centers, channels).
4. Press **Decode the Pattern**. The reading covers Core Numbers, the Name
   Reading, Name·Birth Harmony, the Human Design chart, a Career Blueprint,
   the Metadata Results table, Deep Meaning, and a shareable Pattern Statement.
5. Every section header has a small **ⓘ button** that explains how that part
   of the reading works.
6. Use **Text the Card / Download Card** to share a 1080×1350 profile card,
   or copy the full text report.

### Compatibility (two people)
1. Scroll to the **Compatibility** panel. If you already decoded a profile
   above, Person One fills in automatically.
2. Enter both full birth names and birth dates. Birth times are optional —
   add both to include the **Human Design pairing** (the two types, their
   strategies, and the connection channels the bodygraphs form).
3. Press **Read the Connection**. You get:
   - **Connection Index** — a weighted blend of four aspects: Life Direction
     40% · Heart Connection 25% · Talent Blend 20% · Day-to-Day Vibe 15%.
     This score depends only on the two charts — it never changes.
   - **This Moment** — computed from the *actual date and time you pressed
     the button*. Each person gets their Personal Year, Personal Month,
     Personal Day, and an hour-based Moment number; the bar compares the two
     Personal Days. Run the same pair tomorrow (or in a different hour) and
     this section changes — it's today's weather, where the Connection Index
     is the climate. The reading and the share card are stamped with the
     submission moment (e.g. "Read Tuesday, July 14, 2026 · 7:55 PM").
4. **Text the Card / Download Card** shares the compatibility card, including
   the timestamp and This Moment percentage.

### How This Moment is calculated
- **Personal Year** = birth month + birth day + current year, reduced to 1–9
- **Personal Month** = Personal Year + current month, reduced
- **Personal Day** = Personal Month + current day, reduced
- **Moment number** = Personal Day + current hour (24h clock), reduced
- The two Personal Days are compared with the same affinity chart as the main
  aspects; identical days get a resonance floor of 88%.

## Development

```bash
# serve locally
python3 -m http.server 8642    # then open http://localhost:8642/

# run the logic tests (evals the inline script under a stub DOM)
node test-compat-career.js     # expect: 29 passed, 0 failed
```

## Deploying

The site is GitHub Pages serving `main` at the repo root — pushing to `main`
deploys it:

```bash
git push origin main
gh api repos/borngifted/soul-metadata/pages/builds/latest --jq .status  # "built" when live
```

Builds usually finish in under a minute. Hard-refresh (Cmd+Shift+R) if the
browser serves a cached copy.

All readings are symbolic — for reflection and fun.
