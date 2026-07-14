# "This Moment" Compatibility Layer — Design

**Date:** 2026-07-14
**Status:** Approved (Approach A — classic personal cycles)

## Goal

Base part of the compatibility reading on the actual date and time of submission.
When a visitor clicks "Read the Connection", capture the real current moment
(`new Date()`, visitor's local time) and add a live, day-changing "This Moment"
section to the reading and the shareable card. The Connection Index percentage
stays timeless — the moment layer is informational and does not change the score.

## Calculations (per person, against the captured moment)

All reductions use the existing `reduce()` machinery in `index.html` (master
numbers 11/22/33 preserved where the current code preserves them; cycle numbers
conventionally reduce to 1–9, so reduce fully for cycles).

- **Personal Year** = reduce(birth month + birth day + current year digits)
- **Personal Month** = reduce(Personal Year + current month)
- **Personal Day** = reduce(Personal Month + current day of month)
- **Moment Number** = reduce(Personal Day + current hour, 24-hour clock)
  — this is the "time" component of the request.

A single helper `computeMoment(profile, now)` returns
`{ personalYear, personalMonth, personalDay, momentNumber }`. It takes `now` as
a parameter (never calls `new Date()` itself) so tests can pass a fixed date.

## Data flow

1. `handleCompat()` captures `var now = new Date()` once per submission.
2. Computes `computeMoment()` for each person and a pairing:
   `comp.moment = { now, p1: {...}, p2: {...}, rating, pct, text }` where
   `rating`/`pct` come from the existing `pairRating` matrix + `RATING_PCT`
   applied to the two Personal Day numbers (identical numbers get the same
   ≥88% floor as other aspects).
3. `compatHTML()` renders the new **"This Moment"** section between the aspect
   bars and the Human Design pairing block:
   - Timestamp line: e.g. "Read Monday, July 14, 2026 · 7:39 PM" (formatted
     via `toLocaleDateString`/`toLocaleTimeString`).
   - Each person's Personal Year / Month / Day and Moment Number.
   - One harmony bar (existing `c-bar`/`c-fill` styles) comparing Personal Days.
   - A sentence describing what today's combined energy favors, drawn from a
     small text table keyed by the pairing rating (reuse the existing rating
     vocabulary: soulmate/harmonious/neutral/challenging tiers).
   - A note that this section is recalculated on every reading while the
     Connection Index is timeless.
4. `drawCompatCard()` adds the timestamp and a one-line This Moment pairing to
   the share card (and `comp.moment` rides along like `comp.hdPair` does).
5. A `data-info` explainer tile on the section header explains personal cycles,
   matching the existing modal pattern.

## Out of scope

- The moment layer does NOT affect the overall Connection Index.
- No Universal Year/Month/Day numbers (Approach B rejected).
- No changes to the single-person profile reading.

## Testing

- Extend `test-compat-career.js`: call `computeMoment` with fixed `Date`
  instances and assert known Personal Year/Month/Day/Moment values, including
  a year-boundary case and a master-number birth date.
- Verify the pairing rating/pct path with two fixed profiles.
- Live check in Chrome: run a compatibility reading, confirm the This Moment
  section renders with today's real date/time, bar animates, explainer opens,
  and the share card shows the timestamp.
