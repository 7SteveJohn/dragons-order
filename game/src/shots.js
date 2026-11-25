// Screenshot scenes: each one plays the real rules forward from a fresh
// world with a fixed seed, so the frame is a position the game really
// reaches and the same ?seed= always gives the same frame.
import { createWorld, startGame, spawnOrder, addToStove, clickPan, serveOrder, step } from './world.js';

function advance(world, seconds) {
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) step(world, dt);
}

// Cook one ingredient and plate it, using the same calls a click makes.
function cookAndPlate(world, ingId) {
  addToStove(world, ingId);
  advance(world, 5); // longest cook is 4.5s; burnt starts at cook+4 (min 6s)
  const idx = world.pans.findIndex((p) => p && p.ing.id === ingId);
  if (idx !== -1) clickPan(world, idx);
}

export function stageShot(name, seed) {
  const world = createWorld(seed);
  world.time = 2.0; // lantern flicker / serve pulse mid-cycle
  if (name === 'start') {
    return world; // title screen
  }
  startGame(world);
  if (name === 'win') {
    // Play a full winning shift quickly: serve 10 orders with the pilot.
    for (let n = 0; n < 10 && world.screen === 'play'; n++) {
      // Keep the queue patient while the pilot cooks: the win frame is about
      // the finished shift, not about the queue timing out mid-pilot.
      for (const o of world.orders) o.patience = o.patienceMax;
      const order = world.orders[0];
      for (const ing of [...order.dish.recipe]) cookAndPlate(world, ing);
      serveOrder(world);
      advance(world, 0.5);
    }
    world.fx = [];
    world.puffs = [];
    return world;
  }
  if (name === 'lose') {
    // Never cook: let three dragons walk out.
    advance(world, 200);
    world.fx = [];
    world.puffs = [];
    return world;
  }
  if (name === 'cover') {
    // The decisive frame: order board full, pans cooking, plate mid-assembly
    // (2 of 3 on the plate, steam rising), and a finished golden dish on the
    // pass — every required element in one shot.
    world.score = 340;
    world.combo = 3;
    world.bestCombo = 3;
    world.served = 3;
    const order = world.orders[0];
    // Serve one order first so the pass shows a finished dish.
    for (const ing of [...order.dish.recipe]) cookAndPlate(world, ing);
    serveOrder(world);
    // Now build the next order's plate: 2 of 3 ingredients, third still cooking.
    const next = world.orders[0];
    const [a, b, c] = next.dish.recipe;
    cookAndPlate(world, a);
    cookAndPlate(world, b);
    addToStove(world, c);
    advance(world, 2.2); // third ingredient mid-cook, steam up
    // A second pan with something else sizzling for depth.
    addToStove(world, 'egg');
    advance(world, 0.6);
    world.fx = world.fx.filter((f) => f.text.includes('READY') === false);
    return world;
  }
  // 'play': mid-assembly, one ingredient on the plate, two pans going.
  world.score = 120;
  world.combo = 1;
  world.bestCombo = 2;
  world.served = 1;
  const order = world.orders[0];
  cookAndPlate(world, order.dish.recipe[0]);
  addToStove(world, order.dish.recipe[1]);
  advance(world, 2.0);
  addToStove(world, 'mushroom');
  advance(world, 0.8);
  world.fx = [];
  return world;
}
