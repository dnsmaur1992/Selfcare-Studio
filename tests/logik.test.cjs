// Prüft die Trainingslogik ohne Browser. Aufruf im Repo-Hauptordner:  node tests/logik.test.cjs index.html
const fs = require("fs");
const file = process.argv[2] || "index.html";
const html = fs.readFileSync(file, "utf8");
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).sort((a, b) => b.length - a.length)[0];
const el = () => ({ addEventListener() {}, innerHTML: "", querySelectorAll: () => [], insertAdjacentHTML() {}, appendChild() {}, style: { setProperty() {}, removeProperty() {} }, dataset: {}, getAttribute: () => null, setAttribute() {}, removeAttribute() {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, remove() {}, scrollTo() {} });
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
console.log(n - fails + " von " + n + " Tests bestanden"); if (fails) process.exitCode = 1;
`);
