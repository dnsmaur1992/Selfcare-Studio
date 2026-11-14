// Prüft die Trainingslogik ohne Browser. Aufruf im Repo-Hauptordner:  node tests/logik.test.cjs index.html
const fs = require("fs");
const file = process.argv[2] || "index.html";
const html = fs.readFileSync(file, "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).sort((a, b) => b.length - a.length)[0];
const el = () => ({ addEventListener() {}, querySelector: () => null, innerHTML: "", querySelectorAll: () => [], insertAdjacentHTML() {}, appendChild() {}, style: { setProperty() {}, removeProperty() {} }, dataset: {}, getAttribute: () => null, setAttribute() {}, removeAttribute() {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, remove() {}, scrollTo() {} });
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
const wm = warmSecs(buildWarm(["po", "quad"], "normal")) / 60;
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
// 21 Aufwärmsätze nur auf Nachfrage, gespeichert, aber nicht als Arbeitssatz gezählt
const wi = prepItem({ g: "po", e: 3, ex: "ht_m", ideal: "ht_m", sets: 3, reps: [10, 15] }, true);
ok(wi.warmAsk && !wi.log.some((q) => q.warm) && warmAskNow(wi), "Große Übung: erst Frage, kein automatischer Aufwärmsatz");
wi.log.forEach((q) => (q.w = "60")); addWarmSet(wi); const w1 = wi.log[0];
ok(w1.warm && w1.w === "30" && w1.r === "10" && !warmAskNow(wi), "Aufwärmsatz 1: 50 % × 10 (" + w1.w + " kg × " + w1.r + ")");
w1.done = true; ok(warmAskNow(wi), "Nach dem Aufwärmsatz fragt die App erneut");
w1.w = "35"; w1.r = "8"; addWarmSet(wi); ok(wi.log[1].warm && wi.log[1].w === "35" && wi.log[1].r === "8", "Aufwärmsatz 2 übernimmt Aufwärmsatz 1 (35 kg × 8)");
wi.log[1].done = true; wi.log[2].done = true; wi.log[2].r = "12";
const ws = { items: [{ ex: "ht_m", log: wi.log }] };
ok(setsOf(ws) === 1 && warmSetsOf(ws) === 2 && volOf(ws) === 35 * 8 + 35 * 8 + 60 * 12 && volOf(ws, true) === 35 * 8 * 2, "Gesamtlast inkl. Aufwärmen, Sätze ohne: " + volOf(ws) + " kg");
ok(!prepItem({ g: "po", e: 3, ex: "bridge", ideal: "bridge", sets: 3, reps: [12, 20] }, true).warmAsk, "Körpergewicht: keine Aufwärmfrage");
// 21b Rückweg: Aufwärmsatz abbrechen bzw. statt Arbeitssatz nachträglich einschieben
const fi = prepItem({ g: "po", e: 3, ex: "lateral_kh", ideal: "lateral_kh", sets: 3, reps: [12, 20] }, true); fi.log.forEach((q) => (q.w = "8"));
ok(!fi.warmAsk, "Isolationsübung: keine automatische Frage");
addWarmSet(fi); fi.warmAsk = true; ok(fi.log[0].warm && !fi.log[0].done && fi.log.filter((q) => !q.warm).length === 3, "„Stattdessen erst einen Aufwärmsatz“ schiebt einen Satz vor den ersten Arbeitssatz");
fi.log.splice(0, 1); fi.warmAsk = false; ok(!fi.log.some((q) => q.warm) && !warmAskNow(fi), "„Doch kein Aufwärmsatz“ führt direkt zum Arbeitssatz");
// 22 Fokus Körperfett: kürzere Pausen, Volumen bleibt
S.focus = { id: "fett", start: new Date().toISOString() };
ok(fatFocus() && restFor({ type: "c" }) < S.restC && restFor({ type: "i" }) >= 45 && focusFactor("po") === 1, "Fokus Körperfett: Pausen " + restFor({ type: "c" }) + "/" + restFor({ type: "i" }) + " s, Volumen unverändert");
S.focus = null;
// 23 Springen im Training: Ausgelassenes ist übersprungen, nicht erledigt
const ji = [1, 2, 3].map(() => prepItem({ g: "po", e: 3, ex: "ht_m", ideal: "ht_m", sets: 2, reps: [10, 15] }, false));
S.active = { items: ji, steps: [{ k: "timed", ex: "katzekuh", sec: 40, sect: "warm" }, ...ji.map((it) => ({ k: "item", id: it.id }))], pos: 0, ph: "" };
const A0 = S.active; A0.pos = 0; for (let i = 0; i < 3; i++) markSkipped(A0.steps[i]); A0.pos = 3;
ok(stepStatus(A0.steps[0]) === "skip" && stepStatus(A0.steps[1]) === "skip" && stepStatus(A0.steps[2]) === "skip" && stepStatus(A0.steps[3]) === "open", "Übersprungenes gilt als übersprungen, nicht als erledigt");
ji[2].log[0].done = true; ok(stepStatus(A0.steps[3]) === "part", "Ein von zwei Sätzen: teilweise");
ji[2].log.forEach((q) => (q.done = true)); ok(stepStatus(A0.steps[3]) === "done", "Alle Sätze: erledigt");
unskip(A0.steps[1]); ok(stepStatus(A0.steps[1]) === "open", "Nachholen hebt „übersprungen“ auf");
removeStep(2); ok(A0.items.length === 2 && A0.steps.length === 3, "Entfernen nimmt die Übung aus der Einheit");
S.active = null;
// 24 Körperdaten: Alter, Puls, BMI, Taille zu Größe, Kraft im Verhältnis
S.body = { year: new Date().getFullYear() - 46, height: 168 }; S.measures = [{ d: new Date().toISOString(), gewicht: 65, taille: 80 }];
ok(ageNow() === 46 && hfMax() === Math.round(208 - 0.7 * 46), "Alter 46 → Maximalpuls " + hfMax());
const bs = Object.fromEntries(bodyStats().map(([k, v]) => [k, v]));
ok(bs.BMI === "23" && bs["Taille zu Größe"] === "0,48", "BMI " + bs.BMI + ", Taille zu Größe " + bs["Taille zu Größe"]);
ok(pulseRange(0.65, 0.75).startsWith("Puls ca. ") && pulseRange(0.65, 0.75).includes("–"), "Pulsbereich: " + pulseRange(0.65, 0.75));
ok(weightAt(new Date().toISOString()) === 65, "Gewicht zum Datum gefunden");
S.body = {}; S.measures = []; ok(!hfMax() && !bodyStats().length, "Ohne Angaben keine Werte");
// 25 Satzpause 3 Min als Voreinstellung, Übernahme von Gewicht und Wiederholungen
ok(defaults().restC === 180 && defaults().restI === 180, "Satzpause voreingestellt: 3:00 Min");
S.restC = 180; S.restI = 180; ok(restFor({ type: "c" }) === 180 && restFor({ type: "i" }) === 180, "Pause im Training: " + restFor({ type: "c" }) + " s");
const ci = prepItem({ g: "po", e: 3, ex: "ht_m", ideal: "ht_m", sets: 3, reps: [10, 15] }, false); ci.log.forEach((q) => (q.w = "50")); ci.log[0].w = "55"; ci.log[0].r = "12";
S.active = { items: [ci], steps: [{ k: "item", id: ci.id }], pos: 0, ph: "sets", start: Date.now() }; setDone();
ok(ci.log[1].w === "55" && ci.log[1].r === "12" && ci.log[2].r === "12", "Satz 2 und 3 übernehmen 55 kg × 12 aus Satz 1");
ok(S.active.total === 180, "Pause nach dem Satz: " + S.active.total + " s");
S.active = null;
// 26 Werte vom letzten Mal: Arbeitssätze und Aufwärmsätze
S.sessions.push({ id: "lm", date: new Date().toISOString(), items: [{ g: "po", ex: "legpress", reps: [10, 15], log: [{ w: "25", r: "10", done: true, warm: true }, { w: "40", r: "6", done: true, warm: true }, { w: "70", r: "14", done: true }, { w: "70", r: "12", done: true }] }] });
const lm = prepItem({ g: "quad", e: 3, ex: "legpress", ideal: "legpress", sets: 3, reps: [10, 15] }, true);
ok(lm.log[0].w === "70" && lm.log[0].r === "14" && lm.log[1].r === "12" && lm.log[2].r === "12", "Arbeitssätze: 70 kg × 14 / 12 / 12 vom letzten Mal");
addWarmSet(lm); lm.log[0].done = true; addWarmSet(lm); lm.log[1].done = true; addWarmSet(lm);
ok(lm.log[0].w === "25" && lm.log[0].r === "10" && lm.log[1].w === "40" && lm.log[1].r === "6" && lm.log[2].w === "40" && lm.log[2].r === "6", "Aufwärmsätze: 25×10, 40×6 vom letzten Mal, der dritte übernimmt den vorigen");
// 27 Töne: sechs Signaltöne plus „Kein Ton“, Countdown wählbar
ok(Object.keys(SOUNDS).length === 7 && Object.values(SOUNDS).filter((o) => o.parts).every((o) => o.dur > 0 && o.parts.every((q) => q[0] > 100 && q[1] > 0)), "Sechs Signaltöne und „Kein Ton“");
let played = []; const _ps = playSnd; playSnd = (k) => played.push(k);
S.sound = "schale"; gong(); S.sound = "aus"; gong(); S.tick = "tick"; beep(1046); S.tick = "aus"; beep(1046); S.tick = "piep"; beep(1046);
ok(played.join(",") === "schale,tick,beep", "Gewählter Ton wird gespielt, „Aus“ bleibt still: " + played.join(","));
playSnd = _ps; S.sound = "gong"; S.tick = "piep";
// 28 Pilates/Mobility: Ansage und Signalton bei Start
const said = [], snd = []; const _say = say, _gong = gong; say = (t) => said.push(t); gong = () => snd.push("g");
S.active = { flow: true, type: "pilates", blocks: buildFlow("pilates").slice(0, 3), i: 0, phase: "ready", start: Date.now() };
flowGoto(0, "prep"); flowGoto(0, "work");
ok(said[0].startsWith("Gleich: ") && snd.length === 1, "Pilates: Ansage beim Bereitmachen, Signalton beim Start");
say = _say; gong = _gong; S.active = null;
// 29 Ausgeblendetes Gerät taucht auch in eigenen Trainingstagen nicht mehr auf
S.equip.hack = false;
const cu = buildCustom([{ ex: "hack", g: "quad", sets: 3, reps: [10, 15] }, { ex: "legext", g: "quad", sets: 3, reps: [12, 15] }], 1, []);
ok(cu.every((i) => i.ex !== "hack" && i.ideal !== "hack") && cu[0].ex && !cu[0].note, "Hackenschmidt ausgeblendet: eigener Tag nimmt " + cu[0].ex + ", ohne „Statt …“");
ok(![1, 2, 3].some(() => buildPlan(["quad", "po"], 1, []).some((i) => i.ex === "hack" || i.ideal === "hack")), "Automatischer Plan ohne Hackenschmidt");
S.equip.hack = true;
// 30 Neue Geräte und Übungen
ok(["pendel", "rueckenm", "rotation", "trx", "miniband", "stepper"].every((k) => EQUIP[k]) && ["pendulum", "backext_m", "rot_m", "trx_row", "trx_squat", "trx_press", "lateralwalk", "bridge_band"].every((id) => EXM[id] && EXM[id].anim && EXM[id].pat), "6 neue Geräte, 8 neue Übungen mit Animation und Bewegungsmuster");
ok(isBW(EXM.trx_row) && noAsk(EXM.lateralwalk) && !noAsk(EXM.trx_row), "TRX/Mini-Band ohne Gewichtsfeld, Mini-Band ohne Frei-Frage");
S.equip.hack = false; const it30 = makeItem("quad", 3, EXM.legpress, EXM.legpress);
ok(altsFor(it30, [], new Set(["legpress"])).some((x) => x.id === "pendulum") && !altsFor(it30, [], new Set(["legpress"])).some((x) => x.id === "hack"), "Ersatz für Beinpresse: Pendel-Kniebeuge ja, ausgeblendete Hackenschmidt nein");
S.equip.hack = true;
// 31 Mini-Training: Oberkörper-Tag bekommt Oberkörper-Übungen
const mo = buildMini(["ruecken", "brust", "schulter", "tri"]).map((i) => i.g);
ok(["ruecken", "brust", "schulter", "tri"].every((g) => mo.includes(g)), "Mini-Training Oberkörper deckt Rücken, Brust, Schultern, Trizeps ab");
// 32 Geräte-Einweisung für jede Maschine
const freeKit = ["kh", "kb", "bank", "stepbox", "ball", "band", "miniband", "matte"];
ok(Object.keys(EQUIP).filter((k) => !freeKit.includes(k)).every((k) => MACHINES[k] && MACHINES[k].s.length && MACHINES[k].g.length && MACHINES[k].b.length), "Jede Maschine hat Einstellen, So gelingt's und Stolpersteine");
S.sessions = []; ok(!usedMachineBefore("beinpresse") && machineOf(EXM.legpress) === "beinpresse", "Beinpresse noch nie benutzt → Einweisung wird angeboten");
// 33 Akzentfarben: lesbare Knopfschrift in Hell und Dunkel
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
ok(Object.values(ACCENTS).every((o) => cr(o.l[0], o.l[1]) >= 4.3 && cr(o.d[0], o.d[1]) >= 4.3), "Sechs Akzentfarben, Knopfschrift überall mindestens 4,3 : 1 Kontrast");
// 34 Pause nach Aufwärmsätzen einstellbar
S.restW = 90; const wr = prepItem({ g: "po", e: 3, ex: "ht_m", ideal: "ht_m", sets: 2, reps: [10, 15] }, true); wr.log.forEach((q) => (q.w = "50")); addWarmSet(wr);
S.active = { items: [wr], steps: [{ k: "item", id: wr.id }], pos: 0, ph: "sets", start: Date.now() }; setDone();
ok(S.active.total === 90, "Pause nach Aufwärmsatz: " + S.active.total + " s (eingestellt 90)");
S.active = null; delete S.restW; ok(warmRest() === 45, "Ohne Einstellung weiterhin 45 s");
S.restM = 60; S.active = { type: "mini" }; ok(restFor(EXM.bridge) === 60, "Mini-Training: eingestellte Pause 60 s"); S.active = null; delete S.restM;
// 35 Eigene Übungen
S.sessions = []; S.customEx = []; S.customEq = {};
const cid = saveCustom({ n: "Glute-Drive-Maschine", base: "ht_m", eq: "base", neq: "Glute Drive", tips: "Gurt fest über die Hüfte" });
const cxo = EXM[cid];
ok(cxo && cxo.custom && cxo.pat === EXM.ht_m.pat && EQUIP[cxo.eq[0]] === "Glute Drive" && cxo.tips[0].startsWith("Gurt"), "Eigene Übung übernimmt Muster und Muskeln der Vorlage, eigenes Gerät angelegt");
ok(cands("po", [], new Set()).some((q) => q.id === cid), "Eigene Übung kann im Plan vorkommen");
const ai = makeItem("po", 3, EXM.ht_m, EXM.ht_m); ok(altsFor(ai, ["hipthrust"], new Set(["ht_m"])).slice(0, 3).some((q) => q.id === cid), "Hip-Thrust-Maschine besetzt → eigene Glute-Drive als Ersatz vorne mit dabei");
S.equip[cxo.eq[0]] = false; ok(!cands("po", [], new Set()).some((q) => q.id === cid), "Eigenes Gerät ausgeblendet → Übung wird nicht geplant"); S.equip[cxo.eq[0]] = true;
// Teilen: Trainingstag mit eigener Übung
S.days[0].mode = "custom"; S.days[0].custom = [{ ex: cid, g: "po", sets: 3, reps: [10, 15] }];
const code35 = dayCode(S.days[0]); S.customEx = []; S.customEq = {}; registerCustom();
ok(!EXM[cid], "Ohne Definition kennt die App die Übung nicht");
const nd35 = importDay(code35); ok(EXM[cid] && nd35.custom[0].ex === cid && EQUIP[EXM[cid].eq[0]] === "Glute Drive", "Geteilter Tag bringt die eigene Übung samt Gerät mit");
// Löschen: im Verlauf benutzt → bleibt unsichtbar erhalten
S.sessions.push({ id: "c1", date: new Date().toISOString(), items: [{ g: "po", ex: cid, reps: [10, 15], log: [{ w: "40", r: "12", done: true }] }] });
deleteCustom(cid); ok(EXM[cid] && EXM[cid].hidden && !cands("po", [], new Set()).some((q) => q.id === cid) && !S.days.some((d) => (d.custom || []).some((q) => q.ex === cid)), "Gelöschte, schon trainierte Übung bleibt für den Verlauf lesbar, taucht aber nirgends mehr auf");
S.sessions = []; S.customEx = []; S.customEq = {}; registerCustom();
// 36 Notizen
S.notes = { legpress: "Sitz Stufe 4" }; ok(exNote("legpress") === "Sitz Stufe 4" && noteLine("legpress").includes("Stufe 4") && noteLine("hack") === "", "Notiz zur Übung wird angezeigt, ohne Notiz nichts");
// ===== Review 29.10. (externes Review zu 3.7): Regressionstests =====
S.sessions = []; S.customEx = []; S.customEq = {}; registerCustom(); S.days = tmplDays(3); S.weeks = {};
// R1 Einschränkungen gelten auch in eigenen Plänen und für eigene Übungen
S.limits = { knee: true };
ok(!buildCustom([{ ex: "goblet", g: "quad", sets: 3, reps: [10, 15] }], 1, []).some((i) => i.ex === "goblet" || i.ideal === "goblet"), "R1: Knie-Einschränkung ersetzt Goblet Squat auch im eigenen Plan");
const rk = saveCustom({ n: "Goblet Kopie", base: "goblet", eq: "base", neq: "", tips: "" });
ok(limited(rk) && !cands("quad", [], new Set()).some((q) => q.id === rk), "R1: Eigene Übung erbt die Einschränkung ihrer Vorlage");
S.limits = {}; S.customEx = []; registerCustom();
// R2 Assistenzgeräte: weniger Hilfe = Fortschritt
const ap = prepItem({ g: "ruecken", e: 3, ex: "assist_pull", ideal: "assist_pull", sets: 3, reps: [6, 10] }, true);
ap.log.forEach((q) => (q.w = "40")); ap.log[0].r = "14";
S.active = { items: [ap], steps: [{ k: "item", id: ap.id }], pos: 0, ph: "sets", start: Date.now() }; setDone();
ok(num(ap.log[1].w) < 40 && !ap.warmAsk, "R2: 14 Wdh. mit 40 kg Hilfe → nächster Satz mit weniger Hilfe (" + ap.log[1].w + " kg), keine Aufwärmfrage");
S.active = null;
S.sessions = [{ id: "a1", date: "2026-10-01T10:00:00.000Z", items: [{ ex: "assist_pull", log: [{ w: "30", r: "8", done: true }] }] }];
ok(!prsOf({ date: "2026-10-08T10:00:00.000Z", items: [{ ex: "assist_pull", log: [{ w: "40", r: "8", done: true }] }] }).length && prsOf({ date: "2026-10-08T10:00:00.000Z", items: [{ ex: "assist_pull", log: [{ w: "25", r: "8", done: true }] }] }).length === 1, "R2: Rekord nur bei weniger Hilfe (30 → 25), nicht bei mehr (30 → 40)");
S.sessions = [{ id: "a2", date: "2026-10-01T10:00:00.000Z", items: [{ ex: "latzug", log: [{ w: "40", r: "10", done: true }] }] }];
ok(estWeight({ ex: "assist_pull", reps: [6, 10], g: "ruecken" }) === null, "R2: Keine Schätzung der Hilfe aus dem Latzug");
S.sessions = [];
// R3 HTML-Einschleusung über geteilte Pläne
const evil = b64e({ v: 1, d: { name: "Tag", type: "kraft", mode: "custom", custom: [{ ex: "cx_evil1", g: "po", sets: 3, reps: [10, 15] }] }, cx: [{ id: "cx_evil1", n: "<img src=x onerror=alert(1)>", base: "ht_m" }] });
ok(!importSheet(evil).includes("<img"), "R3: Vorschau eines manipulierten Codes enthält kein eingeschleustes HTML");
const nd3 = importDay(evil); ok(!EXM.cx_evil1.n.includes("<") && !nd3.name.includes("<"), "R3: Importierte Namen werden bereinigt");
S.customEx = []; registerCustom(); S.days = tmplDays(3);
// R4 Ungültige Importe ändern nichts; kaputte Daten werden repariert
const before4 = S.days.length; let threw = false;
try { importDay(b64e({ v: 1, d: { name: "X", type: "quatsch" } })); } catch (e) { threw = true; }
ok(threw && S.days.length === before4, "R4: Unbekannter Trainingstyp wird abgelehnt, Plan bleibt unverändert");
S.days.push({ id: "bad", type: "quatsch", name: "Kaputt", groups: [] }); S.days.push({ id: "bad2", type: "kraft", name: "<b>x</b>", groups: ["po", "gibtsnicht"], mode: "custom", custom: [{ ex: "gibtsnicht" }, { ex: "ht_m", sets: 99, reps: ["a"] }], wd: 42 });
normalizeDays(); const b2 = S.days.find((d) => d.id === "bad2");
ok(!S.days.some((d) => d.id === "bad") && b2 && !b2.name.includes("<") && b2.groups.join() === "po" && b2.wd === 0 && b2.custom.length === 1 && b2.custom[0].sets === 6, "R4: Reparatur beim Start entfernt Ungültiges und begrenzt Werte");
S.days = tmplDays(3);
// R5 Eigene Übung während laufender Einheit löschen
const r5 = saveCustom({ n: "Mein Hip Thrust", base: "ht_m", eq: "base", neq: "", tips: "" });
S.active = { items: [{ id: "i5", ex: r5, ideal: r5, log: [] }], steps: [], pos: 0 };
deleteCustom(r5); ok(EXM[r5] && EXM[r5].hidden, "R5: In laufender Einheit verwendete Übung bleibt erhalten (nur ausgeblendet)");
S.active = null; S.customEx = []; registerCustom();
// R6 Aufwärmsätze bleiben beim Gerätewechsel erhalten
const w6 = prepItem({ g: "po", e: 3, ex: "ht_m", ideal: "ht_m", sets: 3, reps: [10, 15] }, true); w6.log.forEach((q) => (q.w = "60")); addWarmSet(w6); w6.log[0].done = true;
S.active = { type: "kraft", items: [w6], steps: [{ k: "item", id: w6.id }], pos: 0, ph: "sets", start: Date.now() - 60000, busyAt: {} };
swapTo(w6.id, "ht_smith", true);
ok(S.active.items.length === 2 && S.active.items[0].closed && S.active.items[0].log.some((q) => q.warm && q.done), "R6: Erledigter Aufwärmsatz bleibt nach dem Tausch erhalten");
S.active = null;
// R7 Mini-Training: Zeit aus Sätzen und eingestellter Pause, Runden passen sich an
S.restM = 120; const m7 = buildMini(["po", "quad"]);
ok(m7.every((i) => i.sets === 2) && estMin(m7, true) === Math.round(1 + m7.reduce((a, i) => a + i.sets * ((EXM[i.ex].side ? 1.4 : 0.75) + 2), 0)), "R7: 2:00 Pause → 2 Runden, Zeit " + estMin(m7, true) + " Min aus echten Pausen");
delete S.restM; ok(buildMini(["po"]).every((i) => i.sets === 3), "R7: Standardpause → 3 Runden");
// R8 Satzgrenze 6 überall
ok(cleanCustomList([{ ex: "ht_m", g: "po", sets: 8, reps: [10, 15] }])[0].sets === 6, "R8: Eigene Pläne höchstens 6 Sätze (wie die Ausführung)");
// R9 Volumengrenze 22 effektive Sätze
const p9 = buildPlan([...GORDER], 1.1, []); const e9 = p9.reduce((a, it) => a + (it.ex ? it.sets * (EXM[it.ex].m[it.g] || 0.6) : 0), 0);
ok(e9 <= 22.05, "R9: Alle Muskelgruppen → " + e9.toFixed(1) + " effektive Sätze (≤ 22)");
// R10 Pilates: nur Gehaltenes wird gespeichert
S.sessions = []; S.active = { id: "f", flow: true, type: "pilates", name: "Pilates", start: Date.now(), blocks: buildFlow("pilates").slice(0, 4), i: 0, phase: "prep", end: Date.now() + 10000, paused: 0 };
for (let k = 0; k < 4; k++) { flowMark(S.active); S.active.i = k + 1; S.active.phase = "prep"; }
S.active.i = 3; finishFlow(false); ok(!S.sessions.length, "R10: Alles übersprungen → nichts gespeichert");
S.active = { id: "f2", flow: true, type: "pilates", name: "Pilates", start: Date.now(), blocks: buildFlow("pilates").slice(0, 3), i: 0, phase: "work", end: Date.now() + 5000, paused: 0 };
S.active.blocks[0].sec = 60; flowMark(S.active); S.active.i = 1; S.active.phase = "prep"; finishFlow(false);
ok(S.sessions.length === 1 && S.sessions[0].items.length === 1 && S.sessions[0].items[0].sec === 55, "R10: Gehaltene Position mit echter Zeit (55 s), übersprungene nicht");
S.sessions = []; S.active = null;
// R11 Lokaler Kalendertag
ok(dayKey(new Date(2026, 9, 29, 0, 30)) === "2026-10-29", "R11: 29.10. 00:30 Uhr → Tagesschlüssel 29.10. (nicht Vortag)");
// Tabelle: Bänder, Erholungswarnung, Gewichtsangaben
S.equip.band = false; ok(!buildWarm(["po", "ruecken"], "normal").some((q) => q.ex === "band_walk" || q.ex === "band_pullapart"), "Bandübungen im Aufwärmen nur, wenn das Band eingeblendet ist"); S.equip.band = true;
S.weeks = {}; const wkT = thisWeek(); const poT = wkT.slots.filter((q) => q.type === "kraft" && slotInfo(q).groups.includes("po"));
poT[0].wd = 3; ok(neighborClash(poT[1], 3).includes(GROUPS.po.n), "Erholungswarnung auch am selben Tag");
ok(wHint(EXM.lateral_kh).includes("je Hantel") && wHint(EXM.assist_pull).includes("leichter") && wHint(EXM.legpress) === "", "Gewichtsangabe erklärt: je Hantel, Unterstützung");
// ---- Version 3.9: offene Punkte aus dem Review (P1–P5) ----
const snap = () => JSON.stringify(S);
const T0 = "2026-10-01T10:00:00.000Z", T1 = "2026-10-08T10:00:00.000Z";
const goodData = () => ({ setup: true, name: "Test", reps: "hoch", days: tmplDays(3), sessions: [{ id: "g1", date: T0, type: "kraft", name: "Tag", items: [{ g: "ruecken", ex: "latzug", reps: [10, 15], log: [{ w: "40", r: "12", done: true }] }] }] });
S.days = tmplDays(3); S.sessions = []; S.active = null; S.setup = true;
// P1 Backup- und Zustandsvalidierung
{ const d = goodData(); d.sessions.push({ id: "n1", date: T1, type: "kraft", name: "Kaputt", items: [null] });
  const c = checkBackup({ app: "satzwerk", data: d });
  ok(c.ok && c.st.sessions.length === 1 && c.notes.some((t) => t.includes("Einheit")), "P1: Einheit mit items [null] wird entfernt und gemeldet (" + c.notes.join("; ") + ")");
  const keep = snap(); applyBackup(c); let fine = true; try { vHome(); ["list", "prog", "load", "meas"].forEach((h) => { U.hist = h; vHist(); }); } catch (e) { fine = false; } U.hist = "list";
  ok(fine && S.sessions.length === 1, "P1: Startseite und Verlauf bauen nach dem Import mit items [null] auf"); }
{ const d = goodData(); d.reps = "unknown"; const c = checkBackup({ app: "satzwerk", data: d });
  ok(c.ok && c.st.reps === "hoch" && c.notes.some((t) => t.includes("Wiederholungsziel")), "P1: reps = \\"unknown\\" wird auf „hoch“ zurückgesetzt und gemeldet");
  applyBackup(c); let fine = true; try { thisWeek().slots.forEach((sl) => sl.type === "kraft" && planFor(sl, 1, [])); buildMini(["po"]); } catch (e) { fine = false; }
  ok(fine, "P1: Trainingsplanung baut nach dem Import mit ungültigem Wiederholungsziel auf"); }
{ S = Object.assign(defaults(), goodData()); registerCustom(); const keep = snap();
  const bad = [null, { app: "x", data: {} }, { app: "satzwerk", data: [] }, { app: "satzwerk", data: { sessions: "x" } }];
  ok(bad.every((o) => !checkBackup(o).ok) && snap() === keep, "P1: Fremde/kaputte Dateien werden abgelehnt, bisherige Daten unverändert");
  const ce = console.error; console.error = () => {}; const vh = vHist; vHist = () => { throw new Error("Probeaufbau"); }; const c = checkBackup({ app: "satzwerk", data: goodData() }); vHist = vh; console.error = ce;
  ok(!c.ok && snap() === keep, "P1: Scheitert der Probeaufbau, wird nichts übernommen"); }
{ const old = { setup: true, restC: 90, days: tmplDays(2), sessions: [{ date: T0, items: [{ ex: "ht_m", log: [{ w: 60, r: 12, done: true }] }] }, { date: T1, type: "pilates", items: [{ ex: FLOW.find((f) => f.cat === "pilates").id, sec: 45 }] }] };
  const c = checkBackup({ app: "satzwerk", data: old });
  ok(c.ok && !c.notes.length && c.st.sessions.length === 2 && c.st.sessions[0].items[0].log[0].w === "60" && c.st.sessions[1].flow && c.st.restC === 180, "P1: Älteres gültiges Backup (Zahlen statt Text, ohne flow-Kennung) lädt ohne Verlust"); }
{ const d = goodData(); d.sessions[0].items[0].log.push({ w: "<b>", r: "10", done: true }, "kaputt"); d.sessions[0].items.push({ ex: "gibtsnicht", log: [] }); d.sound = "laut"; d.accent = "neon"; d.focus = { id: "x" }; d.restM = "lang";
  const c = checkBackup({ app: "satzwerk", data: d }); const lg = c.st.sessions[0].items[0].log;
  ok(c.ok && lg.length === 2 && lg[1].w === "" && c.st.sessions[0].items.length === 1 && !c.st.sound && !c.st.accent && c.st.focus === null && c.st.restM === undefined && c.notes.length >= 4, "P1: Sätze, Übungen und Einstellungen werden einzeln repariert, Rest bleibt (" + c.notes.length + " Hinweise)"); }
{ const d = goodData(); d.active = { type: "kraft", items: [{ ex: "latzug" }], steps: [], pos: 0 }; const c = checkBackup({ app: "satzwerk", data: d });
  ok(c.ok && c.st.active === null && c.st.rescued && c.st.rescued.raw.items[0].ex === "latzug", "P1: Beschädigte laufende Einheit wird beiseitegelegt, nicht gelöscht"); }
// P2 Verlustfreie Rettung
S = Object.assign(defaults(), goodData()); S.sessions = []; registerCustom(); U.rescueErr = null;
{ const blocks = buildFlow("pilates").slice(0, 3); S.active = { id: "pf", flow: true, type: "pilates", name: "Pilates", start: Date.now() - 600000, blocks, i: 1, phase: "work", end: Date.now() + 20000, paused: 0 }; blocks[0].secDone = 60;
  rescueFinish(); ok(S.active === null && S.sessions.length === 1 && S.sessions[0].flow && S.sessions[0].type === "pilates", "P2: Rettung speichert eine laufende Pilates-Einheit über finishFlow"); }
{ const blocks = buildFlow("mobility").slice(0, 2); S.active = { id: "mf", flow: true, type: "mobility", name: "Mobility", start: Date.now() - 300000, blocks, i: 0, phase: "work", end: Date.now() + 10000, paused: 0 }; blocks[0].sec = 40;
  rescueFinish(); ok(S.active === null && S.sessions.length === 2 && S.sessions[1].type === "mobility", "P2: Rettung speichert eine laufende Mobility-Einheit"); }
{ const it = prepItem({ g: "ruecken", e: 3, ex: "latzug", ideal: "latzug", sets: 3, reps: [10, 15] }, false); it.log[0] = { w: "40", r: "12", done: true };
  S.active = { id: "kk", type: "kraft", name: "Tag", items: [it], steps: [{ k: "item", id: it.id }], pos: 0, ph: "sets", start: Date.now() - 600000, busyAt: {} };
  rescueFinish(); ok(S.active === null && S.sessions.length === 3 && S.sessions[2].items[0].log.length === 1, "P2: Rettung speichert eine Kraft-Einheit");
  const n = S.sessions.length; S.active = { id: "kk", type: "kraft", name: "Tag", items: [it], steps: [{ k: "item", id: it.id }], pos: 0, ph: "sets", start: Date.now(), busyAt: {} };
  rescueFinish(); ok(S.sessions.length === n && S.active === null, "P2: Schon gespeicherte Einheit wird nicht doppelt angelegt"); }
{ const n = S.sessions.length; const raw = { id: "broken", type: "kraft", name: "Tag", items: [{ ex: "latzug", log: null }], steps: [{ k: "item", id: "x" }], pos: 0, ph: "sets", start: Date.now() };
  S.active = JSON.parse(JSON.stringify(raw)); const ce2 = console.error; console.error = () => {}; rescueFinish(); console.error = ce2;
  ok(S.sessions.length === n && S.active && JSON.stringify(S.active) === JSON.stringify(raw) && U.rescueErr && backupText().includes("\\"broken\\""), "P2: Scheitert das Speichern, bleibt die Einheit unverändert erhalten und steckt im Backup");
  S.active = null; U.rescueErr = null; }
// P3 0 kg Unterstützung
S.sessions = [{ id: "z1", date: T0, items: [{ ex: "assist_pull", reps: [10, 15], log: [{ w: "10", r: "10", done: true }] }] }];
{ const pr = prsOf({ date: T1, items: [{ ex: "assist_pull", log: [{ w: "0", r: "10", done: true }] }] });
  ok(pr.length === 1 && pr[0].w === 0 && pr[0].b === 10, "P3: 10 → 0 kg Hilfe zählt als Rekord");
  S.sessions.push({ id: "z2", date: T1, items: [{ ex: "assist_pull", reps: [10, 15], log: [{ w: "0", r: "10", done: true }] }] });
  const sr = series("assist_pull"); ok(sr.length === 2 && sr[1].w === 0, "P3: 0 kg bleibt im Verlauf sichtbar (series: " + sr.map((q) => q.w).join(" → ") + ")");
  ok(lastText({ ex: "assist_pull" }).includes("0 kg Hilfe"), "P3: „Letztes Mal“ zeigt 0 kg Hilfe");
  const it = prepItem({ g: "ruecken", e: 3, ex: "assist_pull", ideal: "assist_pull", sets: 3, reps: [10, 15] }, true); it.log.forEach((q) => (q.w = "0")); it.log[0].r = "3";
  S.active = { items: [it], steps: [{ k: "item", id: it.id }], pos: 0, ph: "sets", start: Date.now() }; setDone();
  ok(num(it.log[1].w) > 0 && S.active.msg.includes("mehr Hilfe"), "P3: 3 Wdh. bei 0 kg → nächster Satz mit mehr Hilfe (" + it.log[1].w + " kg)"); S.active = null;
  const e0 = estWeight({ ex: "assist_pull", reps: [10, 15], g: "ruecken" }); ok(e0 && e0.w === 0, "P3: Vorschlag übernimmt 0 kg Hilfe");
  S.sessions = [{ id: "n1", date: T0, items: [{ ex: "legpress", log: [{ w: "80", r: "10", done: true }] }] }];
  ok(!prsOf({ date: T1, items: [{ ex: "legpress", log: [{ w: "0", r: "10", done: true }] }] }).length && bestW(EXM.legpress, [0, null]) === null && prsOf({ date: T1, items: [{ ex: "legpress", log: [{ w: "90", r: "10", done: true }] }] }).length === 1, "P3: Normale Übungen: 0 kg ist kein Wert, mehr Gewicht bleibt Rekord");
  ok(bestW(EXM.assist_pull, [null, ""].map(num)) === null, "P3: Leere Eingabe ist nicht 0"); }
S.sessions = [];
// P4 Mini-Training: Zeitbudget
[[120, ["po", "quad"]], [30, ["po", "quad"]], [60, ["ruecken", "brust", "schulter", "po"]], [90, []]].forEach(([r, g]) => {
  S.restM = r; const m = buildMini(g); const t = miniTotal(g, m);
  ok(t <= MINI_BUDGET && m.length >= 3, \`P4: Mini mit \${fmtRest(r)} Pause, \${g.join("/") || "ohne Gruppen"}: \${m.length} Übungen, \${m[0].sets} Runden, ca. \${t} Min\`);
});
{ S.restM = 120; const sx = MINI_FILL.find((id) => EXM[id].side); ok(estMin([{ ex: sx, sets: 2 }], true) > estMin([{ ex: "bridge", sets: 2 }], true), "P4: Einseitige Übungen zählen je Seite (" + EXM[sx].n + ")"); }
{ S.restM = 120; const wk = thisWeek(); const sl = wk.slots.find((q) => q.type === "kraft"); U.setup = { slotId: sl.id, mode: "mini" }; const html = vSetup(); const items = setupItems(); const t = miniTotal(slotInfo(sl).groups, items);
  ok(!/[^.] 30 Min/.test(html.replace(/ca\\. 30 Min/g, "")) && html.includes(\`insgesamt ca. \${t} Min\`) && html.includes(\`Mini<small>ca. \${t} Min\`) && items.every((it) => html.includes(\`\${it.sets} × \${it.reps[0]}–\${it.reps[1]}\`)), "P4: Vorschau zeigt geschätzte Dauer (" + t + " Min) und dieselben Sätze wie der Plan"); U.setup = null; }
delete S.restM;
// P5 Progressionshinweis
const lat = (log, extra) => ({ id: "p" + Math.random(), date: T0, items: [Object.assign({ ex: "latzug", reps: [10, 15], sets: 3, log }, extra || {})] });
const w15 = () => [1, 2, 3].map(() => ({ w: "40", r: "15", done: true }));
S.sessions = [lat(w15())];
{ const it = prepItem({ g: "ruecken", e: 3, ex: "latzug", ideal: "latzug", sets: 3, reps: [10, 15] }, true);
  ok(it.prog && it.prog.w === 42.5 && it.log.every((q) => q.w === "40"), "P5: 3×15 bei 40 kg → Vorschlag 42,5 kg, Gewicht bleibt bis zur Zustimmung 40 kg");
  ok(progressHint(it).includes("42,5"), "P5: Hinweistext nennt das neue Gewicht"); }
S.sessions = [lat([{ w: "30", r: "10", done: true, warm: true }])]; ok(!progressInfo({ ex: "latzug" }), "P5: Nur Aufwärmsatz → kein Vorschlag");
S.sessions = [lat(w15().slice(0, 2))]; ok(!progressInfo({ ex: "latzug" }), "P5: 2 von 3 geplanten Sätzen → kein Vorschlag");
S.sessions = [lat(w15().map((q, i) => (i === 1 ? Object.assign(q, { w: "" }) : q)))]; ok(!progressInfo({ ex: "latzug" }), "P5: Satz ohne Gewicht → kein Vorschlag");
S.sessions = [lat(w15(), { part: true })]; ok(!progressInfo({ ex: "latzug" }), "P5: Abgebrochene (getauschte) Übung → kein Vorschlag");
S.sessions = [lat(w15().map((q, i) => (i === 2 ? Object.assign(q, { r: "12" }) : q)))]; ok(!progressInfo({ ex: "latzug" }), "P5: Oberes Ziel nicht in allen Sätzen → kein Vorschlag");
S.sessions = [{ id: "pa", date: T0, items: [{ ex: "assist_pull", reps: [6, 10], sets: 2, log: [{ w: "20", r: "10", done: true }, { w: "20", r: "11", done: true }] }] }];
{ const P = progressInfo({ ex: "assist_pull" }); ok(P && P.kind === "assist" && P.w === 17.5, "P5: Assistenz → weniger Hilfe vorgeschlagen (20 → " + (P && P.w) + " kg)"); }
S.sessions = [{ id: "pa0", date: T0, items: [{ ex: "assist_pull", reps: [6, 10], sets: 2, log: [{ w: "0", r: "10", done: true }, { w: "0", r: "10", done: true }] }] }];
{ const P = progressInfo({ ex: "assist_pull" }); ok(P && P.w == null && P.kind === "bw", "P5: Ohne Hilfe geschafft → Tempo/Wdh.-Hinweis statt negativer Hilfe"); }
S.sessions = [{ id: "pb", date: T0, items: [{ ex: "bridge", reps: [12, 20], sets: 3, log: [1, 2, 3].map(() => ({ w: "", r: "20", done: true })) }] }];
{ const P = progressInfo({ ex: "bridge" }); ok(P && P.kind === "bw" && P.w == null, "P5: Körpergewicht → langsamer/mehr Wdh., kein Gewicht"); }
S.sessions = [];
// ---- Version 3.9.1: Restpunkte aus dem Review zu 3.9 (Commit 360a305) ----
// Q1 Anstrengung (RPE) bleibt bei Prüfung, Neustart und Backup erhalten
{ const sx = (id, d, rpe) => Object.assign({ id, date: d, type: "kraft", name: "Tag", slotId: "s" + id, items: [{ g: "po", ex: "ht_m", reps: [10, 15], sets: 1, log: [{ w: "60", r: "12", done: true }] }] }, rpe === undefined ? {} : { rpe });
  const st0 = Object.assign(defaults(), { setup: true, days: tmplDays(3), sessions: [sx("r1", T0, 9), sx("r2", T1)] });
  const notes = []; normalizeState(st0, notes);
  ok(st0.sessions[0].rpe === 9 && !("rpe" in st0.sessions[1]) && !notes.length && st0.sessions[0].slotId === "sr1", "Q1: rpe = 9 bleibt nach normalizeState, fehlende Bewertung bleibt fehlend, kein Hinweis");
  const bad = Object.assign(defaults(), { sessions: [sx("r3", T0, 42), sx("r4", T0, "x"), sx("r5", T0, 7.5)] }); const n2 = []; normalizeState(bad, n2);
  ok(bad.sessions.length === 3 && bad.sessions.every((q) => !("rpe" in q)) && n2.some((t) => t.includes("Anstrengungsbewertungen")), "Q1: Ungültige Bewertungen (42, „x“, 7,5) werden entfernt und gemeldet, Einheiten bleiben");
  const st1 = JSON.parse(JSON.stringify(st0)); st1.sessions[0].extra = { keep: 1 }; st1.measures = [{ d: T0, gewicht: 70, notiz: "morgens" }];
  const re = JSON.parse(JSON.stringify(st1)); normalizeState(re, []);
  ok(re.sessions[0].rpe === 9 && re.sessions[0].extra.keep === 1 && re.measures[0].notiz === "morgens" && re.sessions[0].items[0].sets === 1, "Q1: Speichern + Neustart: rpe und übrige gültige Felder bleiben");
  S = Object.assign(defaults(), st0); registerCustom();
  const c = checkBackup(JSON.parse(backupText())); ok(c.ok && c.st.sessions[0].rpe === 9 && !c.notes.length, "Q1: Backup-Export und -Prüfung erhalten die Bewertung");
  /* Entlastung nach sehr harten Einheiten – auch nach Neustart (Daten durch normalizeState gelaufen) */
  const wkAgo = (w, d) => { const m = mondayOf(new Date()); m.setDate(m.getDate() - 7 * w + d); m.setHours(10); return m.toISOString(); };
  const hard = [sx("h1", wkAgo(2, 0), 9), sx("h2", wkAgo(2, 2), 9), sx("h3", wkAgo(1, 0), 10), sx("h4", wkAgo(1, 2), 9)];
  const st2 = JSON.parse(JSON.stringify(Object.assign(defaults(), { setup: true, days: tmplDays(3), sessions: hard }))); normalizeState(st2, []);
  S = st2; registerCustom(); normalizeDays(); const wkx = { slots: [] }; weekFlags(wkx, weekKey(new Date()));
  ok(wkx.deload === "rpe", "Q1: Entlastungswoche wegen hoher Anstrengung wird nach Neustart erkannt");
  S = Object.assign(defaults(), goodData()); registerCustom(); }
// Q2 Mini-Training: harte Grenze 30 Min für alle Kombinationen
{ S.restM = 120; const g = ["quad", "abd", "add"]; const m = buildMini(g); ok(miniTotal(g, m) <= 30, "Q2: Beispiel 2:00 Pause, quad/abd/add → " + miniTotal(g, m) + " Min (≤ 30)");
  const combos = [[]]; GORDER.forEach((a, i) => { combos.push([a]); GORDER.slice(i + 1).forEach((b, j) => { combos.push([a, b]); GORDER.slice(i + j + 2).forEach((c) => combos.push([a, b, c])); }); });
  let worst = 0, cnt = 0, fail = null;
  for (const back of [true, false]) for (const r of WARM_REST_OPTS) for (const day of Object.keys(DAYMOB)) for (const gg of combos) {
    S.backCare = back; S.restM = r; const mm = buildMini(gg, day); const t = miniTotal(gg, mm, day); cnt++; worst = Math.max(worst, t);
    if (t > MINI_BUDGET || !mm.length) fail = fail || \`\${gg.join("/")} · \${r}s · \${day} → \${t} Min\`; }
  ok(!fail, \`Q2: \${cnt} Kombinationen (Gruppen, alle Mini-Pausen, Tagesformen, Rücken an/aus): höchstens \${worst} Min\${fail ? " – zu lang: " + fail : ""}\`);
  S.backCare = true; delete S.restM; }
// ---- Version 4.0: Erfahrungen aus Ringzeit ----
const D = (s) => new Date(s + "T12:00:00");
S = Object.assign(defaults(), { setup: true, name: "Steffi", days: tmplDays(3) }); registerCustom();
// F1 Feste und Jahreszeiten
{ const has = (d, k) => feastsOn(D(d)).some((f) => f.k === k);
  ok(has("2027-03-28", "easter") && has("2027-03-29", "easter") && has("2027-02-08", "karneval") && has("2026-12-24", "christmas") && has("2026-10-31", "halloween") && has("2026-11-11", "martin") && has("2027-02-14", "valentine") && has("2027-03-08", "frauentag") && has("2026-12-31", "newyear") && has("2027-01-01", "newyear") && has("2026-12-06", "nikolaus"), "F1: Ostern, Karneval, Weihnachten, Halloween, St. Martin, Valentinstag, Frauentag, Silvester/Neujahr, Nikolaus");
  ok(feastsOn(D("2026-11-29")).some((f) => f.g === "Einen schönen 1. Advent!") && feastsOn(D("2026-12-20")).some((f) => f.g === "Einen schönen 4. Advent!") && !has("2026-11-30", "advent"), "F1: Adventssonntage 2026 (29.11. bis 20.12.)");
  ok(hanukkahDay(D("2026-12-05")) === 1 && hanukkahDay(D("2026-12-12")) === 8 && has("2027-02-20", "ramadan") && has("2026-11-08", "diwali"), "F1: Chanukka, Ramadan und Diwali aus dem Kalender des Handys (Intl)");
  ok(seasonNow(D("2026-12-05")).hat === "beanie" && seasonNow(D("2026-12-15")).hat === "santa", "F1: An Chanukka keine Weihnachtsmütze, sonst im Dezember schon");
  const se = (d) => seasonNow(D(d));
  ok(se("2027-01-20").cloth === "lang" && se("2027-01-20").hat === "beanie" && se("2027-04-20").cloth === "kurz" && !se("2027-04-20").hat && se("2027-07-15").cloth === "sommer" && se("2026-10-15").cloth === "lang" && se("2027-01-20").parts === "snow" && se("2026-10-15").parts === "leaves" && se("2027-04-20").parts === "petals", "F1: Kleidung, Mütze und Teilchen je Jahreszeit");
  let bad = ""; for (let i = 0; i < 400; i++) { const d = addDays(D("2026-11-01"), i); try { const s = seasonNow(d); s.fe.forEach((f) => { if (!f.g || !f.e) bad = dayKey(d); }); if (s.hat && !hatSVG(s.hat)) bad = dayKey(d) + " Mütze"; } catch (e) { bad = dayKey(d) + " " + e.message; } }
  ok(!bad, "F1: 400 Tage ohne Fehler, jeder Anlass mit Gruß und Motiv" + (bad ? " – " + bad : ""));
  U.seasonDate = "2026-12-24"; const h1 = vHome(); S.design = false; const h0 = vHome(); delete S.design; U.seasonDate = null;
  ok(h1.includes("Frohe Weihnachten") && h1.includes('class="deco snow"') && !h0.includes("Frohe Weihnachten") && !h0.includes("deco") && season() !== null, "F1: Startseite zeigt Gruß und Schnee; mit „Jahreszeiten & Feste“ aus nichts davon"); }
// F2 Geburtstag
{ S.body = { birth: "1980-11-04", year: 1980 };
  ok(isBirthday(D("2026-11-04")) && !isBirthday(D("2026-11-05")) && ageNow(D("2026-11-03")) === 45 && ageNow(D("2026-11-04")) === 46, "F2: Geburtstag erkannt, Alter taggenau (45 am Vortag, 46 am Geburtstag)");
  const s = seasonNow(D("2026-11-04")); ok(s.bday && s.hat === "party" && s.parts === "confetti" && s.fe[0].g.includes("Steffi"), "F2: Am Geburtstag Partyhut, Konfetti und persönlicher Gruß");
  U.seasonDate = "2026-11-04"; const hb = vHome(); U.seasonDate = null;
  ok(hb.includes("Alles Gute zum Geburtstag, Steffi") && hb.includes('data-a="confetti"') && (hb.match(/Alles Gute zum Geburtstag/g) || []).length === 1, "F2: Geburtstagskarte mit Konfetti-Knopf, Gruß nicht doppelt");
  S.body = { birth: "1984-02-29", year: 1984 }; ok(isBirthday(D("2027-02-28")) && !isBirthday(D("2028-02-28")) && isBirthday(D("2028-02-29")), "F2: 29. Februar wird in Nicht-Schaltjahren am 28. gefeiert");
  const st = Object.assign(defaults(), { body: { birth: "1980-11-04", year: 1980, height: 168 } }), n1 = []; normalizeState(st, n1);
  const st2 = Object.assign(defaults(), { body: { birth: "kaputt", year: 1980 } }), n2 = []; normalizeState(st2, n2);
  const st3 = Object.assign(defaults(), { body: { year: 1979, height: 170 } }), n3 = []; normalizeState(st3, n3);
  ok(st.body.birth === "1980-11-04" && st.body.height === 168 && !n1.length && !st2.body.birth && st2.body.year === 1980 && n2.some((t) => t.includes("Geburtstag")) && st3.body.year === 1979 && !st3.body.birth && !n3.length, "F2: Geburtstag bleibt bei der Prüfung erhalten, Ungültiges wird gemeldet, reines Geburtsjahr bleibt");
  S.body = { birth: "1980-11-04", year: 1980 }; S.sessions = [{ id: "b1", date: "2026-11-04T17:00:00.000Z", items: [] }];
  ok(BADGES.find((b) => b.id === "bday").t(), "F2: Abzeichen „Geburtstagstraining“"); S.sessions = []; S.body = {}; }
// F3 Anstrengung: „Zu viel“ macht die nächste Einheit leichter
{ S.sessions = [{ id: "r", date: new Date(Date.now() - 864e5).toISOString(), type: "kraft", items: [{ ex: "ht_m", log: [{ w: "40", r: "10", done: true }] }], rpe: 10 }]; S.weeks = {}; S.form = {};
  const a = loadFactor(); S.sessions[0].rpe = 7; const b = loadFactor();
  ok(a.f < b.f && a.why.some((t) => t.includes("zu viel")) && RPE_OPTS.every(([, l]) => /^\\S+ /.test(l)), "F3: Nach „Zu viel“ ist die nächste Einheit leichter; Anstrengung mit Gesichtern"); S.sessions = []; S.weeks = {}; }
// Q1 Jede Aktion hat einen Handler (Lehre aus dem ⓘ-Fehler in Ringzeit)
{ const acts = [...new Set([...js.matchAll(/data-a="([a-z0-9-]+)"/g)].map((m) => m[1]))]; const cases = new Set([...js.matchAll(/case "([a-z0-9-]+)":/g)].map((m) => m[1]).concat([...js.matchAll(/a === "([a-z0-9-]+)"/g)].map((m) => m[1])));
  const miss = acts.filter((a) => !cases.has(a)); ok(!miss.length, \`G1: Alle \${acts.length} Knopf-Aktionen haben einen Handler\${miss.length ? " – fehlt: " + miss.join(", ") : ""}\`); }
// Q2 Gesamtprüfung: jede Einheit aller Vorlagen bis zum Abschluss; was die App speichert, besteht die eigene Prüfung unverändert
{ gong = () => {}; say = () => {}; flash = () => {}; wakeLock = () => {}; audioSetup = () => {};
  let runs = 0, prob = []; const T0 = Date.now();
  for (const n of [2, 3, 4, 5]) for (const back of [true, false]) for (const mode of ["normal", "kurz", "mini"]) {
    S = Object.assign(defaults(), { setup: true, name: "Test", backCare: back, days: tmplDays(n) }); registerCustom(); U.seasonDate = null;
    for (const sl of thisWeek().slots.filter((q) => q.type === "kraft")) {
      U.setup = { slotId: sl.id, mode, busy: [] }; const plan = setupItems().filter((i) => i.ex); startTrain(); const A = S.active; let g = 0;
      while (S.active && g++ < 500) {
        if (S.active.ph === "end" || !curStep()) { finishSession(); break; }
        const st = curStep();
        if (st.k !== "item") { advance(); continue; }
        const it = itemById(st.id); it.confirmed = true; it.warmAsk = false; S.active.ph = "sets"; let h = 0;
        while (it.log.some((q) => !q.done) && h++ < 30) { const s = it.log.find((q) => !q.done); const x = EXM[it.ex]; if (!s.w && !isBW(x) && x.unit !== "s") s.w = "20"; s.r = String(it.reps[1]); setDone(); restEnd(); if (S.active.steps[S.active.pos] !== st) break; }
      }
      runs++; const ss = S.sessions[S.sessions.length - 1];
      if (S.active) prob.push(\`\${n}/\${mode}/\${back}: Einheit nicht beendet\`);
      else if (!ss || ss.slotId !== sl.id) prob.push(\`\${n}/\${mode}: nicht gespeichert\`);
      else { const work = ss.items.reduce((a, it) => a + it.log.filter((q) => !q.warm).length, 0), want = plan.reduce((a, it) => a + it.sets, 0);
        if (work !== want) prob.push(\`\${n}/\${mode}/\${back} \${sl.id}: \${work} statt \${want} Sätze\`);
        if (!(ss.dur >= 1) || ss.items.some((it) => it.log.some((q) => isNaN(num(q.r))))) prob.push(\`\${n}/\${mode}: ungültige Werte\`); }
    }
    for (const fl of ["pilates", "mobility"]) { startFlow({ id: "f" + fl, type: fl }); S.active.blocks.forEach((b) => (b.secDone = b.sec)); finishFlow(true); runs++; }
    S.sessions.forEach((x) => (x.rpe = 7));
    const before = JSON.parse(JSON.stringify(S)), c = JSON.parse(JSON.stringify(S)), nn = []; normalizeState(c, nn);
    if (nn.length) prob.push(\`\${n}/\${mode}: Prüfung meldet \${nn.join("; ")}\`);
    if (JSON.stringify(c.sessions) !== JSON.stringify(before.sessions)) { if (process.env.DBG) { const dd = (a, b, p = "") => { if (JSON.stringify(a) === JSON.stringify(b)) return; if (a && b && typeof a === "object" && typeof b === "object") new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => dd(a[k], b[k], p + "." + k)); else console.log("DIFF", p, JSON.stringify(a), "→", JSON.stringify(b)); }; dd(before.sessions, c.sessions); } } if (JSON.stringify(c.sessions) !== JSON.stringify(before.sessions)) prob.push(\`\${n}/\${mode}: Prüfung verändert gespeicherte Einheiten\`);
  }
  ok(!prob.length, \`G2: \${runs} Einheiten (2–5 Tage × Normal/Kurz/Mini × Rücken an/aus, dazu Pilates/Mobility) bis zum Abschluss gespielt, Sätze wie geplant, gespeicherte Daten bestehen die Prüfung unverändert (\${Date.now() - T0} ms)\${prob.length ? " – " + prob.slice(0, 3).join(" | ") : ""}\`); U.setup = null; }
// Q3 Altdaten: ein Stand im Format älterer Versionen verliert bei der Prüfung nichts
{ const old = { v: 1, setup: true, name: "Steffi", outfit: "lavendel", reps: "hoch", backCare: true, restC: 180, restI: 180, restMig: 1, restW: 60, restM: 45, sound: "schale", tick: "tick", accent: "petrol", theme: "dark", voice: false, zoom: true, music: "https://open.spotify.com/x",
    hair: { style: "dutt", color: "#8A5A3B" }, body: { year: 1980, height: 168 }, flags: { firstSet: true, backup: true, swap: true }, ack: "2026-10-01T10:00:00.000Z", newsSeen: "3.8", tourOffered: true, lastBackup: "2026-10-20T10:00:00.000Z",
    days: tmplDays(3), equip: Object.assign({}, defaults().equip, { hack: false }), limits: { knee: true }, notes: { ht_m: "Sitz Stufe 4" }, badges: { first: "2026-10-01T10:00:00.000Z" }, read: { mythen: true },
    form: { "2026-10-20": { sleep: 2, energy: 1 } }, eqLog: [{ e: "hipthrust", wd: 2, h: 18, b: 1 }], measures: [{ d: "2026-10-01T10:00:00.000Z", gewicht: 68.5, taille: 74 }],
    focus: { id: "po", start: "2026-10-01T10:00:00.000Z", base: { ht_m: 50 }, meas: null }, pauses: [{ why: "ill", from: "2026-09-01T10:00:00.000Z", to: "2026-09-05T10:00:00.000Z" }], pause: null, ramp: null,
    sessions: [
      { id: "o1", slotId: "s1", type: "kraft", name: "Po & Beine", groups: ["po", "quad"], date: "2026-10-01T17:00:00.000Z", dur: 61, warm: true, prs: 1, rpe: 9, items: [{ g: "po", ex: "ht_m", reps: [10, 15], note: "", log: [{ w: "30", r: "10", done: true, warm: true }, { w: "50", r: "12", done: true }, { w: "50", r: "11", done: true }] }] },
      { id: "o2", slotId: "s2", type: "mini", name: "Mini-Training", groups: ["po"], date: "2026-10-03T17:00:00.000Z", dur: 27, warm: true, prs: 0, items: [{ g: "po", ex: "bridge", reps: [15, 20], sets: 3, log: [{ w: "", r: "18", done: true }] }] },
      { id: "o3", slotId: "s3", type: "pilates", flow: true, name: "Pilates", groups: [], date: "2026-10-05T17:00:00.000Z", dur: 30, skipped: 1, items: [{ ex: FLOW.find((f) => f.cat === "pilates").id, side: "", sec: 55 }] },
    ], weeks: { "2026-W40": { slots: [{ id: "s1", type: "kraft", dayId: "x", wd: 3 }], checked: true, deload: "rpe", mood: "stress" } } };
  const c = JSON.parse(JSON.stringify(old)), nn = []; normalizeState(c, nn);
  const diff = Object.keys(old).filter((k) => JSON.stringify(old[k]) !== JSON.stringify(c[k])); if (process.env.DBG) { const dd = (a, b, p = "") => { if (JSON.stringify(a) === JSON.stringify(b)) return; if (a && b && typeof a === "object" && typeof b === "object") new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => dd(a[k], b[k], p + "." + k)); else console.log("DIFF3", p, JSON.stringify(a), "→", JSON.stringify(b)); }; dd(old.sessions, c.sessions); }
  ok(!nn.length && !diff.length, \`G3: Altdaten-Stand (\${Object.keys(old).length} Felder, 3 Einheiten) besteht die Prüfung ohne Verlust\${diff.length ? " – verändert: " + diff.join(", ") : ""}\${nn.length ? " – Hinweise: " + nn.join("; ") : ""}\`); }
// Q4 Service Worker räumt nur eigene Caches auf (Ringzeit liegt auf derselben Adresse)
{ const swp = require("path").join(require("path").dirname(file), "sw.js");
  if (fs.existsSync(swp)) { const sw = fs.readFileSync(swp, "utf8"); ok(/startsWith\\("selfcare-studio-"\\)/.test(sw) && !/ks\\.filter\\(\\(k\\) => k !== CACHE\\)/.test(sw), "G4: Update löscht nur eigene Caches, nicht die von Ringzeit"); } }
// Q5 „&“ in Namen bleibt erhalten; von 3.8–3.9.1 beschädigte Vorlagennamen werden repariert
{ const st = Object.assign(defaults(), { days: [{ id: "a", type: "kraft", name: "Po Beine", groups: ["po"] }, { id: "b", type: "kraft", name: "Po & Beinbeuger", groups: ["po"] }, { id: "c", type: "kraft", name: "Beine Po", groups: ["po"] }],
    sessions: [{ id: "s", date: "2026-10-01T10:00:00.000Z", type: "kraft", name: "Rücken Arme (kurz)", items: [{ ex: "ht_m", log: [{ w: "40", r: "10", done: true }] }] }] });
  const nn = []; normalizeState(st, nn); const keep = S; S = st; normalizeDays(nn); S = keep;
  ok(st.days.map((d) => d.name).join("|") === "Po & Beine|Po & Beinbeuger|Beine Po" && st.sessions[0].name === "Rücken & Arme (kurz)" && cleanTxt("<b>A & B</b>") === "bA & B/b", "G5: „Po & Beine“ bleibt, „Po Beine“ wird repariert, eigene Namen unverändert, HTML-Zeichen weiter entfernt"); }
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom();
// ---- Version 4.1: Erster Eindruck und Suche ----
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom();
{ const names = (q) => ALLX.filter((x) => !x.hidden && exMatch(x, q)).map((x) => x.id);
  const h = names("hip thrust"), r = names("ruecken kabel"), u = names("Rücken Kabel"), p0 = names("pilates"), z = names("zzzz");
  ok(h.length >= 4 && h.every((id) => /hip thrust/i.test(EXM[id].n)) && r.length > 0 && JSON.stringify(r) === JSON.stringify(u) && p0.some((id) => EXM[id].cat === "pilates") && !z.length && names("").length === ALLX.filter((x) => !x.hidden).length, \`S1: Suche findet Name, Muskel, Gerät, Art; „ruecken“ = „Rücken“ (\${r.length} Treffer); leere Suche zeigt alles\`);
  U.libq = "latzug"; const lh = libList(); U.libq = ""; ok(lh.includes("Latzug") && lh.includes("Treffer"), "S1: Übungsliste zeigt Treffer der Suche");
  S.days[0].mode = "custom"; S.days[0].custom = []; U.pick = { i: 0, f: "po", q: "latzug" }; const ph = pickList(); U.pick = null; S.days = tmplDays(3);
  ok(ph.includes("Latzug") && ph.includes("Treffer"), "S1: Planauswahl sucht in allen Muskelgruppen, auch wenn ein Filter gesetzt ist"); }
{ /* Einrichtung mitten in der Woche: nichts gilt als verpasst */
  S = Object.assign(defaults(), { setup: true, days: tmplDays(3).map((d, i) => Object.assign(d, { wd: i + 1 })) }); registerCustom(); S.weeks = {};
  const wk = thisWeek(); S.since = dayKey(addDays(mondayOf(new Date()), 6)); /* „eingerichtet am Sonntag“ */
  ok(!missedSlots().length, "E1: Vor dem Einrichtungstag gibt es keine verpassten Einheiten");
  delete S.since; const wdT = wdOf(new Date()); ok(wdT === 1 || missedSlots().length > 0 || wk.slots.every((q) => q.wd >= wdT), "E1: Ohne Einrichtungsdatum (bestehende Nutzerin) bleibt „verpasst“ wie bisher"); }
{ S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {}; S.sessions = []; S.form = {};
  const a = loadFactor(); S.sessions = [{ id: "x1", date: new Date(Date.now() - 3 * 864e5).toISOString(), items: [] }, { id: "x2", date: new Date(Date.now() - 864e5).toISOString(), items: [] }]; const b2 = loadFactor();
  ok(a.f < b2.f && a.why.some((t) => t.includes("Einstieg")) && !b2.why.some((t) => t.includes("Einstieg")), "E2: Die ersten zwei Krafteinheiten sind etwas leichter, danach normal");
  S.sessions = [{ id: "f1", date: new Date().toISOString(), type: "kraft", items: [{ ex: "ht_m", log: [{ w: "40", r: "12", done: true }] }] }];
  ok(isFirstKraft(S.sessions[0]) && !isFirstKraft({ id: "zz", flow: true }), "E2: Erstes Krafttraining wird erkannt (eigener Abschluss)");
  S.sessions = []; U.view = "welcome"; const w = vWelcome(); U.view = "home";
  ok(w.includes("Schön, dass du da bist") && w.includes('data-a="welcomego"') && w.includes('data-a="welcometour"') && w.includes("Sicherheit"), "E3: Willkommens-Moment mit Sicherheitshinweis, Tour freiwillig"); }
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom();
// ---- Version 4.2: Varianten, ruhige Phase, Atemübung, Animationen, Tipps, Ansicht ----
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom();
{ let bad = [];
  for (const cat of ["pilates", "mobility"]) for (const th of FLOW_THEMES[cat]) {
    th.ids.forEach((id) => { const f = FLOW.find((q) => q.id === id); if (!f || !f.anim || !f.tips || !f.tips.length) bad.push(cat + "/" + th.k + ": " + id); });
    for (const m of [15, 30]) { const b = buildFlow(cat, th.k, m); const t = flowMin(b); if (t < m - 4 || t > m + 2) bad.push(\`\${cat}/\${th.k}/\${m}: \${t} Min\`); } }
  ok(!bad.length, "V1: 8 Themen × 15/30 Min – alle Positionen mit Animation und Tipps, Dauer passt" + (bad.length ? " – " + bad.join(", ") : ""));
  ok(JSON.stringify(buildFlow("pilates")) === JSON.stringify(buildFlow("pilates", "klassik", 30)) && buildFlow("pilates").length === 24, "V1: Ohne Angabe bleibt Pilates wie bisher (Klassisch, 30 Min)");
  S.sessions = []; const n0 = nextTheme("mobility"); S.sessions.push({ id: "f", date: new Date().toISOString(), flow: true, type: "mobility", theme: "huefte", items: [{ ex: "m_child", sec: 40 }] });
  ok(n0 === "klassik" && nextTheme("mobility") === "schulter" && nextTheme("pilates") === "klassik", "V1: Themen wechseln sich ab (nach „Hüfte & Rücken“ kommt „Schultern & Nacken“)");
  const st = JSON.parse(JSON.stringify(S)), nn = []; normalizeState(st, nn); ok(st.sessions[0].theme === "huefte" && !nn.length, "V1: Thema bleibt beim Speichern erhalten");
  const wk = thisWeek(); const pl = { id: "pp", type: "pilates", wd: 0 }; wk.slots.push(pl); openFlowSheet(pl, "pilates"); const html = flowSheet(); closeSheet();
  ok(html.includes("Bauch &amp; Mitte") && html.includes('data-a="flowmin"') && html.includes("Positionen"), "V1: Auswahl mit Themen, 15/30 Min und Vorschau");
  startFlow(pl, "pilates", "mitte", 15); ok(S.active.theme === "mitte" && S.active.name.includes("Bauch") && flowMin(S.active.blocks) <= 17, "V1: Einheit startet mit gewähltem Thema und Dauer"); S.active = null; S.sessions = []; wk.slots.pop(); }
{ ["backext_m", "rot_m", "trx_row", "trx_press"].forEach((id) => ok(EXM[id] && !EXM[id].animSim && EXM[id].anim && EXM[id].anim.A && EXM[id].anim.B, \`V3: Eigene Animation für \${EXM[id].n}\`)); }
{ S.calm = { from: new Date(Date.now() - 864e5).toISOString() }; S.weeks = {}; const wk = thisWeek(); wk.slots.forEach((q) => (q.wd = 1));
  ok(calmNow() && !missedSlots().length && pausedWeeks().has(weekKey(new Date())), "V2: Ruhige Phase: nichts verpasst, Woche zählt für die Serie");
  const kr = wk.slots.find((q) => q.type === "kraft"); U.sheet = null; startSetup(kr.id); ok(U.flowSel && U.flowSel.cat === "mobility" && U.flowSel.theme === "abends" && U.flowSel.min === 15 && U.view !== "setup", "V2: Krafttag in der ruhigen Phase startet eine sanfte Einheit (Abends runterfahren, 15 Min)"); closeSheet();
  U.view = "home"; ok(vHome().includes("Sanft statt") && vHome().includes('data-a="breathe"'), "V2: Startseite zeigt die ruhige Phase mit Atemübung");
  const st = JSON.parse(JSON.stringify(S)); normalizeState(st, []); ok(st.calm && st.calm.from === S.calm.from, "V2: Ruhige Phase bleibt bei der Prüfung erhalten");
  S.calm = null; S.weeks = {}; }
{ U.breath = { min: 4, run: false }; const a = vBreathe(); U.breath = { min: 2, run: true, start: Date.now(), ph: "" }; const b2 = vBreathe(); U.breath = null;
  ok(a.includes("durchatmen") && a.includes('data-a="breathgo"') && b2.includes("Einatmen") && b2.includes('data-a="breathstop"'), "V2: Atemübung: Auswahl 2/4/6 Min und geführter Ablauf"); }
{ const readIds = new Set(READS.map((r) => r.id)); ok(TIPS.length >= 10 && TIPS.every(([t, d, r]) => t && d && (!r || readIds.has(r))), \`V4: \${TIPS.length} Tipps, Verweise führen zu vorhandenen Artikeln\`);
  S.simple = true; U.view = "home"; S.sessions = [{ id: "s", date: new Date().toISOString(), type: "kraft", items: [] }]; const hs = vHome(); U.hist = "list"; const hh = vHist(); S.simple = false; const hf = vHome(); const hh2 = vHist(); S.sessions = [];
  ok(!hs.includes("Wie wird deine Woche") && !hh.includes('data-t="load"') && hh2.includes('data-t="load"'), "V4: Einfache Ansicht blendet Wochenfrage und Belastung aus, ausführlich zeigt sie"); delete S.simple; }
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom();
// ---- Version 4.3.1: Prüfung der 4.3-Erweiterungen ----
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {}; U.weekOffset = 0;
{ thisWeek(); const n0 = Object.keys(S.weeks).length; U.weekOffset = 2; const v = viewedWeek(); render = render || (() => {});
  ok(Object.keys(S.weeks).length === n0 && v.slots.length === 3, "W1: Zukünftige Woche nur ansehen speichert nichts");
  S.days[0].wd = 6; const v2 = viewedWeek(); ok(v2.slots.find((q) => q.dayId === S.days[0].id).wd === 6, "W1: Angesehene zukünftige Woche folgt Änderungen am Trainingsplan");
  const w = calendarWeek(); ok(S.weeks[weekKey(viewedMonday())] === w, "W1: Eine Änderung legt die Woche fest");
  /* gelöschter Trainingstag in einer festgelegten zukünftigen Woche */
  const key = weekKey(new Date()); const keep = S.weeks[key]; S.weeks[key] = { slots: [{ id: "dead", type: "kraft", dayId: "gibtsnicht", wd: 2 }, { id: "ok", type: "kraft", dayId: S.days[1].id, wd: 3 }] };
  const tw = thisWeek(); ok(tw.slots.length === 1 && tw.slots[0].id === "ok", "W1: Einheit eines gelöschten Trainingstags verschwindet, wenn die Woche aktuell wird"); S.weeks[key] = keep; U.weekOffset = 0; }
{ S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {};
  let bad = []; for (const rest of [120, 180]) { S.restC = rest; S.restI = rest; for (const sl of thisWeek().slots.filter((q) => q.type === "kraft")) for (const m of [30, 45]) { U.setup = { slotId: sl.id, mode: "normal", busy: [], minutes: m }; const p = setupTimePlan(setupRawItems()); if (!p.over && p.items.length >= 2 && p.items.some((i) => i.sets < 2)) bad.push(\`\${rest}/\${m}: \${p.items.map((i) => i.sets).join(",")}\`); if (p.minutes > m) bad.push(\`\${m}: \${p.minutes} Min\`); } }
  ok(!bad.length, "W2: Zeitbudget 30/45 Min: lieber 2 Sätze an weniger Übungen als 1 Satz" + (bad.length ? " – " + bad.join(" | ") : ""));
  const sl = thisWeek().slots[0]; U.setup = { slotId: sl.id, mode: "normal", busy: [], minutes: 30 }; const w30 = warmSecs(buildWarm(slotInfo(sl).groups, "normal")); U.setup.minutes = 0; const w0 = warmSecs(buildWarm(slotInfo(sl).groups, "normal")); U.setup = null;
  ok(w30 < w0 && w30 <= 8 * 60, \`W2: Bei knappem Budget kürzeres Aufwärmen (\${Math.round(w30 / 60)} statt \${Math.round(w0 / 60)} Min)\`); }
{ ensureStudios(); ok(S.studios.length === 1 && studioPicker() === "", "W3: Mit einem Studio keine Studio-Auswahl auf Start, Vorbereitung und Verlauf");
  const h = addStudio("Zuhause", false); ok(studioPicker().includes("Zuhause"), "W3: Ab zwei Studios erscheint die Auswahl"); selectStudio(S.studios[0].id);
  ok(satzN(1) === "1 Satz" && satzN(3) === "3 Sätze", "W3: „1 Satz“ statt „1 Sätze“"); }
/* X1: abgewählte Geräte tauchen nirgends auf (Plan, Training, Ausweichübungen, Kurz/Mini, Zeitbudget) */
{ const probs = []; const _st = startTrain;
  for (const k of Object.keys(EQUIP).filter((k) => k !== "matte")) for (const nd of [2, 3, 4]) {
    S = Object.assign(defaults(), { setup: true, days: tmplDays(nd) }); registerCustom(); S.weeks = {}; ensureStudios(); S.equip[k] = false; syncStudio();
    const uses = (id) => { const x = EXM[id]; return !!(x && x.eq && x.eq.includes(k)); };
    for (const sl of thisWeek().slots.filter((q) => q.type === "kraft")) for (const mode of ["normal", "kurz", "mini"]) for (const minutes of [0, 30]) {
      U.setup = { slotId: sl.id, mode, busy: [], minutes }; setupItems().forEach((it) => { if (uses(it.ex)) probs.push(\`\${k} Plan \${it.ex}\`); });
      _st(); const A = S.active; A.steps.forEach((q) => { if (q.ex && uses(q.ex)) probs.push(\`\${k} Schritt \${q.ex}\`); });
      A.items.forEach((it) => { if (uses(it.ex)) probs.push(\`\${k} Training \${it.ex}\`); altsFor(it, [], new Set(A.items.map((q) => q.ex))).forEach((a) => { if (uses(a.id || a)) probs.push(\`\${k} Ausweich \${a.id || a}\`); }); });
      S.active = null; } }
  U.setup = null; ok(!probs.length, "X1: Abgewählte Geräte werden nie verwendet" + (probs.length ? " – " + [...new Set(probs)].slice(0, 5).join(" | ") : "")); }
/* X2: selbst gewählte Übungen eines Trainingstags werden genau so verwendet */
{ S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {}; ensureStudios();
  const pick = EX.filter((x) => !x.hidden && x.cat === "kraft" && x.eq.every((e) => S.equip[e] !== false)).slice(3, 6);
  S.days[0].mode = "custom"; S.days[0].custom = pick.map((x, i) => ({ ex: x.id, g: primary(x), sets: 2 + (i % 2), reps: [8 + i, 12 + i] })); save();
  const sl = thisWeek().slots.find((q) => q.dayId === S.days[0].id); U.setup = { slotId: sl.id, mode: "normal", busy: [], minutes: 0 };
  const it = setupItems(); ok(it.map((q) => q.ex).join() === pick.map((x) => x.id).join(), "X2: Eigene Übungen erscheinen vollständig und in gewählter Reihenfolge in der Vorbereitung");
  ok(it.every((q, i) => q.sets === S.days[0].custom[i].sets), "X2: Gewählte Satzzahl wird übernommen");
  startTrain(); ok(S.active.items.map((q) => q.ex).join() === pick.map((x) => x.id).join() && S.active.items.every((q, i) => q.log.length === S.days[0].custom[i].sets), "X2: Training läuft mit genau diesen Übungen und Sätzen");
  S.active = null; U.setup = null;
  S.days[0].custom = S.days[0].custom.slice(1); save(); U.setup = { slotId: sl.id, mode: "normal", busy: [], minutes: 0 };
  ok(setupItems().map((q) => q.ex).join() === pick.slice(1).map((x) => x.id).join(), "X2: Spätere Änderung der Übungsauswahl gilt sofort für die bereits angelegte Woche"); U.setup = null; }
/* X3: Trainingsplan nach der Einrichtung umgestellt → aktuelle und alle zukünftigen Wochen folgen */
{ S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {}; ensureStudios(); U.weekOffset = 0;
  const cur = weekKey(new Date()), today = wdOf(new Date());
  S.days.forEach((d, i) => { d.wd = [1, 3, 5][i]; }); save(); thisWeek();
  const fut = []; for (const o of [1, 3]) { U.weekOffset = o; fut.push(weekKey(viewedMonday())); calendarWeek(); } U.weekOffset = 0;
  const all = () => [cur, ...fut].map((k) => S.weeks[k]);
  ok(fut.every((k) => S.weeks[k]), "X3: Zwei zukünftige Wochen sind festgelegt");
  /* Wochentag ändern */
  const d1 = S.days[1]; d1.wd = 7; save();
  ok(all().every((W) => { const q = W.slots.find((x) => x.dayId === d1.id); return q && (q.wd === 7); }), "X3: Geänderter Wochentag gilt in aktueller und allen zukünftigen Wochen");
  /* Tag hinzufügen */
  const nd = Object.assign({}, S.days[0], { id: "neu", wd: 6, name: "Neu" }); S.days.push(nd); save();
  ok(all().every((W) => W.slots.filter((x) => x.dayId === "neu").length === 1), "X3: Neuer Trainingstag erscheint in aktueller und allen zukünftigen Wochen");
  /* Tag entfernen */
  const gone = S.days[2].id; S.days.splice(2, 1); save();
  ok(all().every((W) => !W.slots.some((x) => x.dayId === gone)), "X3: Gelöschter Trainingstag verschwindet aus aktueller und allen zukünftigen Wochen");
  ok(all().every((W) => W.slots.length === S.days.length), "X3: Jede Woche hat genau so viele Einheiten wie der Plan Tage");
  /* nie festgelegte Woche (Entwurf) folgt ebenfalls */
  U.weekOffset = 5; const v = viewedWeek(); ok(v.slots.length === S.days.length && v.slots.find((x) => x.dayId === d1.id).wd === 7, "X3: Noch nicht festgelegte Wochen folgen dem Plan ebenfalls"); U.weekOffset = 0;
  /* Schutz: erledigt, ausgelassen, von Hand verschoben */
  const W1 = S.weeks[fut[0]]; const sDone = W1.slots.find((x) => x.dayId === S.days[0].id), sMov = W1.slots.find((x) => x.dayId === d1.id);
  sMov.wd = 2; sMov.moved = true; S.sessions.push({ id: "done1", date: new Date().toISOString(), type: "kraft", slotId: sDone.id, items: [] });
  const sk = S.weeks[fut[1]].slots.find((x) => x.dayId === S.days[0].id); sk.skipped = true; save();
  S.days[0].wd = 4; d1.wd = 5; save();
  ok(sDone.wd === 1 && sMov.wd === 2 && sk.wd === 1, "X3: Erledigte, ausgelassene und von Hand verschobene Einheiten bleiben unverändert");
  S.days.splice(0, 1); save();
  ok(W1.slots.includes(sDone) && S.weeks[fut[1]].slots.includes(sk), "X3: Erledigte/ausgelassene Einheit eines gelöschten Tags bleibt in der Woche");
  S.sessions = S.sessions.filter((x) => x.id !== "done1");
  /* aktuelle Woche: Tag auf bereits vergangenen Wochentag gelegt → „offen“ statt verpasst */
  if (today > 1) { const q = S.weeks[cur].slots.find((x) => x.dayId === d1.id); delete q.moved; delete q.late; q.wd = 7; d1.wd = 1; save();
    ok(q.wd === 0 && q.late, "X3: In der aktuellen Woche wird ein Tag auf vergangenen Wochentag zu „offen“ (nicht verpasst)"); }
  else ok(true, "X3: (Montag – Vergangenheitsfall entfällt)");
  /* zusammengelegte Woche bekommt keine Tage zurück */
  const W2 = S.weeks[fut[1]]; W2.merged = true; S.days.push(Object.assign({}, nd, { id: "neu2" })); save();
  ok(!W2.slots.some((x) => x.dayId === "neu2") && S.weeks[cur].slots.some((x) => x.dayId === "neu2"), "X3: Zusammengelegte Woche bleibt zusammengelegt, andere Wochen bekommen den neuen Tag");
  /* vergangene Wochen bleiben, wie sie waren */
  const past = weekKey(new Date(Date.now() - 14 * 864e5)); S.weeks[past] = { daysSig: "alt", slots: [{ id: "p", type: "kraft", dayId: "weg", wd: 2 }] }; S.days[0].wd = 3; save();
  ok(S.weeks[past].slots.length === 1 && S.weeks[past].slots[0].dayId === "weg", "X3: Vergangene Wochen werden nicht umgeschrieben");
  /* ältere Wochen ohne Kennung: abweichende Tage gelten als verschoben, nichts geht verloren */
  const old = { slots: S.days.map((d) => ({ id: uid(), type: "kraft", dayId: d.id, wd: d.wd })) }; old.slots[0].wd = 6; S.weeks[fut[0]] = old; save();
  ok(old.daysSig && old.slots[0].moved && old.slots[0].wd === 6 && old.slots.length === S.days.length, "X3: Wochen aus älteren Versionen behalten ihre Verschiebungen");
  U.weekOffset = 0; }
/* Y1: neue Themen Balance & Beckenboden (4.4) */
{ const th = [flowTheme("mobility", "balance"), flowTheme("pilates", "beckenboden")];
  ok(th[0].k === "balance" && th[1].k === "beckenboden", "Y1: Themen „Balance & Füße“ und „Beckenboden & Mitte“ vorhanden");
  ok(th.every((t) => t.ids.every((id) => FLOW.some((f) => f.id === id))), "Y1: Alle Positionen der neuen Themen existieren");
  ok(["m_shift", "m_rock", "m_tandem", "m_oneleg", "m_clock", "m_stork", "p_pfbreath", "p_pfquick", "p_pfbridge", "p_pfsit"].every((id) => { const f = FLOW.find((x) => x.id === id); return f && f.anim && f.anim.A && f.tips.length >= 2 && EXM[id]; }), "Y1: Neue Positionen mit Animation, Tipps und im Übungsverzeichnis");
  let good = true; for (const [cat, k] of [["mobility", "balance"], ["pilates", "beckenboden"]]) for (const m of [15, 30]) { const b = buildFlow(cat, k, m); const tot = b.reduce((a, x) => a + x.sec + 15, 0); if (!b.length || tot > (m + 2) * 60 || tot < (m - 6) * 60) good = false; }
  ok(good, "Y1: Neue Themen ergeben passende 15- und 30-Minuten-Einheiten");
  ok(READS.some((r) => r.id === "beckenboden") && READS.some((r) => r.id === "balance") && TIPS.every((t) => !t[2] || READS.some((r) => r.id === t[2])), "Y1: Artikel Beckenboden und Gleichgewicht, alle Tipps verweisen auf vorhandene Artikel"); }
/* Y2: Jahresrückblick */
{ S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {}; ensureStudios(); const st = S.studios[0].id;
  const ks = (d, w, extra) => Object.assign({ id: uid(), date: d.toISOString(), type: "kraft", name: "K", dur: 50, studioId: st, items: [{ g: "quad", ex: "legpress", reps: [10, 15], sets: 3, log: [{ w: "20", r: "10", done: true, warm: true }, { w: String(w), r: "12", done: true }, { w: String(w), r: "12", done: true }] }] }, extra || {});
  S.sessions = [ks(new Date(2025, 11, 20, 18), 99), ks(new Date(2026, 0, 5, 18), 40), ks(new Date(2026, 0, 7, 18), 45, { prs: 1 }), ks(new Date(2026, 0, 12, 18), 50), ks(new Date(2026, 0, 14, 18), 50), ks(new Date(2026, 2, 3, 18), 60),
    { id: uid(), date: new Date(2026, 2, 4, 9).toISOString(), type: "pilates", flow: true, theme: "beckenboden", dur: 30, items: [{ ex: "p_pfbreath", sec: 60 }] }];
  const r = yearReview(2026);
  ok(r.units === 6 && r.minutes === 280 && r.days === 6, "Y2: Nur Einheiten des Jahres zählen (6 Einheiten, 280 Min)");
  ok(r.sets === 10 && r.kg === (40 + 45 + 50 + 50 + 60) * 2 * 12 + 5 * 200, "Y2: Sätze ohne Aufwärmsätze; bewegte Last wie die Gesamtlast der App mit Aufwärmsätzen");
  ok(r.months[0] === 4 && r.months[2] === 2 && r.topM === 0, "Y2: Einheiten je Monat und aktivster Monat");
  ok(r.fav && r.fav.ex === "legpress" && r.fav.sets === 10, "Y2: Lieblingsübung nach Arbeitssätzen");
  ok(r.gain && r.gain.first === 40 && r.gain.best === 60 && Math.round(r.gain.rel * 100) === 50, "Y2: Größte Steigerung: erstes gegen bestes Gewicht im Jahr (40 → 60 kg)");
  ok(r.streak === 2 && r.prs === 1 && r.types.kraft === 5 && r.types.pilates === 1, "Y2: Beste Serie (2 Wochen mit je 2 Einheiten), Rekorde, Trainingsarten");
  ok(yearSheet(2026).includes("10 Sätze insgesamt") && yearSheet(2030).includes("noch keine Einheit"), "Y2: Rückblick zeigt Sätze; leeres Jahr ohne Fehler");
  S.sessions = [ks(new Date(2026, 0, 5, 18), 20)]; ok(!yearSheet(2026).includes("Tonnen"), "Y2: Unter einer Tonne keine Tonnen-Karte");
  S.sessions.push(...Array.from({ length: 30 }, (_, i) => ks(new Date(2026, 4, 1 + i, 18), 70))); ok(yearSheet(2026).includes("Tonnen"), "Y2: Ab einer Tonne wird die bewegte Last in Tonnen gezeigt"); }
/* Y3: Wann erscheint die Karte? */
{ ok(yearDue(new Date(2026, 11, 3)) === 2026 && yearDue(new Date(2027, 0, 10)) === 2026 && yearDue(new Date(2027, 0, 20)) === 0 && yearDue(new Date(2026, 5, 1)) === 0, "Y3: Startseite ab 1. Dezember, im Januar bis zum 15. für das Vorjahr");
  const y = yearDue(); if (y) { S.flags["year" + y] = 1; ok(yearCard() === "", "Y3: Nach dem Ansehen oder „Später“ verschwindet die Karte"); delete S.flags["year" + y]; } else ok(yearCard() === "", "Y3: Außerhalb von Dezember/Januar keine Karte");
  ok(yearYears()[0] === 2026 && yearLink().includes('data-y="2026"'), "Y3: Unter Verlauf → Rückblick jederzeit erreichbar"); }
/* Y4: Ton beim Pausenstart */
{ const _p = playSnd; let n0 = 0; playSnd = () => { n0++; };
  S.restTone = undefined; S.sound = "gong"; restTone(); const a = n0; S.restTone = false; restTone(); const b = n0; S.restTone = true; S.sound = "aus"; restTone(); const c = n0;
  playSnd = _p; S.sound = "gong"; delete S.restTone;
  ok(a === 1 && b === 1 && c === 1, "Y4: Ton beim Pausenstart standardmäßig an, abschaltbar, still bei Signalton „aus“"); }
S = Object.assign(defaults(), { setup: true, days: tmplDays(3) }); registerCustom(); S.weeks = {}; U.setup = null;
console.log(n - fails + " von " + n + " Tests bestanden"); if (fails) process.exitCode = 1;
`);
