import { useEffect, useMemo, useState } from "react";
import { PET_TILES } from "./assets/pets";
import { Board as BoardView } from "./components/Board";
import { Controls } from "./components/Controls";
import { GameDialog } from "./components/GameDialog";
import { Header } from "./components/Header";
import { formatTime, StatusBar } from "./components/StatusBar";
import {
  clearCells,
  countRemainingPairs,
  createBoard,
  findAvailablePair,
  getCell,
  shuffleRemainingTiles
} from "./game/board";
import { findConnection } from "./game/pathfinding";
import {
  calculateNextShuffleAllowance,
  TIMED_MODE_SECONDS,
  type PreviousGameResult,
  type ShuffleRewardResult
} from "./game/shuffleRewards";
import type { Board, GameMode, Point } from "./game/types";
import {
  loadBestRelaxedTime,
  loadBestTimedScore,
  loadLastMode,
  loadPreviousGameResult,
  saveBestRelaxedTime,
  saveBestTimedScore,
  saveLastMode,
  savePreviousGameResult
} from "./storage/localRecords";

type GameState = "playing" | "paused" | "won" | "failed";

const TILE_IDS = PET_TILES.map((tile) => tile.id);
const PATH_FLASH_MS = 220;
const HINT_FLASH_MS = 900;

function createFreshBoard(): Board {
  return ensureBoardHasMatch(createBoard(TILE_IDS));
}

export default function App() {
  const [mode, setMode] = useState<GameMode>(() => loadLastMode());
  const [board, setBoard] = useState<Board>(() => createFreshBoard());
  const [selected, setSelected] = useState<Point | null>(null);
  const [connectionPath, setConnectionPath] = useState<Point[] | null>(null);
  const [hintedPoints, setHintedPoints] = useState<Point[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(TIMED_MODE_SECONDS);
  const [shuffleAllowance, setShuffleAllowance] = useState(() => {
    return calculateNextShuffleAllowance({ previousGame: loadPreviousGameResult() }).allowance;
  });
  const [lastReward, setLastReward] = useState<ShuffleRewardResult | null>(null);
  const [bestRelaxedTime, setBestRelaxedTime] = useState(() => loadBestRelaxedTime());
  const [bestTimedScore, setBestTimedScore] = useState(() => loadBestTimedScore());

  const remainingPairs = useMemo(() => countRemainingPairs(board), [board]);

  useEffect(() => {
    if (gameState !== "playing") {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
      if (mode === "timed") {
        setRemainingSeconds((seconds) => {
          if (seconds <= 1) {
            const failedResult: PreviousGameResult = {
              mode: "timed",
              completed: false,
              remainingSeconds: 0
            };
            savePreviousGameResult(failedResult);
            setGameState("failed");
            return 0;
          }
          return seconds - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState, mode]);

  function startNewGame(nextMode = mode) {
    const reward = calculateNextShuffleAllowance({ previousGame: loadPreviousGameResult() });
    setMode(nextMode);
    saveLastMode(nextMode);
    setBoard(createFreshBoard());
    setSelected(null);
    setConnectionPath(null);
    setHintedPoints([]);
    setGameState("playing");
    setMoves(0);
    setScore(0);
    setElapsedSeconds(0);
    setRemainingSeconds(TIMED_MODE_SECONDS);
    setShuffleAllowance(reward.allowance);
    setLastReward(reward.dieRoll === null ? null : reward);
  }

  function handleModeChange(nextMode: GameMode) {
    startNewGame(nextMode);
  }

  function handleTileClick(point: Point) {
    if (gameState !== "playing") {
      return;
    }

    const cell = getCell(board, point);
    if (!cell.tileId) {
      return;
    }

    if (!selected) {
      setSelected(point);
      return;
    }

    if (samePoint(selected, point)) {
      setSelected(null);
      return;
    }

    setMoves((value) => value + 1);
    const path = findConnection(board, selected, point);
    if (!path) {
      setSelected(point);
      return;
    }

    const nextBoard = clearCells(board, selected, point);
    const nextRemainingPairs = countRemainingPairs(nextBoard);
    const nextScore = score + 100 + (mode === "timed" ? Math.max(0, Math.floor(remainingSeconds / 10)) : 0);

    setBoard(nextBoard);
    setConnectionPath(path);
    window.setTimeout(() => setConnectionPath(null), PATH_FLASH_MS);
    setSelected(null);
    setHintedPoints([]);
    setScore(nextScore);

    if (nextRemainingPairs === 0) {
      finishGame(nextScore);
    }
  }

  function finishGame(finalScore: number) {
    setGameState("won");

    if (mode === "timed") {
      const result: PreviousGameResult = {
        mode: "timed",
        completed: true,
        remainingSeconds
      };
      savePreviousGameResult(result);
      saveBestTimedScore(finalScore);
      setBestTimedScore(loadBestTimedScore());
      return;
    }

    const result: PreviousGameResult = {
      mode: "relaxed",
      completed: true,
      remainingSeconds: null
    };
    savePreviousGameResult(result);
    saveBestRelaxedTime(elapsedSeconds);
    setBestRelaxedTime(loadBestRelaxedTime());
  }

  function handleHint() {
    if (gameState !== "playing") {
      return;
    }

    const hint = findAvailablePair(board);
    if (!hint) {
      setHintedPoints([]);
      return;
    }

    setHintedPoints([hint.first, hint.second]);
    window.setTimeout(() => setHintedPoints([]), HINT_FLASH_MS);
  }

  function handleShuffle() {
    if (gameState !== "playing" || shuffleAllowance <= 0) {
      return;
    }

    setBoard((currentBoard) => ensureBoardHasMatch(shuffleRemainingTiles(currentBoard)));
    setSelected(null);
    setConnectionPath(null);
    setHintedPoints([]);
    setShuffleAllowance((value) => value - 1);
  }

  function handlePauseToggle() {
    setGameState((state) => {
      if (state === "playing") {
        return "paused";
      }
      if (state === "paused") {
        return "playing";
      }
      return state;
    });
  }

  const dialog = getDialogState(gameState, mode, elapsedSeconds, remainingSeconds, score, lastReward);

  return (
    <main className="app-shell">
      <section className="game-surface">
        <Header mode={mode} onModeChange={handleModeChange} />
        <StatusBar
          mode={mode}
          elapsedSeconds={elapsedSeconds}
          remainingSeconds={remainingSeconds}
          score={score}
          moves={moves}
          remainingPairs={remainingPairs}
          shuffleAllowance={shuffleAllowance}
          bestRelaxedTime={bestRelaxedTime}
          bestTimedScore={bestTimedScore}
        />
        {lastReward && (
          <p className="reward-note">
            上局剩余时间达标，骰子 {lastReward.dieRoll} 点，本局打乱 {lastReward.allowance} 次
          </p>
        )}
        <BoardView
          board={board}
          selected={selected}
          hinted={hintedPoints}
          connectionPath={connectionPath}
          onTileClick={handleTileClick}
        />
        <Controls
          paused={gameState === "paused"}
          shuffleAllowance={shuffleAllowance}
          onNewGame={() => startNewGame()}
          onHint={handleHint}
          onShuffle={handleShuffle}
          onPauseToggle={handlePauseToggle}
        />
      </section>
      <GameDialog
        state={gameState}
        title={dialog.title}
        detail={dialog.detail}
        primaryLabel={dialog.primaryLabel}
        onPrimary={() => startNewGame()}
        onResume={() => setGameState("playing")}
      />
    </main>
  );
}

function ensureBoardHasMatch(board: Board): Board {
  let nextBoard = board;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (findAvailablePair(nextBoard)) {
      return nextBoard;
    }
    nextBoard = shuffleRemainingTiles(nextBoard);
  }

  return nextBoard;
}

function getDialogState(
  gameState: GameState,
  mode: GameMode,
  elapsedSeconds: number,
  remainingSeconds: number,
  score: number,
  lastReward: ShuffleRewardResult | null
) {
  if (gameState === "paused") {
    return {
      title: "已暂停",
      detail: "休息一下，棋盘会保持原样。",
      primaryLabel: "新游戏"
    };
  }

  if (gameState === "won") {
    const rewardText = mode === "timed" && remainingSeconds >= 108 ? " 下一局会掷骰奖励打乱次数。" : "";
    return {
      title: "通关",
      detail:
        mode === "timed"
          ? `得分 ${score}，剩余 ${formatTime(remainingSeconds)}。${rewardText}`
          : `用时 ${formatTime(elapsedSeconds)}。`,
      primaryLabel: "再来一局"
    };
  }

  if (gameState === "failed") {
    return {
      title: "时间到",
      detail: "这局没有获得打乱奖励。",
      primaryLabel: "重新开始"
    };
  }

  return {
    title: "",
    detail: lastReward ? `本局打乱 ${lastReward.allowance} 次。` : "",
    primaryLabel: "新游戏"
  };
}

function samePoint(first: Point, second: Point): boolean {
  return first.row === second.row && first.column === second.column;
}
