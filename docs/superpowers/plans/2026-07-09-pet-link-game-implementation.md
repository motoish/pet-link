# Pet Link Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable local React web version of the fixed `10x8` pet link game.

**Architecture:** Keep game rules in pure TypeScript modules under `src/game/` and render state through React components under `src/components/`. Use SVG React components for built-in pet tiles and `localStorage` for records and last selected mode.

**Tech Stack:** Vite, React, TypeScript, Vitest, CSS modules through plain imported CSS.

## Global Constraints

- The game runs locally in a browser through `npm run dev`.
- The app has no backend, accounts, cloud saves, or server-side leaderboard.
- The board is always `10x8`, with 80 cells and 40 pairs.
- Relaxed mode has no countdown.
- Timed mode has a 6-minute countdown.
- Each new game starts with 1 available shuffle.
- If the previous completed timed game has less than 108 seconds remaining, the next game gets no shuffle bonus.
- If the previous completed timed game has at least 108 seconds remaining, roll one six-sided die and add that result to the next game's shuffle allowance.
- Failed timed games and relaxed games do not award shuffle bonuses.
- Built-in pet tiles are lightweight SVG assets.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, and `npm test` commands.
- Produces: a visible React shell that later tasks replace with the game.

- [ ] **Step 1: Create Vite React TypeScript files**

Use `apply_patch` to create the listed files with React, Vite, TypeScript, and Vitest configuration.

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Verify scaffold**

Run: `npm run build`

Expected: TypeScript and Vite build complete with exit code 0.

### Task 2: Core Game Logic With Tests

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/board.ts`
- Create: `src/game/pathfinding.ts`
- Create: `src/game/shuffleRewards.ts`
- Create: `src/game/board.test.ts`
- Create: `src/game/pathfinding.test.ts`
- Create: `src/game/shuffleRewards.test.ts`

**Interfaces:**
- Produces: `createBoard(tileIds: string[], random?: RandomFn): Board`
- Produces: `findConnection(board: Board, from: Point, to: Point): Point[] | null`
- Produces: `findAvailablePair(board: Board): MatchHint | null`
- Produces: `shuffleRemainingTiles(board: Board, random?: RandomFn): Board`
- Produces: `calculateNextShuffleAllowance(input: ShuffleRewardInput): ShuffleRewardResult`

- [ ] **Step 1: Write failing tests for board generation**

Create tests asserting a `10x8` board, 80 occupied cells, even tile counts, and stable coordinate lookup.

- [ ] **Step 2: Run board tests and verify RED**

Run: `npm test -- src/game/board.test.ts --run`

Expected: fail because `src/game/board.ts` does not exist yet.

- [ ] **Step 3: Implement board generation**

Implement `createBoard`, `getCell`, `setCell`, `clearCells`, `countRemainingPairs`, `findAvailablePair`, and `shuffleRemainingTiles`.

- [ ] **Step 4: Run board tests and verify GREEN**

Run: `npm test -- src/game/board.test.ts --run`

Expected: pass.

- [ ] **Step 5: Write failing tests for path matching**

Create tests for direct path, one turn, two turns, outside-border routing, blocked routing, different tile ids, and empty cells.

- [ ] **Step 6: Run path tests and verify RED**

Run: `npm test -- src/game/pathfinding.test.ts --run`

Expected: fail because `findConnection` is not implemented.

- [ ] **Step 7: Implement path matching**

Implement a padded-board search with direct, one-turn, and two-turn path checks.

- [ ] **Step 8: Run path tests and verify GREEN**

Run: `npm test -- src/game/pathfinding.test.ts --run`

Expected: pass.

- [ ] **Step 9: Write failing tests for shuffle rewards**

Create tests for base allowance, failed timed game, relaxed game, 107 seconds remaining, and 108 seconds remaining with deterministic die roll.

- [ ] **Step 10: Run reward tests and verify RED**

Run: `npm test -- src/game/shuffleRewards.test.ts --run`

Expected: fail because `calculateNextShuffleAllowance` is not implemented.

- [ ] **Step 11: Implement shuffle rewards**

Implement the fixed threshold and injectable random die roll.

- [ ] **Step 12: Run all game tests**

Run: `npm test -- --run`

Expected: all game tests pass.

### Task 3: Playable React Game

**Files:**
- Create: `src/assets/pets.tsx`
- Create: `src/storage/localRecords.ts`
- Create: `src/components/Header.tsx`
- Create: `src/components/StatusBar.tsx`
- Create: `src/components/Board.tsx`
- Create: `src/components/Tile.tsx`
- Create: `src/components/Controls.tsx`
- Create: `src/components/GameDialog.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: game modules from Task 2.
- Produces: playable relaxed and timed modes in the browser.

- [ ] **Step 1: Add pet SVG components**

Create 12 lightweight SVG React components and a `PET_TILES` configuration list.

- [ ] **Step 2: Add local storage helpers**

Create typed helpers for last mode, best relaxed time, best timed score, and previous timed reward result.

- [ ] **Step 3: Build React components**

Create header, status bar, board, tile, controls, and dialog components.

- [ ] **Step 4: Wire game state in `App.tsx`**

Implement new game, selection, matching, scoring, timer, pause, hint, shuffle, victory, and timed failure behavior.

- [ ] **Step 5: Style the app**

Add responsive desktop CSS with stable `10x8` board dimensions, clear selected states, and fixed-size controls.

- [ ] **Step 6: Verify app build**

Run: `npm run build`

Expected: build completes with exit code 0.

- [ ] **Step 7: Run tests**

Run: `npm test -- --run`

Expected: all tests pass.
