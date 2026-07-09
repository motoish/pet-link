import { PET_TILES } from "@src/assets/pets";
import { Board as BoardView } from "@src/components/Board";
import { Controls } from "@src/components/Controls";
import { GameDialog } from "@src/components/GameDialog";
import { Header } from "@src/components/Header";
import { formatTime, StatusBar } from "@src/components/StatusBar";
import {
  clearCells,
  countRemainingPairs,
  createBoard,
  findAvailablePair,
  getCell,
  shuffleRemainingTiles
} from "@src/game/board";
import { findConnection } from "@src/game/pathfinding";
import type { PreviousGameResult, RewardAllowances } from "@src/game/shuffleRewards";
import {
  calculateRewardAllowances,
  createBaseRewardAllowances,
  TIMED_MODE_SECONDS
} from "@src/game/shuffleRewards";
import type { Board, GameMode, Point } from "@src/game/types";
import type { Language } from "@src/i18n/translations";
import { t } from "@src/i18n/translations";
import {
  consumePendingReward,
  loadBestRelaxedTime,
  loadBestTimedScore,
  loadLanguage,
  loadLastMode,
  saveBestRelaxedTime,
  saveBestTimedScore,
  saveLanguage,
  saveLastMode,
  savePendingReward,
  savePreviousGameResult
} from "@src/storage/localRecords";
import { useEffect, useState } from "react";

type GameState = "playing" | "paused" | "won" | "failed";

const TILE_IDS = PET_TILES.map((tile) => tile.id);
const PATH_FLASH_MS = 220;
const HINT_FLASH_MS = 900;

function createFreshBoard(): Board {
  return ensureBoardHasMatch(createBoard(TILE_IDS));
}

export default function App() {
  const [mode, setMode] = useState<GameMode>(() => loadLastMode());
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [board, setBoard] = useState<Board>(() => createFreshBoard());
  const [selected, setSelected] = useState<Point | null>(null);
  const [connectionPath, setConnectionPath] = useState<Point[] | null>(null);
  const [hintedPoints, setHintedPoints] = useState<Point[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(TIMED_MODE_SECONDS);
  const [rewardAllowances, setRewardAllowances] = useState<RewardAllowances>(() => {
    return consumePendingReward() ?? createBaseRewardAllowances();
  });
  const [completionReward, setCompletionReward] = useState<RewardAllowances | null>(null);
  const [bestRelaxedTime, setBestRelaxedTime] = useState(() => loadBestRelaxedTime());
  const [bestTimedScore, setBestTimedScore] = useState(() => loadBestTimedScore());

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
    setScore(0);
    setElapsedSeconds(0);
    setRemainingSeconds(TIMED_MODE_SECONDS);
    setRewardAllowances(nextReward);
    setCompletionReward(null);
  }

  function handleModeChange(nextMode: GameMode) {
    startNewGame(nextMode);
  }

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
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

    const path = findConnection(board, selected, point);
    if (!path) {
      setSelected(point);
      return;
    }

    const nextBoard = clearCells(board, selected, point);
    const nextRemainingPairs = countRemainingPairs(nextBoard);
    const nextScore =
      score + 100 + (mode === "timed" ? Math.max(0, Math.floor(remainingSeconds / 10)) : 0);

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

  const dialog = getDialogState(
    gameState,
    mode,
    language,
    elapsedSeconds,
    remainingSeconds,
    score,
    completionReward
  );
  const activeRewardText = formatRewardSummary(
    language,
    rewardAllowances,
    "current",
    t(language, "reward.currentPrefix")
  );

  return (
    <main className="app-shell">
      <section className="game-surface">
        <Header
          mode={mode}
          language={language}
          onModeChange={handleModeChange}
          onLanguageChange={handleLanguageChange}
        />
        <section className="top-game-panel" aria-label="Game tools">
          <StatusBar
            language={language}
            mode={mode}
            elapsedSeconds={elapsedSeconds}
            remainingSeconds={remainingSeconds}
            score={score}
            shuffleAllowance={rewardAllowances.shuffleAllowance}
            hintAllowance={rewardAllowances.hintAllowance}
            bestRelaxedTime={bestRelaxedTime}
            bestTimedScore={bestTimedScore}
          />
          <Controls
            language={language}
            paused={gameState === "paused"}
            shuffleAllowance={rewardAllowances.shuffleAllowance}
            hintAllowance={rewardAllowances.hintAllowance}
            onNewGame={() => startNewGame()}
            onHint={handleHint}
            onShuffle={handleShuffle}
            onPauseToggle={handlePauseToggle}
          />
        </section>
        {activeRewardText && <p className="reward-note">{activeRewardText}</p>}
        <BoardView
          board={board}
          selected={selected}
          hinted={hintedPoints}
          connectionPath={connectionPath}
          onTileClick={handleTileClick}
        />
      </section>
      <GameDialog
        state={gameState}
        title={dialog.title}
        detail={dialog.detail}
        primaryLabel={dialog.primaryLabel}
        resumeLabel={t(language, "dialog.resume")}
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
  language: Language,
  elapsedSeconds: number,
  remainingSeconds: number,
  score: number,
  completionReward: RewardAllowances | null
) {
  if (gameState === "paused") {
    return {
      title: t(language, "dialog.paused.title"),
      detail: t(language, "dialog.paused.detail"),
      primaryLabel: t(language, "controls.newGame")
    };
  }

  if (gameState === "won") {
    const rewardText = completionReward
      ? formatRewardSummary(
          language,
          completionReward,
          "result",
          t(language, "reward.resultPrefix")
        )
      : null;
    return {
      title: t(language, "dialog.won.title"),
      detail:
        mode === "timed"
          ? `${t(language, "status.score")} ${score}，${t(language, "status.remainingTime")} ${formatTime(remainingSeconds)}。${rewardText ?? t(language, "dialog.noReward")}`
          : `${t(language, "status.elapsed")} ${formatTime(elapsedSeconds)}。`,
      primaryLabel: t(language, "dialog.playAgain")
    };
  }

  if (gameState === "failed") {
    return {
      title: t(language, "dialog.failed.title"),
      detail: t(language, "dialog.failed.detail"),
      primaryLabel: t(language, "dialog.restart")
    };
  }

  return {
    title: "",
    detail: "",
    primaryLabel: t(language, "controls.newGame")
  };
}

function samePoint(first: Point, second: Point): boolean {
  return first.row === second.row && first.column === second.column;
}

function formatRewardSummary(
  language: Language,
  reward: RewardAllowances,
  context: "current" | "result",
  prefix: string
): string | null {
  const parts: string[] = [];

  if (reward.shuffleDieRoll !== null) {
    parts.push(
      t(language, `reward.${context}.shuffle`, {
        roll: reward.shuffleDieRoll,
        allowance: reward.shuffleAllowance
      })
    );
  }

  if (reward.hintDieRoll !== null) {
    parts.push(
      t(language, `reward.${context}.hint`, {
        roll: reward.hintDieRoll,
        allowance: reward.hintAllowance
      })
    );
  }

  return parts.length > 0 ? `${prefix}：${parts.join("；")}` : null;
}
