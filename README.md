# Dragon's Order

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
