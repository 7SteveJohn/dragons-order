// Tiny WebAudio synth: all sounds are generated, no audio files.
export function createAudio() {
  let ctx = null;
  let muted = false;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type = 'sine', vol = 0.12, when = 0, slideTo = null) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  return {
    get muted() { return muted; },
    toggleMute() { muted = !muted; return muted; },
    unlock() { ensure(); },
    click() { tone(660, 0.07, 'triangle', 0.08); },
    pop() { tone(520, 0.08, 'sine', 0.1, 0, 880); },
    sizzle() { tone(1800, 0.25, 'sawtooth', 0.02, 0, 900); },
    wrong() { tone(220, 0.22, 'square', 0.06, 0, 140); },
    ding() { tone(880, 0.12, 'sine', 0.1); tone(1320, 0.18, 'sine', 0.08, 0.09); },
    serve() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.09, i * 0.07));
    },
    fail() { [392, 330, 262].forEach((f, i) => tone(f, 0.22, 'triangle', 0.08, i * 0.12)); },
    win() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, i * 0.1));
    },
  };
}
