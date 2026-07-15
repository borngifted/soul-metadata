// Node harness for the inline <script> in index.html.
// Evals the app script under a stub DOM, then unit-tests the pure logic.
"use strict";

var fs = require("fs");
var path = require("path");

var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var src = html.match(/<script>([\s\S]*)<\/script>/)[1];

function makeEl() {
  return {
    value: "", checked: false, textContent: "", innerHTML: "",
    style: {}, dataset: {}, options: [], scrollHeight: 1000,
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    addEventListener: function () {}, removeEventListener: function () {},
    setAttribute: function () {}, getAttribute: function () { return null; },
    appendChild: function () {}, removeChild: function () {}, insertBefore: function () {},
    focus: function () {}, click: function () {}, remove: function () {}, scrollIntoView: function () {},
    querySelectorAll: function () { return []; },
    getContext: function () { return null; }, toBlob: function (cb) { cb(null); }
  };
}

var elements = {};
var documentStub = {
  getElementById: function (id) { return elements[id] || (elements[id] = makeEl()); },
  createElement: function () { return makeEl(); },
  querySelectorAll: function () { return []; },
  addEventListener: function () {},
  documentElement: { scrollHeight: 2000 },
  body: makeEl(),
  fonts: { check: function () { return true; } }
};
var windowStub = { addEventListener: function () {}, scrollY: 0, innerHeight: 800, innerWidth: 1200, scrollTo: function () {} };
var localStorageStub = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };

new Function("window", "document", "localStorage", "navigator", "location", src)(
  windowStub, documentStub, localStorageStub, {}, { href: "http://localhost/" }
);

var SM = windowStub.SoulMetadata;

var passed = 0, failed = 0;
function ok(cond, label) {
  if (cond) { passed++; }
  else { failed++; console.error("FAIL: " + label); }
}
function eq(actual, expected, label) {
  ok(actual === expected, label + " — expected " + expected + ", got " + actual);
}

/* ---- Compatibility sanity ---- */

var pA = SM.computeProfile("Alice Marie Johnson", "1990-07-21");
var pB = SM.computeProfile("Robert James Smith", "1985-12-31");
var comp = SM.computeCompatibility(pA, pB);
ok(comp.overall >= 0 && comp.overall <= 100, "overall in 0..100");
eq(comp.aspects.length, 4, "four weighted aspects");
ok(Math.abs(comp.aspects.reduce(function (s, a) { return s + a.weight; }, 0) - 1) < 1e-9, "aspect weights sum to 1");
ok(comp.verdict && comp.verdict.label, "verdict present");

var same = SM.computeCompatibility(pA, SM.computeProfile("Alice Marie Johnson", "1990-07-21"));
ok(same.aspects.every(function (a) { return a.pct >= 88; }), "identical profiles get resonance floor");

/* ---- computeMoment: personal cycles at a fixed instant ---- */

// dob 1990-07-21 at 2026-07-14 19:39
// PY = 7+21+digitSum(2026)=38 -> 2; PM = 2+7 = 9; PD = 9+14=23 -> 5; Moment = 5+19=24 -> 6
var mA = SM.computeMoment(pA, new Date(2026, 6, 14, 19, 39));
eq(mA.personalYear, 2, "A personal year");
eq(mA.personalMonth, 9, "A personal month");
eq(mA.personalDay, 5, "A personal day");
eq(mA.momentNumber, 6, "A moment number");

// Year-boundary + master-sum case: dob 1985-12-31 at 2026-12-31 23:05
// PY = 12+31+10=53 -> 8; PM = 8+12=20 -> 2; PD = 2+31=33 -> 6 (cycles reduce fully); Moment = 6+23=29 -> 2
var mB = SM.computeMoment(pB, new Date(2026, 11, 31, 23, 5));
eq(mB.personalYear, 8, "B personal year");
eq(mB.personalMonth, 2, "B personal month");
eq(mB.personalDay, 6, "B personal day (33 reduces fully in cycles)");
eq(mB.momentNumber, 2, "B moment number");

// Midnight hour: dob 2000-11-11 at 2026-01-01 00:00
// PY = 11+11+10=32 -> 5; PM = 5+1=6; PD = 6+1=7; Moment = 7+0=7
var pC = SM.computeProfile("Test Person", "2000-11-11");
var mC = SM.computeMoment(pC, new Date(2026, 0, 1, 0, 0));
eq(mC.personalYear, 5, "C personal year");
eq(mC.personalMonth, 6, "C personal month");
eq(mC.personalDay, 7, "C personal day");
eq(mC.momentNumber, 7, "C moment number at hour 0");

/* ---- momentPairing ---- */

var nowFixed = new Date(2026, 6, 14, 19, 39);
var pair = SM.momentPairing(pA, pC, nowFixed);
ok(pair.rating >= 1 && pair.rating <= 5, "pairing rating in 1..5");
ok(pair.pct > 0 && pair.pct <= 100, "pairing pct in range");
ok(typeof pair.text === "string" && pair.text.length > 20, "pairing text present");
ok(pair.now === nowFixed, "pairing carries the submission instant");
eq(pair.p1.personalDay, 5, "pairing embeds person one cycles");

// dob 1975-05-05 also has Personal Day 5 at that instant -> identical-day resonance floor
var pD = SM.computeProfile("Mirror Day Person", "1975-05-05");
var pairSame = SM.momentPairing(pA, pD, nowFixed);
eq(pairSame.p2.personalDay, 5, "mirror profile personal day");
ok(pairSame.pct >= 88, "identical personal days get resonance floor");

/* ---- compatHTML renders the This Moment section ---- */

comp.moment = pair;
var htmlOut = SM.compatHTML(comp);
ok(htmlOut.indexOf("This Moment") !== -1, "compatHTML includes This Moment section");
ok(htmlOut.indexOf('data-info="moment"') !== -1, "This Moment has an explainer button");
ok(htmlOut.indexOf("Read ") !== -1, "compatHTML includes the submission timestamp");
ok(htmlOut.indexOf("Personal Year") !== -1, "compatHTML lists personal cycles");

var noMoment = SM.computeCompatibility(pA, pB);
ok(SM.compatHTML(noMoment).indexOf("This Moment") === -1, "no moment section without comp.moment");

console.log(passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
