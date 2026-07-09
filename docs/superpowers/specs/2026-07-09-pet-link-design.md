# Pet Link Design

Date: 2026-07-09

## Goal

Build a lightweight single-player pet-themed tile-linking game for desktop computers. The game runs locally in a browser through a development server, supports Windows and macOS users with Node.js installed, and does not require accounts, networking, or a backend.

The first version should feel complete enough to play casually, while keeping the codebase simple enough to extend later.

## Product Scope

The game is a local web app built with Vite, React, and TypeScript. Players start it with `npm run dev` and play in a desktop browser.

Included in version one:

- Classic link-link matching rules.
- Relaxed mode with no countdown.
- Timed challenge mode with a countdown.
- One fixed normal board: `10x8`.
- Built-in lightweight pet SVG tiles.
- New game, hint, shuffle, pause, and resume controls.
- Shuffle and hint allowances each start at 1 per game and can gain bonus uses from the previous timed game's remaining time.
- Language switching between Chinese, English, and Japanese.
- Local best records and settings stored in `localStorage`.
- Unit tests for board generation and path matching.

Out of scope for version one:

- Online play.
- User accounts.
- Cloud saves.
- Server-side leaderboards.
- Desktop packaging.
- Mobile-first layout.
- Large image asset packs.

## Gameplay

The board contains pairs of matching pet tiles. A pair can be removed when both tiles have the same pet type and can be connected by a path with at most two turns. The path cannot pass through occupied cells. The board includes an invisible empty border around the playable grid so that matches can route around the outside edge, as in classic link-link games.

Selection flow:

1. The player clicks a tile.
2. The selected tile is highlighted.
3. The player clicks another tile.
4. If the pair is valid, the game draws the connection path briefly, removes both tiles, updates score or stats, and checks for completion.
5. If the pair is invalid, the selection gives a small failed-match response and updates to the second tile if appropriate.

The game should always render the board from state instead of mutating DOM elements directly.

## Modes

Relaxed mode is the default. It has no countdown and tracks elapsed time, moves, hints used, and shuffles used. It is for calm play and learning the board.

Timed mode adds a 6-minute countdown on the same fixed `10x8` board.

Timed mode tracks score. Removing a pair gives points, and finishing with remaining time adds a small time bonus. If time reaches zero before the board is cleared, the game ends in a failure state.

## Board

Version one has only normal difficulty. The board is always `10x8`, with 80 cells and 40 pairs.

The fixed board keeps the first version focused and makes balance easier. Tile types can repeat across many pairs because the board has more pairs than unique pet assets.

## Interface

The first screen is the playable game, not a landing page.

The layout has four main areas:

- Header: game title, mode switch, fixed board label.
- Language selector: Chinese, English, Japanese.
- Status bar: elapsed time or countdown, score, shuffle allowance, hint allowance, best record.
- Board: a stable grid of pet tiles.
- Controls: new game, hint, shuffle, pause or resume.

Dialogs are used for paused state, victory, and timed-mode failure. Dialogs should be lightweight and should not hide permanent navigation or settings behind extra screens.

The visual style should be bright, clean, and pet-themed without heavy decoration. Tiles should have stable dimensions so selection, hover, removal animation, and connection lines do not shift the grid.

## Assets

Version one uses built-in SVG pet tiles. Suggested tile set:

- Cat.
- Dog.
- Rabbit.
- Hamster.
- Bird.
- Fish.
- Turtle.
- Fox.
- Bear.
- Panda.
- Chick.
- Frog.

Pet assets are exposed through a configuration list with:

- `id`: stable tile identifier.
- `name`: display name for accessibility.
- `asset`: SVG component or imported resource path.

The game logic depends only on `id`. This keeps the path-matching and board-generation code independent from the artwork and leaves room for later user-provided image packs.

## Technical Architecture

The app uses Vite, React, and TypeScript. Core game rules are kept separate from React components so they can be tested without rendering the UI.

Planned source structure:

```text
src/
  assets/
    pets/
  components/
    Board.tsx
    Tile.tsx
    Header.tsx
    StatusBar.tsx
    Controls.tsx
    GameDialog.tsx
  game/
    board.ts
    pathfinding.ts
    modes.ts
    scoring.ts
    types.ts
  storage/
    localRecords.ts
  App.tsx
  main.tsx
```

Responsibilities:

- `game/board.ts`: create tile pairs, shuffle boards, clear tiles, detect completion.
- `game/pathfinding.ts`: determine whether two cells can connect with zero, one, or two turns and return path points for rendering.
- `game/modes.ts`: define relaxed and timed mode behavior.
- `game/scoring.ts`: compute timed-mode score and completion bonus.
- `storage/localRecords.ts`: read and write settings and best records through `localStorage`.
- `components/*`: render game state and dispatch user actions.

## State Model

The game state includes:

- Current mode.
- Board dimensions.
- Grid cells.
- Selected cell, if any.
- Last successful path, if visible.
- Move count.
- Remaining pair count.
- Elapsed time or remaining time.
- Score.
- Remaining shuffle allowance.
- Remaining hint allowance.
- Pause state.
- End state: playing, paused, won, or failed.
- Hint and shuffle usage counts.

React owns the current game state. Pure helper functions return next states or rule results rather than mutating shared module state.

## Path Matching

The path matcher receives the board, a start coordinate, and an end coordinate.

Rules:

- Start and end must be different occupied cells.
- Start and end must contain the same tile id.
- A valid path may have zero, one, or two turns.
- A path may travel through empty cells only.
- The virtual border outside the board counts as empty space.
- The matcher returns the ordered path points when valid, otherwise `null`.

Implementation approach:

Create a padded board with one empty-cell border on every side. Then search candidate paths with at most three straight segments. This can be implemented by checking:

- Direct line between start and end.
- One-turn paths through the two rectangle corners.
- Two-turn paths by scanning empty pivot rows and columns.

The returned path is used for the temporary connection-line overlay.

## Hints And Shuffle

Hint finds the first currently removable pair and highlights it briefly. If no pair is available, the game can offer shuffle.

Each new game starts with 1 available hint and 1 available shuffle. Using hint consumes 1 hint when a removable pair is highlighted. Using shuffle consumes 1 shuffle. If the player has 0 hints or 0 shuffles left, the corresponding button is disabled.

After a completed timed game, the game immediately rolls any earned reward dice and shows the result in the completion dialog. Those exact rewards apply to the next game. The reward uses the 6-minute timed-mode duration as the baseline:

- Shuffle reward: remaining time below 108 seconds gives no shuffle bonus. Remaining time greater than or equal to `6 minutes x 30%` gives one six-sided dice roll. This means 108 seconds or more remaining earns a shuffle die roll, and the die result is the number of bonus shuffles for the next game.
- Hint reward: remaining time below 72 seconds gives no hint bonus. Remaining time greater than or equal to `6 minutes x 20%` gives one six-sided dice roll. This means 72 seconds or more remaining earns a hint die roll, and the die result is the number of bonus hints for the next game.

The next game's shuffle allowance is `1 + bonus shuffles`, and the next game's hint allowance is `1 + bonus hints`. Failed timed games and relaxed games do not award bonuses. If there is no previous qualifying timed completion, each allowance is 1.

When a bonus applies, the completion dialog and the next game's status area should briefly show the remaining time, threshold reached, dice roll, and final allowance so the reward feels understandable.

Shuffle should try a bounded number of randomizations to produce at least one available match. If no match is found after the bounded attempts, the game may still show the shuffled board and allow another shuffle if allowance remains.

## Persistence

Use `localStorage` for lightweight local persistence:

- Last selected mode.
- Last selected language.
- Best relaxed completion time.
- Best timed score.
- Previous timed completion reward result for hint and shuffle rewards.

No save-file export is required in version one.

## Testing

Unit tests should cover:

- Board generation creates an even number of tiles.
- Every generated tile id appears an even number of times.
- Generated boards are always `10x8`.
- Direct path matching succeeds when unobstructed.
- One-turn path matching succeeds when unobstructed.
- Two-turn path matching succeeds when unobstructed.
- Outside-border routing succeeds when appropriate.
- Blocked paths fail.
- Different tile ids fail.
- Empty cells cannot be selected as matches.
- Shuffle and hint allowances start at 1 without previous completion data.
- Shuffle allowance gives no bonus when timed-mode remaining time is below 108 seconds.
- Shuffle allowance includes one dice-roll bonus when timed-mode remaining time is at least 108 seconds.
- Hint allowance gives no bonus when timed-mode remaining time is below 72 seconds.
- Hint allowance includes one dice-roll bonus when timed-mode remaining time is at least 72 seconds.
- Failed timed games do not award bonuses.

Manual browser verification should cover:

- Starting a new `10x8` game.
- Switching between relaxed and timed modes.
- Switching between Chinese, English, and Japanese UI text.
- Valid and invalid matches.
- Hint allowance, disabled state, and bonus display.
- Shuffle allowance, disabled state, and bonus display.
- Pause and resume.
- Victory dialog.
- Timed failure dialog.
- Local best record updates.

## Future Options

The project should remain compatible with future desktop packaging through Tauri, but Tauri is not part of version one.

Possible later additions:

- Sound effects and mute toggle.
- More pet tile sets.
- User-supplied local image packs.
- More board shapes.
- Daily seed or challenge mode.
- Desktop app packaging for Windows and macOS.
