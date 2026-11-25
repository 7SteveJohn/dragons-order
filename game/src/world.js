// DRAGON'S ORDER — game rules. Pure state + step/actions; rendering lives in render.js.
import { createRandom } from './random.js';

export const INGREDIENTS = [
  { id: 'steak', name: 'Ember Steak', short: 'Steak', color: '#b4552d', dark: '#7e3418', cook: 4.5, key: '1' },
  { id: 'mushroom', name: 'Moon Mushroom', short: 'Mushroom', color: '#d8cdb4', dark: '#8a7a5c', cook: 3.0, key: '2' },
  { id: 'berry', name: 'Frost Berry', short: 'Berry', color: '#5b8fe0', dark: '#2f56a8', cook: 2.5, key: '3' },
  { id: 'egg', name: 'Golden Egg', short: 'Egg', color: '#f2c94c', dark: '#c99a1e', cook: 3.5, key: '4' },
  { id: 'pepper', name: 'Dragon Pepper', short: 'Pepper', color: '#d9382b', dark: '#96201a', cook: 3.0, key: '5' },
  { id: 'herb', name: 'Sky Herb', short: 'Herb', color: '#58b368', dark: '#2f7a3e', cook: 2.0, key: '6' },
  { id: 'fish', name: 'Starfish', short: 'Fish', color: '#e08bb0', dark: '#a85478', cook: 4.0, key: '7' },
  { id: 'bread', name: 'Hearth Bread', short: 'Bread', color: '#d99a4e', dark: '#9a6524', cook: 2.5, key: '8' },
];

export const DISHES = [
  { name: 'Ember Steak', recipe: ['steak', 'pepper', 'herb'], price: 100, blurb: 'Seared steak, dragon pepper, sky herb.' },
  { name: 'Frost Berry Salad', recipe: ['berry', 'herb', 'mushroom'], price: 100, blurb: 'Chilled berries over moon mushrooms.' },
  { name: 'Golden Omelette', recipe: ['egg', 'herb', 'mushroom'], price: 100, blurb: 'Fluffy gold, folded with herbs.' },
  { name: 'Pepper Stir-Fry', recipe: ['pepper', 'mushroom', 'steak'], price: 110, blurb: 'A fiery wok toss for brave dragons.' },
  { name: 'Starlight Soup', recipe: ['fish', 'herb', 'berry'], price: 110, blurb: 'A sparkling broth from the deep.' },
  { name: 'Tavern Feast', recipe: ['steak', 'bread', 'egg', 'fish'], price: 160, blurb: 'The whole hearth on one plate.' },
];

export const DRAGONS = [
  { name: 'Ember', color: '#e0523d', dark: '#8f2a1c', belly: '#f7c873' },
  { name: 'Frostbite', color: '#6fb3e8', dark: '#2f6da8', belly: '#d8ecff' },
  { name: 'Mossback', color: '#69b36a', dark: '#357a3c', belly: '#d9f2c0' },
  { name: 'Stormwing', color: '#9a6fd0', dark: '#5f3a8f', belly: '#e3d3f7' },
  { name: 'Aurelia', color: '#e8b93e', dark: '#a67c14', belly: '#ffedb0' },
];

export const WIN_SERVES = 10;
export const MAX_STRIKES = 3;

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id);
}

export function createWorld(seed = 20261125) {
  const rng = createRandom(seed);
  const world = {
    rng,
    screen: 'title', // title | play | win | lose
    time: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    strikes: 0,
    orders: [],
    pans: [null, null, null],
    plate: [],
    lastServed: null, // { dish, score, dragon }
    fx: [], // {x,y,text,color,t,life}
    puffs: [], // steam puffs {x,y,t,life}
    message: '',
    messageT: 0,
    shake: 0,
    flash: null, // {color,t}
    muted: false,
    paused: false,
    nextOrderId: 1,
    spawnT: 0,
    overReason: '',
    startedAt: 0,
  };
  return world;
}

function patienceFor(world) {
  // Orders get less patient as the shift goes on.
  return Math.max(28, 46 - world.served * 1.6);
}

function pickDish(world, avoidName) {
  const late = world.served >= 5;
  const pool = DISHES.filter((d) => d.name !== avoidName && (late || d.recipe.length === 3));
  return world.rng.pick(pool.length ? pool : DISHES);
}

export function spawnOrder(world) {
  const dragon = world.rng.pick(DRAGONS);
  const lastDish = world.orders.length ? world.orders[world.orders.length - 1].dish.name : null;
  const dish = pickDish(world, lastDish);
  const patience = patienceFor(world);
  world.orders.push({
    id: world.nextOrderId++,
    dragon,
    dish,
    patience,
    patienceMax: patience,
    state: 'waiting',
  });
}

export function startGame(world) {
  world.screen = 'play';
  world.time = 0;
  world.score = 0;
  world.combo = 0;
  world.bestCombo = 0;
  world.served = 0;
  world.strikes = 0;
  world.orders = [];
  world.pans = [null, null, null];
  world.plate = [];
  world.lastServed = null;
  world.fx = [];
  world.puffs = [];
  world.message = '';
  world.nextOrderId = 1;
  world.spawnT = 0;
  world.overReason = '';
  for (let i = 0; i < 3; i++) spawnOrder(world);
}

export function currentOrder(world) {
  return world.orders[0] || null;
}

function plateMatches(world) {
  const order = currentOrder(world);
  if (!order) return false;
  if (world.plate.length !== order.dish.recipe.length) return false;
  const have = [...world.plate].sort();
  const want = [...order.dish.recipe].sort();
  return have.every((v, i) => v === want[i]);
}

export function plateReady(world) {
  return world.screen === 'play' && plateMatches(world);
}

function addFx(world, x, y, text, color) {
  world.fx.push({ x, y, text, color, t: 0, life: 1.4 });
}

function setMessage(world, text) {
  world.message = text;
  world.messageT = 2.2;
}

export function addToStove(world, ingId) {
  if (world.screen !== 'play' || world.paused) return false;
  const free = world.pans.findIndex((p) => p === null);
  if (free === -1) { setMessage(world, 'All pans are full!'); return false; }
  const ing = ingredientById(ingId);
  world.pans[free] = { ing, t: 0, cookTime: ing.cook };
  return true;
}

export function clickPan(world, index) {
  if (world.screen !== 'play' || world.paused) return 'none';
  const pan = world.pans[index];
  if (!pan) return 'none';
  if (pan.t >= pan.cookTime + 4) {
    // Burnt: toss it.
    world.pans[index] = null;
    addFx(world, 640, 300, 'Burnt! Tossed.', '#ff9a7a');
    setMessage(world, 'Burnt — tossed it. Watch the pans!');
    return 'burnt';
  }
  if (pan.t < pan.cookTime) {
    setMessage(world, 'Still cooking… wait for the golden glow!');
    return 'cooking';
  }
  // Cooked: move to the plate.
  world.pans[index] = null;
  return addToPlate(world, pan.ing.id);
}

export function addToPlate(world, ingId) {
  const order = currentOrder(world);
  if (!order) return 'none';
  const ing = ingredientById(ingId);
  const want = [...order.dish.recipe];
  const have = [...world.plate];
  const idx = want.indexOf(ingId);
  const already = have.filter((x) => x === ingId).length;
  const wanted = want.filter((x) => x === ingId).length;
  if (idx === -1 || already >= wanted) {
    // Wrong ingredient for this order.
    order.patience = Math.max(0, order.patience - 3);
    world.combo = 0;
    world.shake = 0.35;
    world.flash = { color: 'rgba(220,60,40,0.25)', t: 0.4 };
    addFx(world, 640, 430, `${ing.short} doesn't belong! −3s`, '#ff8a70');
    setMessage(world, `${order.dragon.name} shakes its head — wrong ingredient!`);
    return 'wrong';
  }
  world.plate.push(ingId);
  if (plateMatches(world)) {
    addFx(world, 640, 380, 'READY TO SERVE!', '#ffd94d');
  }
  return 'ok';
}

export function removeFromPlate(world, index) {
  if (index < 0 || index >= world.plate.length) return;
  world.plate.splice(index, 1);
}

export function serveOrder(world) {
  if (!plateReady(world)) return false;
  const order = currentOrder(world);
  const timeBonus = Math.round((order.patience / order.patienceMax) * 50);
  const comboBonus = world.combo * 10;
  const gained = order.dish.price + timeBonus + comboBonus;
  world.score += gained;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  world.lastServed = { dish: order.dish.name, score: gained, dragon: order.dragon.name };
  addFx(world, 640, 360, `+${gained}  ${order.dish.name} served!`, '#ffd94d');
  world.orders.shift();
  world.plate = [];
  world.spawnT = 0.9;
  if (world.served >= WIN_SERVES) {
    world.screen = 'win';
    world.overReason = `Served ${WIN_SERVES} orders — the dragons feast!`;
    return true;
  }
  return true;
}

function loseOrder(world, order) {
  world.orders = world.orders.filter((o) => o !== order);
  world.strikes += 1;
  world.combo = 0;
  world.plate = [];
  world.shake = 0.5;
  world.flash = { color: 'rgba(220,60,40,0.3)', t: 0.5 };
  addFx(world, 200, 200, `${order.dragon.name} stormed out!`, '#ff8a70');
  setMessage(world, `${order.dragon.name} left hungry — strike ${world.strikes}/${MAX_STRIKES}!`);
  world.spawnT = 0.9;
  if (world.strikes >= MAX_STRIKES) {
    world.screen = 'lose';
    world.overReason = 'Three dragons left hungry — the tavern closes early.';
  }
}

export function step(world, dt) {
  if (world.screen !== 'play' || world.paused) return;
  world.time += dt;
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt);
  if (world.flash) { world.flash.t -= dt; if (world.flash.t <= 0) world.flash = null; }
  if (world.messageT > 0) world.messageT -= dt;
  // Pans cook; steam puffs.
  for (let i = 0; i < world.pans.length; i++) {
    const pan = world.pans[i];
    if (!pan) continue;
    pan.t += dt;
    if (world.rng.next() < dt * 6) {
      world.puffs.push({ x: 470 + i * 170 + (world.rng.next() - 0.5) * 40, y: 250, t: 0, life: 1.1, big: pan.t >= pan.cookTime });
    }
  }
  world.puffs = world.puffs.filter((p) => (p.t += dt) < p.life);
  // Patience drains: current order full rate, the rest half rate.
  const left = [];
  for (const order of world.orders) {
    const rate = order === world.orders[0] ? 1 : 0.5;
    order.patience -= dt * rate;
    if (order.patience <= 0) left.push(order);
  }
  for (const order of left) {
    if (world.screen !== 'play') break;
    loseOrder(world, order);
  }
  // Spawn replacements to keep 3 orders on the board.
  if (world.orders.length < 3 && world.screen === 'play') {
    world.spawnT -= dt;
    if (world.spawnT <= 0) {
      spawnOrder(world);
      world.spawnT = 0.9;
    }
  }
  // Floating texts.
  world.fx = world.fx.filter((f) => (f.t += dt) < f.life);
}
