// DRAGON'S ORDER — bootstrap, input, game loop.
import { createWorld, startGame, step, addToStove, clickPan, serveOrder, removeFromPlate, plateReady, INGREDIENTS } from './world.js';
import { drawWorld, hitAt, W, H } from './render.js';
import { stageShot } from './shots.js';
import { createAudio } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const audio = createAudio();

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 7);

let world;
if (shotName) {
  world = stageShot(shotName, seed);
  resize();
  drawWorld(ctx, world);
  // Frozen frame: a screenshot captures exactly this state.
} else {
  world = createWorld();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    world.time += dt;
    step(world, dt);
    resize();
    drawWorld(ctx, world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  const w = Math.floor(W * scale);
  const h = Math.floor(H * scale);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(w / W, 0, 0, h / H, 0, 0);
}

function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * W,
    y: ((e.clientY - r.top) / r.height) * H,
  };
}

function announce(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function handleAction(hit) {
  if (!hit) return;
  audio.unlock();
  if (hit.kind === 'mute') {
    world.muted = audio.toggleMute();
    return;
  }
  if (world.screen === 'title') {
    audio.click();
    startGame(world);
    announce('Game started. Cook the dragons’ orders!');
    return;
  }
  if (world.screen === 'win' || world.screen === 'lose') {
    audio.click();
    startGame(world);
    return;
  }
  if (world.paused) return;
  if (hit.kind === 'bin') {
    if (addToStove(world, hit.id)) { audio.pop(); audio.sizzle(); }
    else audio.wrong();
  } else if (hit.kind === 'pan') {
    const res = clickPan(world, hit.index);
    if (res === 'ok') audio.pop();
    else if (res === 'wrong') audio.wrong();
    else if (res === 'burnt') audio.wrong();
    else if (res === 'cooking') audio.click();
    if (plateReady(world)) audio.ding();
  } else if (hit.kind === 'plate-item') {
    removeFromPlate(world, hit.index);
    audio.click();
  } else if (hit.kind === 'serve') {
    if (serveOrder(world)) {
      if (world.screen === 'win') audio.win();
      else audio.serve();
      announce(`Served! Score ${world.score}.`);
    } else {
      audio.wrong();
    }
  }
}

canvas.addEventListener('pointerdown', (e) => {
  const p = toLogical(e);
  handleAction(hitAt(world, p.x, p.y));
});

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (k === 'm') {
    world.muted = audio.toggleMute();
    return;
  }
  if (world.screen === 'title' && (k === 'enter' || k === ' ')) {
    audio.unlock();
    startGame(world);
    return;
  }
  if ((world.screen === 'win' || world.screen === 'lose') && k === 'r') {
    startGame(world);
    return;
  }
  if (world.screen !== 'play') return;
  if (k === 'p' || k === 'escape') {
    world.paused = !world.paused;
    return;
  }
  if (world.paused) return;
  if (k === ' ') {
    e.preventDefault();
    if (serveOrder(world)) {
      if (world.screen === 'win') audio.win();
      else audio.serve();
    } else audio.wrong();
    return;
  }
  if (k === 'r') { startGame(world); return; }
  const ing = INGREDIENTS.find((i) => i.key === k);
  if (ing) {
    audio.unlock();
    if (addToStove(world, ing.id)) { audio.pop(); audio.sizzle(); }
    else audio.wrong();
  }
});

window.addEventListener('resize', resize);
resize();

// Debug/test handle: lets a real browser session drive the game and read state.
window.__dragons = world;
