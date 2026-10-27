// Prüft die Trainingslogik ohne Browser. Aufruf im Repo-Hauptordner:  node tests/logik.test.cjs index.html
const fs = require("fs");
const file = process.argv[2] || "index.html";
const html = fs.readFileSync(file, "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).sort((a, b) => b.length - a.length)[0];
const el = () => ({ addEventListener() {}, innerHTML: "", querySelectorAll: () => [], insertAdjacentHTML() {}, appendChild() {}, style: { setProperty() {} }, dataset: {}, getAttribute: () => null, setAttribute() {}, removeAttribute() {} });
global.document = { getElementById: () => el(), addEventListener() {}, querySelector: () => null, body: el(), documentElement: el() };
global.window = { scrollTo() {} }; global.matchMedia = () => ({ matches: false, addEventListener() {} });
global.requestAnimationFrame = () => {}; global.setInterval = () => {}; global.setTimeout = () => {};
global.localStorage = { getItem: () => null, setItem() {} }; global.navigator = {}; global.MutationObserver = class { observe() {} };
let fails = 0, n = 0;
const ok = (c, msg) => { n++; if (!c) { fails++; console.log("✗ " + msg); } else console.log("✓ " + msg); };
eval(js.replace(/\napplyTheme\(\);\nrender\(\);[\s\S]*$/, "") + `
S.days = tmplDays(3); S.setup = true;
// 1 Plan
const p = buildPlan(["po", "quad", "abd"], 1, []);
ok(p.length >= 3 && p.every((i) => i.sets >= 2 && i.sets <= 5), "Plan hat 2–5 Sätze je Übung");
// 2 Ausweichen bevorzugt gleiches Muster
const it = makeItem("po", 3, EXM.ht_m, EXM.ht_m);
ok(altsFor(it, ["hipthrust"], new Set(["ht_m"]))[0].pat === "ht", "Ersatz für Hip Thrust ist wieder ein Hip Thrust");
// 3 Restvolumen
it.log = [{ w: "60", r: "12", done: true }, { w: "60", r: "12", done: true }, { w: "60", r: "", done: false }];
ok(Math.abs(remainingE(it) - 1) < 0.01, "Nach 2 von 3 Sätzen bleibt 1 Satz Restvolumen");
ok(makeItem("po", remainingE(it), EXM.ht_smith, EXM.ht_m, null, true).sets === 1, "Ersatz bekommt nur noch 1 Satz");
// 4 Körpergewicht max. 20 Wdh. mit Tempo
const bw = makeItem("quad", 3, EXM.bwsquat, EXM.legpress);
ok(bw.reps[1] <= 20 && bw.tempo, "Körpergewicht: höchstens 20 Wdh., dafür langsames Tempo");
// 5 Gewichtsschätzung
S.sessions.push({ id: "a", date: new Date().toISOString(), items: [{ g: "po", ex: "ht_m", reps: [10, 15], log: [{ w: "60", r: "15", done: true }] }] });
const est = estWeight({ ex: "ht_smith", reps: [10, 15], g: "po" });
ok(est && est.est && est.w > 30 && est.w < 70, "Schätzung Smith-Hip-Thrust aus Maschinen-Hip-Thrust: " + (est && est.w) + " kg");
// 6 Aufwärmen 10–15 Min
const wm = (warmSecs(buildWarm(["po", "quad"], "normal")) / 60) + 2.5;
ok(wm >= 10 && wm <= 15, "Aufwärmen dauert " + wm.toFixed(1) + " Min");
// 7 Einschränkung Knie
S.limits = { knee: true };
ok(!buildPlan(["quad"], 1, []).some((i) => LIMITS.knee.ids.includes(i.ex)), "Knie: keine kniebelastenden Übungen");
S.limits = {};
// 8 Belastungsfaktor
S.form = { [dayKey(new Date())]: { sleep: 0, energy: 0 } };
ok(loadFactor().f <= 0.7, "Schlechte Tagesform senkt das Volumen");
// 9 Eigengewicht, Band, Ball: keine Frage
ok(noAsk(EXM.bridge) && noAsk(EXM.clam) && noAsk(EXM.ball_curl) && !noAsk(EXM.ht_m), "Matte/Band/Ball ohne „Frei?“-Frage, Maschinen mit");
// 10 Mini-Aufwärmen ca. 5 Min ohne Cardio
const mw = buildWarm(["po"], "mini", "sitzen");
const mws = warmSecs(mw) / 60;
ok(!mw.some((q) => q.k === "cardio") && mws >= 4 && mws <= 6.5, "Mini-Aufwärmen ohne Gerät, " + mws.toFixed(1) + " Min");
// 11 Gerätezeiten: oft besetzt kommt später
const d0 = new Date(); S.eqLog = [1, 2, 3].map(() => ({ e: "hipthrust", wd: wdOf(d0), h: d0.getHours(), b: 1 }));
ok(oftenBusy(EXM.ht_m, d0) && !oftenBusy(EXM.legpress, d0), "Hip-Thrust-Maschine gilt um diese Zeit als oft besetzt");
// 12 Teilen: Code hin und zurück
const code = dayCode(S.days[0]); ok(b64d(code).d.name === S.days[0].name, "Trainingstag-Code lässt sich wieder lesen");
// 13 Kalender
ok(icsText().includes("BEGIN:VEVENT") && icsText().includes("RRULE:FREQ=WEEKLY"), "Kalenderdatei enthält wöchentliche Termine");
console.log(n - fails + " von " + n + " Tests bestanden"); if (fails) process.exitCode = 1;
`);
