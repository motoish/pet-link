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
  calculateRewardAllowances,
  createBaseRewardAllowances,
  TIMED_MODE_SECONDS,
  type PreviousGameResult,
  type RewardAllowances
} from "./game/shuffleRewards";
import type { Board, GameMode, Point } from "./game/types";
import {
  consumePendingReward,
  loadBestRelaxedTime,
  loadBestTimedScore,
  loadLastMode,
  saveBestRelaxedTime,
  saveBestTimedScore,
  saveLastMode,
  savePendingReward,
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
  const [rewardAllowances, setRewardAllowances] = useState<RewardAllowances>(() => {
    return consumePendingReward() ?? createBaseRewardAllowances();
  });
  const [completionReward, setCompletionReward] = useState<RewardAllowances | null>(null);
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
    const nextReward = consumePendingReward() ?? createBaseRewardAllowances();
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
    setRewardAllowances(nextReward);
    setCompletionReward(null);
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
      const reward = calculateRewardAllowances({ previousGame: result });
      savePendingReward(reward);
      setCompletionReward(reward);
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
    setCompletionReward(null);
    saveBestRelaxedTime(elapsedSeconds);
    setBestRelaxedTime(loadBestRelaxedTime());
  }

  function handleHint() {
    if (gameState !== "playing" || rewardAllowances.hintAllowance <= 0) {
      return;
    }

    const hint = findAvailablePair(board);
    if (!hint) {
      setHintedPoints([]);
      return;
    }

    setHintedPoints([hint.first, hint.second]);
    setRewardAllowances((current) => ({
      ...current,
      hintAllowance: current.hintAllowance - 1
    }));
    window.setTimeout(() => setHintedPoints([]), HINT_FLASH_MS);
  }

  function handleShuffle() {
    if (gameState !== "playing" || rewardAllowances.shuffleAllowance <= 0) {
      return;
    }

    setBoard((currentBoard) => ensureBoardHasMatch(shuffleRemainingTiles(currentBoard)));
    setSelected(null);
    setConnectionPath(null);
    setHintedPoints([]);
    setRewardAllowances((current) => ({
      ...current,
      shuffleAllowance: current.shuffleAllowance - 1
    }));
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

  const dialog = getDialogState(gameState, mode, elapsedSeconds, remainingSeconds, score, completionReward);
  const activeRewardText = formatRewardSummary(rewardAllowances, "本局奖励");

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
          shuffleAllowance={rewardAllowances.shuffleAllowance}
          hintAllowance={rewardAllowances.hintAllowance}
          bestRelaxedTime={bestRelaxedTime}
          bestTimedScore={bestTimedScore}
        />
        {activeRewardText && <p className="reward-note">{activeRewardText}</p>}
        <BoardView
          board={board}
          selected={selected}
          hinted={hintedPoints}
          connectionPath={connectionPath}
          onTileClick={handleTileClick}
        />
        <Controls
          paused={gameState === "paused"}
          shuffleAllowance={rewardAllowances.shuffleAllowance}
          hintAllowance={rewardAllowances.hintAllowance}
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
  completionReward: RewardAllowances | null
) {
  if (gameState === "paused") {
    return {
      title: "已暂停",
      detail: "休息一下，棋盘会保持原样。",
      primaryLabel: "新游戏"
    };
  }

  if (gameState === "won") {
    const rewardText = completionReward ? formatRewardSummary(completionReward, "奖励结果") : null;
    return {
      title: "通关",
      detail:
        mode === "timed"
          ? `得分 ${score}，剩余 ${formatTime(remainingSeconds)}。${rewardText ?? "未获得额外奖励。"}`
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
    detail: "",
    primaryLabel: "新游戏"
  };
}

function samePoint(first: Point, second: Point): boolean {
  return first.row === second.row && first.column === second.column;
}

function formatRewardSummary(reward: RewardAllowances, prefix: string): string | null {
  const parts: string[] = [];

  if (reward.shuffleDieRoll !== null) {
    parts.push(`打乱骰子 ${reward.shuffleDieRoll} 点，下局打乱 ${reward.shuffleAllowance} 次`);
  }

  if (reward.hintDieRoll !== null) {
    parts.push(`提示骰子 ${reward.hintDieRoll} 点，下局提示 ${reward.hintAllowance} 次`);
  }

  return parts.length > 0 ? `${prefix}：${parts.join("；")}` : null;
}
