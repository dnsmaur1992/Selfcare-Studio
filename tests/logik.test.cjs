// Prüft die Trainingslogik ohne Browser. Aufruf im Repo-Hauptordner:  node tests/logik.test.cjs index.html
const fs = require("fs");
const file = process.argv[2] || "index.html";
const html = fs.readFileSync(file, "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).sort((a, b) => b.length - a.length)[0];
const el = () => ({ addEventListener() {}, innerHTML: "", querySelectorAll: () => [], insertAdjacentHTML() {}, appendChild() {}, style: { setProperty() {}, removeProperty() {} }, dataset: {}, getAttribute: () => null, setAttribute() {}, removeAttribute() {} });
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
// 14 Pause unterbricht die Wochenserie nicht
S.sessions = []; S.pause = null; S.pauses = [];
const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
[14, 13].forEach((d, i) => S.sessions.push({ id: "w" + i, date: ago(d + (wdOf(new Date()) - 1)), items: [] }));
const noPause = weekStreak();
S.pauses = [{ from: ago(7 + (wdOf(new Date()) - 1)), to: ago(1 + (wdOf(new Date()) - 1)), why: "vac" }];
ok(noPause === 0 && weekStreak() === 1, "Pausenwoche unterbricht die Serie nicht (ohne Pause " + noPause + ", mit Pause " + weekStreak() + ")");
S.pauses = [];
// 15 Fokus-Block verschiebt Volumen
S.focus = { id: "po", start: new Date().toISOString() };
ok(focusFactor("po") > 1 && focusFactor("brust") < 1, "Fokus Po: mehr Po, etwas weniger Rest");
S.focus = null;
// 16 Warnung bei gleichen Muskeln an zwei Tagen hintereinander
const wk16 = thisWeek(); const pos = wk16.slots.filter((q) => q.type === "kraft" && slotInfo(q).groups.includes("po"));
pos[0].wd = 3; ok(neighborClash(pos[1], 4).includes(GROUPS.po.n), "Po & Beine Mi + Do löst die 48-Stunden-Warnung aus");
// 17 Frisuren
ok(hairSVG("dutt", false).includes("circle") && hairSVG("ohne", false) === "" && HAIRS.length === 6, "Sechs Frisuren, Dutt mit Knoten, „Ohne“ ohne Haare");
// 18 Was ist neu
ok(NEWS.v === S_VERSION && NEWS.items.length <= 6 && NEWS.old.length >= 1, "„Was ist neu“ passt zur Version " + S_VERSION + " und hat einen Verlauf");
// 19 Zum Lesen: jede Seite mit Quelle, kurze Abschnitte
ok(READS.every((r) => r.src.length && r.src.every(([, u]) => u.startsWith("https://")) && r.sec.every(([, t]) => t.split(/[.!?] /).length <= 3)), "Zum Lesen: jedes Thema mit Quelle, Abschnitte mit höchstens 3 Sätzen");
// 20 Belastung bleibt begrenzt
S.form = {}; S.mood = {}; ok(loadFactor().f >= 0.5 && loadFactor().f <= 1.1, "Belastungsfaktor bleibt zwischen 50 und 110 %");
console.log(n - fails + " von " + n + " Tests bestanden"); if (fails) process.exitCode = 1;
`);
