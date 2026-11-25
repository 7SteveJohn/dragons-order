// DRAGON'S ORDER — canvas rendering. All art is drawn vector shapes, no images.
import { INGREDIENTS, ingredientById, plateReady, currentOrder, WIN_SERVES, MAX_STRIKES, DRAGONS } from './world.js';

export const W = 1280;
export const H = 760;

// Layout (logical 1280x760).
export const L = {
  board: { x: 16, y: 76, w: 356, h: 480 },
  stove: { x: 388, y: 100, w: 504, h: 190 },
  plate: { x: 640, y: 440, r: 96 },
  serve: { x: 770, y: 470, w: 118, h: 64 },
  pass: { x: 908, y: 76, w: 356, h: 200 },
  menu: { x: 908, y: 292, w: 356, h: 264 },
  counter: { x: 16, y: 572, w: 1248, h: 172 },
  topbar: { x: 0, y: 0, w: 1280, h: 64 },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, s, x, y, size, color, align = 'center', font = 'bold', family = "Trebuchet MS, Verdana, sans-serif") {
  ctx.fillStyle = color;
  ctx.font = `${font} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function woodPanel(ctx, x, y, w, h, r = 14) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#6b4423');
  g.addColorStop(1, '#4a2c14');
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2e1a0a';
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255,210,140,0.35)';
  rr(ctx, x + 4, y + 4, w - 8, h - 8, r - 4);
  ctx.stroke();
}

// --- Dragon face -----------------------------------------------------------
export function drawDragon(ctx, x, y, r, dragon, mood = 'happy') {
  ctx.save();
  ctx.translate(x, y);
  // Horns
  ctx.fillStyle = dragon.dark;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r * 0.55); ctx.lineTo(-r * 0.95, -r * 1.25); ctx.lineTo(-r * 0.2, -r * 0.85); ctx.closePath();
  ctx.moveTo(r * 0.55, -r * 0.55); ctx.lineTo(r * 0.95, -r * 1.25); ctx.lineTo(r * 0.2, -r * 0.85); ctx.closePath();
  ctx.fill();
  // Head
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.2, 0, 0, r * 1.1);
  g.addColorStop(0, dragon.color);
  g.addColorStop(1, dragon.dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Belly patch / snout
  ctx.fillStyle = dragon.belly;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.42, r * 0.52, r * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nostrils
  ctx.fillStyle = dragon.dark;
  ctx.beginPath(); ctx.arc(-r * 0.16, r * 0.38, r * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.16, r * 0.38, r * 0.06, 0, Math.PI * 2); ctx.fill();
  // Eyes
  const eyeY = -r * 0.18;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-r * 0.34, eyeY, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.34, eyeY, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d1206';
  if (mood === 'angry') {
    ctx.beginPath(); ctx.arc(-r * 0.34, eyeY, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.34, eyeY, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1d1206'; ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.moveTo(-r * 0.55, eyeY - r * 0.32); ctx.lineTo(-r * 0.14, eyeY - r * 0.12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.55, eyeY - r * 0.32); ctx.lineTo(r * 0.14, eyeY - r * 0.12); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(-r * 0.32, eyeY + r * 0.02, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.32, eyeY + r * 0.02, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-r * 0.29, eyeY - r * 0.03, r * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.35, eyeY - r * 0.03, r * 0.035, 0, Math.PI * 2); ctx.fill();
  }
  // Smile / frown
  ctx.strokeStyle = dragon.dark;
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  if (mood === 'angry') { ctx.arc(0, r * 0.95, r * 0.28, Math.PI * 1.15, Math.PI * 1.85); }
  else { ctx.arc(0, r * 0.42, r * 0.26, Math.PI * 0.15, Math.PI * 0.85); }
  ctx.stroke();
  ctx.restore();
}

// --- Ingredient icons ------------------------------------------------------
export function drawIngredient(ctx, x, y, r, ing) {
  ctx.save();
  ctx.translate(x, y);
  const c = ing.color, d = ing.dark;
  ctx.fillStyle = c;
  ctx.strokeStyle = d;
  ctx.lineWidth = 2;
  switch (ing.id) {
    case 'steak': {
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.7, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8b48a';
      ctx.beginPath(); ctx.ellipse(-r * 0.1, -r * 0.05, r * 0.5, r * 0.32, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(r * 0.75, -r * 0.55, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.95, -r * 0.3, r * 0.22, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'mushroom': {
      ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.85, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.5, r * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.35, r * 0.13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2e6c8';
      rr(ctx, -r * 0.28, -r * 0.1, r * 0.56, r * 0.75, r * 0.2); ctx.fill(); ctx.stroke();
      break;
    }
    case 'berry': {
      const spots = [[-0.35, 0.1], [0.3, -0.15], [0, 0.45], [0.4, 0.4], [-0.15, -0.45]];
      for (const [dx, dy] of spots) {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(dx * r - r * 0.1, dy * r - r * 0.12, r * 0.09, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#fff8e6';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.72, r * 0.9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f2a93b';
      ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath(); ctx.arc(-r * 0.1, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'pepper': {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.3);
      ctx.quadraticCurveTo(0, -r * 1.1, r * 0.85, -r * 0.2);
      ctx.quadraticCurveTo(r * 0.5, r * 0.75, -r * 0.15, r * 0.85);
      ctx.quadraticCurveTo(-r * 0.9, r * 0.6, -r * 0.8, -r * 0.3);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#2f7a3e'; ctx.lineWidth = r * 0.16;
      ctx.beginPath(); ctx.moveTo(r * 0.8, -r * 0.25); ctx.quadraticCurveTo(r * 1.1, -r * 0.7, r * 0.95, -r * 0.95); ctx.stroke();
      break;
    }
    case 'herb': {
      ctx.fillStyle = c;
      for (const a of [-0.5, 0, 0.5]) {
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.28, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = d; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, r * 0.8); ctx.lineTo(0, -r * 0.2); ctx.stroke();
      break;
    }
    case 'fish': {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.85, r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r * 0.7, 0); ctx.lineTo(r * 1.15, -r * 0.5); ctx.lineTo(r * 1.15, r * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1d1206';
      ctx.beginPath(); ctx.arc(-r * 0.45, -r * 0.08, r * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = d; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(r * 0.1, 0, r * 0.3, -1.2, 1.2); ctx.stroke();
      break;
    }
    case 'bread': {
      ctx.fillStyle = c;
      rr(ctx, -r * 0.95, -r * 0.45, r * 1.9, r * 0.9, r * 0.45); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = d; ctx.lineWidth = 2;
      for (const dx of [-0.45, 0, 0.45]) {
        ctx.beginPath(); ctx.moveTo(dx * r - r * 0.15, -r * 0.4); ctx.lineTo(dx * r + r * 0.15, -r * 0.1); ctx.stroke();
      }
      break;
    }
    default: {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}

// --- Regions for input -----------------------------------------------------
export function regions(world) {
  const out = [];
  const c = L.counter;
  const bw = c.w / INGREDIENTS.length;
  INGREDIENTS.forEach((ing, i) => {
    out.push({ kind: 'bin', id: ing.id, rect: { x: c.x + i * bw + 6, y: c.y + 8, w: bw - 12, h: c.h - 16 } });
  });
  for (let i = 0; i < 3; i++) {
    out.push({ kind: 'pan', index: i, rect: { x: L.stove.x + 18 + i * 168, y: L.stove.y + 30, w: 140, h: 130 } });
  }
  // Plate ingredient slots (small circles around the plate).
  world.plate.forEach((id, i) => {
    const a = -Math.PI / 2 + (i - (world.plate.length - 1) / 2) * 0.7;
    out.push({
      kind: 'plate-item', index: i, id,
      rect: { x: L.plate.x + Math.cos(a) * 52 - 26, y: L.plate.y + Math.sin(a) * 52 - 26, w: 52, h: 52 },
    });
  });
  out.push({ kind: 'serve', rect: L.serve });
  out.push({ kind: 'mute', rect: { x: 1210, y: 12, w: 56, h: 40 } });
  return out;
}

export function hitAt(world, x, y) {
  for (const r of regions(world)) {
    if (x >= r.rect.x && x <= r.rect.x + r.rect.w && y >= r.rect.y && y <= r.rect.y + r.rect.h) return r;
  }
  return null;
}

// --- Drawing ---------------------------------------------------------------
function drawTopbar(ctx, world) {
  const b = L.topbar;
  const g = ctx.createLinearGradient(0, 0, 0, b.h);
  g.addColorStop(0, '#3a2412');
  g.addColorStop(1, '#241408');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, b.w, b.h);
  ctx.fillStyle = '#c98f3d';
  ctx.fillRect(0, b.h - 3, b.w, 3);
  text(ctx, "DRAGON'S ORDER", 24, 33, 27, '#ffd94d', 'left', 'bold', "Georgia, 'Times New Roman', serif");
  text(ctx, 'A tavern kitchen for hungry dragons', 316, 36, 15, '#d8b98a', 'left', 'normal');
  text(ctx, `SCORE  ${world.score}`, 640, 30, 26, '#fff', 'center');
  text(ctx, `ORDERS  ${world.served}/${WIN_SERVES}`, 850, 30, 22, '#ffe9b0', 'center');
  // Strikes as flames.
  for (let i = 0; i < MAX_STRIKES; i++) {
    const x = 1000 + i * 34;
    const lit = i < world.strikes;
    ctx.fillStyle = lit ? '#ff5a2a' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(x, 18); ctx.quadraticCurveTo(x + 14, 30, x + 8, 44);
    ctx.quadraticCurveTo(x + 4, 50, x, 50); ctx.quadraticCurveTo(x - 4, 50, x - 8, 44);
    ctx.quadraticCurveTo(x - 14, 30, x, 18); ctx.fill();
  }
  text(ctx, 'STRIKES', 985, 52, 11, '#c9a06a', 'right');
  text(ctx, world.muted ? '🔇 M' : '🔊 M', 1238, 32, 20, '#ffe9b0', 'center');
}

function drawOrderCard(ctx, world, order, x, y, w, h, isCurrent) {
  const urgent = order.patience < 12;
  rr(ctx, x, y, w, h, 12);
  ctx.fillStyle = isCurrent ? '#fdf3d0' : '#f3e2b8';
  ctx.fill();
  ctx.lineWidth = isCurrent ? 4 : 2;
  ctx.strokeStyle = urgent ? '#d9382b' : (isCurrent ? '#c98f3d' : '#a8854f');
  ctx.stroke();
  if (isCurrent) {
    text(ctx, 'NOW SERVING', x + w - 12, y + 16, 12, '#b4552d', 'right');
  }
  drawDragon(ctx, x + 46, y + 44, 34, order.dragon, urgent ? 'angry' : 'happy');
  text(ctx, order.dragon.name, x + 88, y + 26, 19, '#4a2c14', 'left');
  text(ctx, order.dish.name, x + 88, y + 52, 23, '#7e3418', 'left', 'bold', "Georgia, 'Times New Roman', serif");
  // Recipe icons.
  order.dish.recipe.forEach((id, i) => {
    const ix = x + 96 + i * 46;
    drawIngredient(ctx, ix, y + 92, 17, ingredientById(id));
    ctx.fillStyle = 'rgba(74,44,20,0.55)';
    ctx.font = 'bold 13px Trebuchet MS, Verdana, sans-serif';
    ctx.textAlign = 'center';
    if (i < order.dish.recipe.length - 1) ctx.fillText('+', ix + 23, y + 92);
  });
  // Patience bar + big timer.
  const frac = Math.max(0, order.patience / order.patienceMax);
  const barX = x + 14, barY = y + h - 40, barW = w - 28, barH = 14;
  rr(ctx, barX, barY, barW, barH, 7);
  ctx.fillStyle = '#3a2412';
  ctx.fill();
  rr(ctx, barX, barY, barW * frac, barH, 7);
  ctx.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#f2a93b' : '#d9382b';
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 14, y + h - 64, isCurrent ? 40 : 28, urgent ? '#d9382b' : '#4a2c14', 'right');
  text(ctx, 'patience', x + 16, y + h - 64, 13, '#8a6a44', 'left');
}

function drawBoard(ctx, world) {
  const b = L.board;
  woodPanel(ctx, b.x, b.y, b.w, b.h);
  text(ctx, '📋  ORDER BOARD', b.x + b.w / 2, b.y + 24, 21, '#ffd94d', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  world.orders.forEach((order, i) => {
    drawOrderCard(ctx, world, order, b.x + 12, b.y + 46 + i * 152, b.w - 24, 142, i === 0);
  });
  if (world.orders.length === 0) {
    text(ctx, 'No orders yet…', b.x + b.w / 2, b.y + 200, 18, '#f3e2b8');
  }
}

function drawStove(ctx, world) {
  const s = L.stove;
  // Back wall tiles + stove body.
  const g = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
  g.addColorStop(0, '#5c3a22');
  g.addColorStop(1, '#3a2412');
  rr(ctx, s.x, s.y, s.w, s.h, 14);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#241408';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🔥  STOVE — click a cooked pan to plate it', s.x + s.w / 2, s.y + 18, 15, '#ffd9a0', 'center');
  for (let i = 0; i < 3; i++) {
    const cx = s.x + 88 + i * 168;
    const cy = s.y + 105;
    const pan = world.pans[i];
    // Flame under pan.
    const flick = Math.sin(world.time * 9 + i * 2) * 3;
    ctx.fillStyle = '#ff7a2a';
    ctx.beginPath();
    ctx.moveTo(cx - 34, cy + 42);
    ctx.quadraticCurveTo(cx - 20, cy + 14 + flick, cx, cy + 26);
    ctx.quadraticCurveTo(cx + 20, cy + 14 + flick, cx + 34, cy + 42);
    ctx.closePath();
    ctx.fill();
    // Pan.
    ctx.fillStyle = '#23232a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 18, 62, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#34343e';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 62, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#15151a';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (pan) {
      const frac = Math.min(1, pan.t / pan.cookTime);
      const burnt = pan.t >= pan.cookTime + 4;
      drawIngredient(ctx, cx, cy - 6, 34, pan.ing);
      if (burnt) {
        ctx.fillStyle = 'rgba(20,10,5,0.55)';
        ctx.beginPath(); ctx.ellipse(cx, cy - 6, 36, 26, 0, 0, Math.PI * 2); ctx.fill();
        text(ctx, 'BURNT!', cx, cy - 52, 18, '#ff8a70');
        text(ctx, 'click to toss', cx, cy - 32, 12, '#ffb0a0');
      } else {
        // Cook progress ring.
        ctx.strokeStyle = frac >= 1 ? '#ffd94d' : '#f2a93b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 44, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        if (frac >= 1) {
          text(ctx, 'COOKED ✓', cx, cy - 56, 17, '#ffd94d');
          // Golden glow.
          ctx.strokeStyle = 'rgba(255,217,77,0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(cx, cy - 6, 50, 0, Math.PI * 2); ctx.stroke();
        }
      }
    } else {
      text(ctx, 'empty pan', cx, cy - 6, 14, 'rgba(255,217,160,0.5)');
    }
  }
}

function drawPlateArea(ctx, world) {
  const p = L.plate;
  // Table.
  const g = ctx.createLinearGradient(388, 300, 388, 556);
  g.addColorStop(0, '#7a4a28');
  g.addColorStop(1, '#5a3418');
  rr(ctx, 388, 300, 504, 256, 14);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#2e1a0a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🍽️  ASSEMBLY PLATE — click a plate item to remove it', 640, 322, 15, '#ffd9a0', 'center');
  const ready = plateReady(world);
  const order = currentOrder(world);
  // Plate shadow + plate.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 8, p.r + 10, p.r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  const pg = ctx.createRadialGradient(p.x - 20, p.y - 24, 10, p.x, p.y, p.r);
  pg.addColorStop(0, '#fffdf4');
  pg.addColorStop(1, ready ? '#ffe9a0' : '#e8dcc2');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = ready ? '#e8b93e' : '#c9a86a';
  ctx.stroke();
  if (ready) {
    ctx.strokeStyle = 'rgba(255,217,77,0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 9 + Math.sin(world.time * 5) * 3, 0, Math.PI * 2); ctx.stroke();
  }
  // Plate contents.
  world.plate.forEach((id, i) => {
    const a = -Math.PI / 2 + (i - (world.plate.length - 1) / 2) * 0.7;
    drawIngredient(ctx, p.x + Math.cos(a) * 52, p.y + Math.sin(a) * 52, 26, ingredientById(id));
  });
  if (world.plate.length === 0) {
    text(ctx, 'empty plate', p.x, p.y, 16, 'rgba(74,44,20,0.45)');
  }
  // Recipe progress under the plate.
  if (order) {
    const slots = order.dish.recipe.length;
    const done = world.plate.length;
    text(ctx, `${order.dish.name}  ${done}/${slots}`, p.x, p.y + p.r + 26, 19, '#ffe9b0', 'center');
    if (ready) {
      text(ctx, '★ READY TO SERVE ★', p.x, p.y - p.r - 18, 24, '#ffd94d', 'center', 'bold', "Georgia, 'Times New Roman', serif");
    }
  }
  // Serve button.
  const s = L.serve;
  const pulse = ready ? 1 + Math.sin(world.time * 6) * 0.06 : 1;
  ctx.save();
  ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
  ctx.scale(pulse, pulse);
  rr(ctx, -s.w / 2, -s.h / 2, s.w, s.h, 12);
  ctx.fillStyle = ready ? '#e8b93e' : '#6b5a48';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = ready ? '#8a6410' : '#3a2c1c';
  ctx.stroke();
  ctx.restore();
  text(ctx, 'SERVE', s.x + s.w / 2, s.y + s.h / 2 - 8, 22, ready ? '#3a2408' : '#d8c8a8', 'center');
  text(ctx, 'Space', s.x + s.w / 2, s.y + s.h / 2 + 16, 12, ready ? '#6a4a10' : '#a89878', 'center');
}

function drawPass(ctx, world) {
  const b = L.pass;
  woodPanel(ctx, b.x, b.y, b.w, b.h);
  text(ctx, '✦  THE PASS — last served', b.x + b.w / 2, b.y + 22, 17, '#ffd94d', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  if (world.lastServed) {
    // Golden plate with the finished dish.
    const cx = b.x + 70, cy = b.y + 105;
    ctx.fillStyle = '#ffe9a0';
    ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#e8b93e'; ctx.stroke();
    const dish = world.lastServed.dish;
    text(ctx, '🍽️', cx, cy, 44, '#7e3418');
    text(ctx, dish, b.x + 140, b.y + 82, 24, '#fff3d0', 'left', 'bold', "Georgia, 'Times New Roman', serif");
    text(ctx, `for ${world.lastServed.dragon}`, b.x + 140, b.y + 112, 17, '#d8b98a', 'left');
    text(ctx, `+${world.lastServed.score} pts`, b.x + 140, b.y + 142, 22, '#ffd94d', 'left');
    text(ctx, 'READY TO SERVE ✓', b.x + b.w / 2, b.y + 178, 15, '#8fe08a', 'center');
  } else {
    text(ctx, 'Nothing served yet —', b.x + b.w / 2, b.y + 90, 17, '#d8b98a');
    text(ctx, 'finish a plate to see it here!', b.x + b.w / 2, b.y + 118, 17, '#d8b98a');
  }
}

function drawMenu(ctx, world) {
  const b = L.menu;
  woodPanel(ctx, b.x, b.y, b.w, b.h);
  text(ctx, '📖  TODAY’S MENU', b.x + b.w / 2, b.y + 22, 17, '#ffd94d', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  const rows = [
    ['Ember Steak', 'steak+pepper+herb', '100'],
    ['Frost Berry Salad', 'berry+herb+mushroom', '100'],
    ['Golden Omelette', 'egg+herb+mushroom', '100'],
    ['Pepper Stir-Fry', 'pepper+mushroom+steak', '110'],
    ['Starlight Soup', 'fish+herb+berry', '110'],
    ['Tavern Feast', 'steak+bread+egg+fish', '160'],
  ];
  rows.forEach(([name, rec, price], i) => {
    const y = b.y + 52 + i * 34;
    text(ctx, name, b.x + 14, y, 16, '#fff3d0', 'left');
    text(ctx, `${price} pts`, b.x + b.w - 14, y, 16, '#ffd94d', 'right');
    ctx.fillStyle = 'rgba(255,233,176,0.5)';
    ctx.fillRect(b.x + 14, y + 14, b.w - 28, 1);
  });
  text(ctx, `COMBO ×${world.combo}   BEST ×${world.bestCombo}`, b.x + b.w / 2, b.y + b.h - 16, 16, '#ffd94d', 'center');
}

function drawCounter(ctx, world) {
  const c = L.counter;
  const g = ctx.createLinearGradient(0, c.y, 0, c.y + c.h);
  g.addColorStop(0, '#8a5a30');
  g.addColorStop(1, '#5a3418');
  rr(ctx, c.x, c.y, c.w, c.h, 14);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#2e1a0a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'COUNTER — click an ingredient to put it on a pan  ·  keys 1–8', c.x + c.w / 2, c.y + 16, 14, '#ffd9a0', 'center');
  const bw = c.w / INGREDIENTS.length;
  INGREDIENTS.forEach((ing, i) => {
    const cx = c.x + i * bw + bw / 2;
    const cy = c.y + 78;
    // Bin.
    rr(ctx, cx - bw / 2 + 8, c.y + 30, bw - 16, 118, 10);
    ctx.fillStyle = 'rgba(30,16,6,0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,210,140,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    drawIngredient(ctx, cx, cy, 30, ing);
    text(ctx, ing.short, cx, c.y + 128, 16, '#fff3d0', 'center');
    text(ctx, ing.key, cx - bw / 2 + 22, c.y + 48, 14, '#ffd94d', 'center');
  });
}

function drawFx(ctx, world) {
  for (const f of world.fx) {
    const a = 1 - f.t / f.life;
    ctx.globalAlpha = Math.max(0, a);
    text(ctx, f.text, f.x, f.y - f.t * 34, 24, f.color, 'center', 'bold', "Georgia, 'Times New Roman', serif");
    ctx.globalAlpha = 1;
  }
  // Steam puffs.
  for (const p of world.puffs) {
    const a = (1 - p.t / p.life) * 0.45;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x, p.y - p.t * 46, 10 + p.t * 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMessage(ctx, world) {
  if (world.messageT > 0 && world.message) {
    const a = Math.min(1, world.messageT);
    ctx.globalAlpha = a;
    text(ctx, world.message, 640, 566, 17, '#ffe9b0', 'center');
    ctx.globalAlpha = 1;
  }
}

function overlay(ctx, world, title, lines, accent) {
  ctx.fillStyle = 'rgba(20,10,4,0.72)';
  ctx.fillRect(0, 0, W, H);
  const bw = 640, bh = 430;
  const bx = (W - bw) / 2, by = (H - bh) / 2;
  woodPanel(ctx, bx, by, bw, bh, 18);
  text(ctx, title, W / 2, by + 52, 44, accent, 'center', 'bold', "Georgia, 'Times New Roman', serif");
  lines.forEach((line, i) => {
    text(ctx, line.text, W / 2, by + 118 + i * 36, line.size || 20, line.color || '#fff3d0', 'center', line.bold ? 'bold' : 'normal', line.serif ? "Georgia, 'Times New Roman', serif" : "Trebuchet MS, Verdana, sans-serif");
  });
}

export function drawWorld(ctx, world) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * world.shake * 22, (Math.random() - 0.5) * world.shake * 22);
  }
  // Tavern background: warm wall + floor.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#4a2e1a');
  bg.addColorStop(0.55, '#3a2412');
  bg.addColorStop(1, '#2a1a0c');
  ctx.fillStyle = bg;
  ctx.fillRect(-20, -20, W + 40, H + 40);

  drawTopbar(ctx, world);
  if (world.screen === 'title') {
    drawTitle(ctx, world);
  } else {
    drawBoard(ctx, world);
    drawStove(ctx, world);
    drawPlateArea(ctx, world);
    drawPass(ctx, world);
    drawMenu(ctx, world);
    drawCounter(ctx, world);
    drawFx(ctx, world);
    drawMessage(ctx, world);
    if (world.paused) {
      ctx.fillStyle = 'rgba(20,10,4,0.6)';
      ctx.fillRect(0, 0, W, H);
      text(ctx, 'PAUSED — press P to continue', W / 2, H / 2, 34, '#ffd94d', 'center', 'bold', "Georgia, 'Times New Roman', serif");
    }
    if (world.screen === 'win') {
      overlay(ctx, world, '🏆  DAY COMPLETE!', [
        { text: world.overReason, size: 22, color: '#ffe9b0' },
        { text: `Final score: ${world.score}   •   Orders served: ${world.served}/${WIN_SERVES}`, size: 22 },
        { text: `Best combo: ×${world.bestCombo}`, size: 20, color: '#ffd94d' },
        { text: 'The dragons feast, the tavern sings. Press R to cook again.', size: 18, color: '#d8b98a' },
      ], '#ffd94d');
    } else if (world.screen === 'lose') {
      overlay(ctx, world, '🌙  THE TAVERN CLOSES…', [
        { text: world.overReason, size: 22, color: '#ffe9b0' },
        { text: `Score: ${world.score}   •   Orders served: ${world.served}`, size: 22 },
        { text: `Best combo: ×${world.bestCombo}`, size: 20, color: '#ffd94d' },
        { text: 'Three dragons left hungry. Press R to try again.', size: 18, color: '#d8b98a' },
      ], '#ff8a70');
    }
  }
  if (world.flash) {
    ctx.fillStyle = world.flash.color;
    ctx.fillRect(-20, -20, W + 40, H + 40);
  }
  ctx.restore();
}

function drawTitle(ctx, world) {
  // Big tavern scene behind the title card.
  drawDragon(ctx, 300, 330, 120, DRAGONS[0]);
  drawDragon(ctx, 980, 330, 120, DRAGONS[1]);
  drawDragon(ctx, 640, 250, 84, DRAGONS[4]);
  const bw = 760, bh = 330;
  const bx = (W - bw) / 2, by = 400;
  woodPanel(ctx, bx, by, bw, bh, 18);
  text(ctx, "DRAGON'S ORDER", W / 2, by + 56, 52, '#ffd94d', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  text(ctx, 'A tavern kitchen for hungry dragons', W / 2, by + 104, 21, '#ffe9b0', 'center');
  text(ctx, 'Read the order board · cook each ingredient on the stove ·', W / 2, by + 152, 18, '#fff3d0', 'center');
  text(ctx, 'plate the dish and SERVE before the dragon’s patience runs out.', W / 2, by + 180, 18, '#fff3d0', 'center');
  text(ctx, `Serve ${WIN_SERVES} orders to finish the day — 3 walk-outs close the tavern.`, W / 2, by + 208, 18, '#fff3d0', 'center');
  const blink = Math.sin(world.time * 4) > -0.2;
  if (blink) text(ctx, '▶  CLICK OR PRESS ENTER TO START  ◀', W / 2, by + 262, 24, '#ffd94d', 'center', 'bold');
  text(ctx, 'Mouse + keys 1–8 · Space to serve · M mute · P pause', W / 2, by + 300, 15, '#d8b98a', 'center');
}
