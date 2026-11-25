# dragons-order

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/7SteveJohn/dragons-order/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/7SteveJohn/dragons-order/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Dragon's Order is a tavern-kitchen cooking game: hungry dragons sit down at
your inn and order dishes — Ember Steak, Frost Berry Salad, Golden Omelette,
and more. Read the order board, cook each ingredient on the stove until it
glows golden (don't let it burn), plate the dish exactly as ordered, and SERVE
before the dragon's patience runs out. Serve 10 orders to finish the day;
three walk-outs close the tavern early. Combos grow when you serve dish after
dish without a mistake, and a faster serve earns a bigger time bonus.

Everything is hand-drawn vector art and synthesized sound — no images, no
audio files, no libraries, no network. The game runs offline from static
files in a desktop browser.

## How to play

- Click an ingredient on the counter (or press 1–8) to put it on a free pan.
- Watch the ring: when it turns gold the ingredient is cooked — click the pan
  to move it to the assembly plate. Leave it too long and it burns.
- The plate must match the top order on the board exactly. A wrong ingredient
  costs the dragon 3 seconds of patience. Click a plate item to remove it.
- When the plate is complete it glows gold: click SERVE (or press Space).
- Keys: 1–8 ingredients, Space serve, P pause, M mute, R restart.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or just open `game/index.html` in desktop Chrome — it plays from its own
files with no server and no network request.

## Layout

- `game/` — the playable game (static files, `index.html` + ES modules)
- `screenshots/` — real renders of the game (cover, play, win, lose)
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes the dossier
- `vendor/makefun-game.ts` — the make.fun dossier library, copied unchanged

---

<sub>Entered on [make.fun](https://make.fun/?ref=steady-falcon-78&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
