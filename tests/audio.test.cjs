// Audio routing regression tests; external music behaviour still needs a real iPhone.
// Run: node tests/audio.test.cjs index.html
const fs = require('fs');
const file = process.argv[2] || 'index.html';
const harness = fs.readFileSync(require('path').join(__dirname, 'logik.test.cjs'), 'utf8').split('let fails')[0].replace('global.document =', 'global.audioEvents = {}; global.document =').replace('getElementById: () => el(), addEventListener() {}', 'getElementById: () => el(), addEventListener(k, f) { (global.audioEvents[k] ||= []).push(f); }');
const checks = String.raw`
(async () => {
  const assert = require('node:assert/strict');
  render = () => {}; renderSheet = () => {}; flash = () => {};
  const output = [], modes = [];
  navigator.audioSession = { type: 'auto' };
  global.Audio = class {
    constructor(src) { this.src = src; this.currentTime = 0; }
    setAttribute() {}
    play() { output.push({ type: navigator.audioSession.type, muted: !!this.muted }); return Promise.resolve(); }
    pause() {}
  };
  global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  global.speechSynthesis = window.speechSynthesis = { cancel() {}, speak(u) { modes.push({ type: navigator.audioSession.type, text: u.text }); } };
  const contextModes = [];
  window.AudioContext = class {
    constructor() { contextModes.push(navigator.audioSession.type); this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    createOscillator() { return { frequency: {}, connect() {}, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
  };
  S = defaults(); S.voice = false;
  unlockAudio();
  assert.equal(navigator.audioSession.type, 'ambient');
  assert.equal(modes.length, 0, 'Disabled speech must not prime speech synthesis');
  await Promise.resolve();
  for (const k of Object.keys(SOUNDS).filter(k => k !== 'aus').concat(['beep', 'low', 'tick'])) {
    navigator.audioSession.type = 'auto'; playSnd(k, 660);
    assert.equal(output.at(-1).type, 'ambient', 'Every signal must restore mixing before play');
  }
  assert(contextModes.every(m => m === 'ambient'), 'WebAudio must be created after routing');
  navigator.audioSession.type = 'auto'; synth(660); assert.equal(navigator.audioSession.type, 'ambient');
  S.voice = true; navigator.audioSession.type = 'auto'; say('Pause vorbei');
  assert.equal(modes.at(-1).type, 'ambient');
  U.psec = 'ton';
  assert(vProf().includes('aria-label="Musik weiterlaufen lassen"'), 'Profile must show the music switch');
  const button = { dataset: { a: 'audiomode' }, closest() { return this; } };
  const clickMode = () => { for (const f of global.audioEvents.click || []) f({ target: button }); };
  clickMode(); assert.equal(S.mixMusic, false); assert.equal(navigator.audioSession.type, 'auto');
  clickMode(); assert.equal(S.mixMusic, true); assert.equal(navigator.audioSession.type, 'ambient');
  S.mixMusic = false; applyAudioMode(); assert.equal(navigator.audioSession.type, 'auto');
  gong(); assert.equal(output.at(-1).type, 'auto');
  S.mixMusic = true; navigator.audioSession.type = 'auto'; unlockAudio();
  assert.equal(navigator.audioSession.type, 'ambient', 'Already unlocked audio must still reapply routing');
  S.sound = 'aus'; const n = output.length; gong(); assert.equal(output.length, n);
  delete navigator.audioSession; assert.doesNotThrow(() => { applyAudioMode(); primeAudio(); say('Test'); });
  navigator.audioSession = { get type() { return 'auto'; }, set type(v) { throw Error('unsupported'); } };
  assert.doesNotThrow(applyAudioMode);
  S.mixMusic = false; const candidate = JSON.parse(JSON.stringify(S)); normalizeState(candidate, []);
  assert.equal(candidate.mixMusic, false, 'Backup/start normalization must preserve explicit interruption mode');
  console.log('Audio regression tests passed: routing, all signals, speech, mute, fallback and saved preference.');
})().catch(e => { console.error(e); process.exitCode = 1; });
`;
eval(harness + '\neval(js.replace(/\\napplyTheme\\(\\);\\nrender\\(\\);[\\s\\S]*$/, "") + ' + JSON.stringify(checks) + ');');
