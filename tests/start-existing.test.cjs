/* Start mit vorhandenen Daten aus 4.3.1: darf nicht abstürzen (4.3.2-Fehler: Wochenabgleich beim Speichern während des Starts). */
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require(process.env.SELFCARE_JSDOM_MODULE || 'jsdom');
const stored = fs.readFileSync(path.join(__dirname, 'fixture-4.3.1.json'), 'utf8').trim();
const errors = []; const vc = new VirtualConsole(); vc.on('jsdomError', (e) => errors.push(e.message)); vc.on('error', (e) => errors.push(String(e)));
const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), { url: 'https://dnsmaur1992.github.io/Selfcare-Studio/', runScripts: 'dangerously', virtualConsole: vc, beforeParse(w) {
  w.localStorage.setItem('satzwerk.v1', stored);
  w.scrollTo = () => {}; w.matchMedia = () => ({ matches: false, addEventListener() {} }); w.requestAnimationFrame = () => 1; w.setInterval = () => 1; w.setTimeout = () => 1; w.MutationObserver = class { observe() {} };
  w.Audio = class { setAttribute() {} play() { return Promise.resolve(); } pause() {} }; w.SpeechSynthesisUtterance = class {}; w.speechSynthesis = { cancel() {}, speak() {} }; } });
const w = dom.window, ev = (s) => w.eval(s);
let n = 0, fails = 0; const ok = (c, m) => { n++; if (!c) { fails++; console.log('✗ ' + m); } else console.log('✓ ' + m); };
ok(!errors.length, 'Start mit vorhandenen Daten ohne Fehler' + (errors.length ? ' – ' + errors[0] : ''));
ok(ev('S.setup && S.name') === 'Test', 'Gespeicherte Einrichtung bleibt erhalten');
ok(ev('S.sessions.length') === 1, 'Gespeicherte Einheiten bleiben erhalten');
ok(w.document.getElementById('app').textContent.includes('Test'), 'Startseite wird angezeigt');
ok(ev('Object.keys(S.weeks).filter((k) => k >= weekKey(new Date())).every((k) => S.weeks[k].daysSig === daysSig())'), 'Aktuelle und festgelegte zukünftige Wochen sind danach abgeglichen');
ok(JSON.parse(w.localStorage.getItem('satzwerk.v1')).sessions.length === 1, 'Gespeicherte Daten nach dem Start unverändert vorhanden');
console.log(`${n - fails} von ${n} Start-Tests bestanden`); if (fails) process.exitCode = 1;
