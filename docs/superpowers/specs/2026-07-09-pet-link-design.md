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
- Three board sizes: easy `8x6`, normal `10x8`, hard `12x8`.
- Built-in lightweight pet SVG tiles.
- New game, hint, shuffle, pause, and resume controls.
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

Timed mode adds a countdown. The first version uses one duration per difficulty:

- Easy: 4 minutes.
- Normal: 6 minutes.
- Hard: 8 minutes.

Timed mode tracks score. Removing a pair gives points, and finishing with remaining time adds a small time bonus. If time reaches zero before the board is cleared, the game ends in a failure state.

## Difficulty

Difficulty controls only board size and timed-mode duration in the first version. It does not change tile art, rule complexity, or special mechanics.

The planned board sizes are:

- Easy: `8x6`, 48 cells, 24 pairs.
- Normal: `10x8`, 80 cells, 40 pairs.
- Hard: `12x8`, 96 cells, 48 pairs.

Each board must contain an even number of cells. Tile types can repeat across many pairs when the board has more pairs than unique pet assets.

## Interface

The first screen is the playable game, not a landing page.

The layout has four main areas:

- Header: game title, mode switch, difficulty selector.
- Status bar: elapsed time or countdown, score, moves, remaining pairs.
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
- Current difficulty.
- Board dimensions.
- Grid cells.
- Selected cell, if any.
- Last successful path, if visible.
- Move count.
- Remaining pair count.
- Elapsed time or remaining time.
- Score.
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

Shuffle randomizes remaining tiles while preserving their ids and count. It should try a bounded number of shuffles to produce at least one available match. If no match is found after the bounded attempts, the game may still show the shuffled board and allow another shuffle.

## Persistence

Use `localStorage` for lightweight local persistence:

- Last selected mode.
- Last selected difficulty.
- Best relaxed completion time per difficulty.
- Best timed score per difficulty.

No save-file export is required in version one.

## Testing

Unit tests should cover:

- Board generation creates an even number of tiles.
- Every generated tile id appears an even number of times.
- Generated boards match the requested dimensions.
- Direct path matching succeeds when unobstructed.
- One-turn path matching succeeds when unobstructed.
- Two-turn path matching succeeds when unobstructed.
- Outside-border routing succeeds when appropriate.
- Blocked paths fail.
- Different tile ids fail.
- Empty cells cannot be selected as matches.

Manual browser verification should cover:

- Starting a new game in each difficulty.
- Switching between relaxed and timed modes.
- Valid and invalid matches.
- Hint behavior.
- Shuffle behavior.
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
