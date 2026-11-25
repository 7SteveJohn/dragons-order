// Dragon's Order — entrypoint (Node 22, standard library only).
//
// This program hands the game in. It copies the playable game (game/, plain
// static files a desktop browser loads offline: game/index.html plus its ES
// modules, no library, no network request) and the real-render screenshots
// (screenshots/, first by name is the cover) from beside this file into the
// grader's output directory, then writes /output/dossier.json with the
// vendored make.fun library, which is the summary the judge reads.
//
// The game itself: a tavern kitchen where you cook for hungry dragons.
// Order board, eight ingredients on the counter, three pots, dishes
// assembled mid-order, a patience timer, and a plate ready to serve.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps, from the competition's reference/gate.json. Only
// text_max_bytes shapes the dossier's bytes; the rest mirror what the
// scorer refuses: more than 4 screenshots or one over 256 KiB, more than
// 993 files in game/ or 48 MiB of game files in all, or a path under game/
// over 1000 bytes. game/ counts beside /output's own 1000-entry cap, which
// game/, screenshots/ and dossier.json share, so leave it room.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function mustExist(path, what) {
  if (!existsSync(path)) throw new Error(`Dragon's Order: missing ${what} at ${path}`);
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');
mustExist(join(gameDir, 'index.html'), 'game/index.html');
mustExist(shotsDir, 'screenshots/');

const shotFiles = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`Dragon's Order: expected 3 or 4 screenshots, found ${shotFiles.length}`);
}
for (const name of shotFiles) {
  const bytes = statSync(join(shotsDir, name)).size;
  if (bytes > dossierCaps.screenshots.max_bytes) {
    throw new Error(`Dragon's Order: screenshot ${name} is ${bytes} bytes, over the 256 KiB cap`);
  }
}

mkdirSync(outputDir, { recursive: true });
cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierCaps));

console.log(
  `Dragon's Order: handed in ${countFiles(gameDir)} game files and ${shotFiles.length} screenshots.`,
);
