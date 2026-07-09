export const LANGUAGES = [
  { code: "zh-CN", label: "中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" }
] as const;

export type Language = (typeof LANGUAGES)[number]["code"];

type TranslationKey =
  | "app.eyebrow"
  | "app.title"
  | "mode.relaxed"
  | "mode.timed"
  | "settings.language"
  | "board.size"
  | "status.elapsed"
  | "status.remainingTime"
  | "status.score"
  | "status.moves"
  | "status.remainingPairs"
  | "status.shuffle"
  | "status.hint"
  | "status.best"
  | "controls.newGame"
  | "controls.hint"
  | "controls.shuffle"
  | "controls.pause"
  | "controls.resume"
  | "dialog.paused.title"
  | "dialog.paused.detail"
  | "dialog.won.title"
  | "dialog.failed.title"
  | "dialog.failed.detail"
  | "dialog.playAgain"
  | "dialog.restart"
  | "dialog.resume"
  | "dialog.noReward"
  | "reward.currentPrefix"
  | "reward.resultPrefix"
  | "reward.result.shuffle"
  | "reward.result.hint"
  | "reward.current.shuffle"
  | "reward.current.hint";

const translations: Record<Language, Record<TranslationKey, string>> = {
  "zh-CN": {
    "app.eyebrow": "Pet Link",
    "app.title": "宠物连连看",
    "mode.relaxed": "休闲",
    "mode.timed": "限时",
    "settings.language": "语言",
    "board.size": "10 x 8",
    "status.elapsed": "用时",
    "status.remainingTime": "剩余",
    "status.score": "分数",
    "status.moves": "步数",
    "status.remainingPairs": "剩余",
    "status.shuffle": "打乱",
    "status.hint": "提示",
    "status.best": "最佳",
    "controls.newGame": "新游戏",
    "controls.hint": "提示",
    "controls.shuffle": "打乱",
    "controls.pause": "暂停",
    "controls.resume": "继续",
    "dialog.paused.title": "已暂停",
    "dialog.paused.detail": "休息一下，棋盘会保持原样。",
    "dialog.won.title": "通关",
    "dialog.failed.title": "时间到",
    "dialog.failed.detail": "这局没有获得打乱奖励。",
    "dialog.playAgain": "再来一局",
    "dialog.restart": "重新开始",
    "dialog.resume": "继续",
    "dialog.noReward": "未获得额外奖励。",
    "reward.currentPrefix": "本局奖励",
    "reward.resultPrefix": "奖励结果",
    "reward.result.shuffle": "打乱骰子 {roll} 点，下局打乱 {allowance} 次",
    "reward.result.hint": "提示骰子 {roll} 点，下局提示 {allowance} 次",
    "reward.current.shuffle": "上局打乱骰子 {roll} 点，本局打乱 {allowance} 次",
    "reward.current.hint": "上局提示骰子 {roll} 点，本局提示 {allowance} 次"
  },
  en: {
    "app.eyebrow": "Pet Link",
    "app.title": "Pet Link",
    "mode.relaxed": "Relaxed",
    "mode.timed": "Timed",
    "settings.language": "Language",
    "board.size": "10 x 8",
    "status.elapsed": "Time",
    "status.remainingTime": "Left",
    "status.score": "Score",
    "status.moves": "Moves",
    "status.remainingPairs": "Pairs",
    "status.shuffle": "Shuffle",
    "status.hint": "Hint",
    "status.best": "Best",
    "controls.newGame": "New Game",
    "controls.hint": "Hint",
    "controls.shuffle": "Shuffle",
    "controls.pause": "Pause",
    "controls.resume": "Resume",
    "dialog.paused.title": "Paused",
    "dialog.paused.detail": "Take a break. The board will stay as it is.",
    "dialog.won.title": "Cleared",
    "dialog.failed.title": "Time Up",
    "dialog.failed.detail": "No reward was earned this round.",
    "dialog.playAgain": "Play Again",
    "dialog.restart": "Restart",
    "dialog.resume": "Resume",
    "dialog.noReward": "No extra reward earned.",
    "reward.currentPrefix": "This round reward",
    "reward.resultPrefix": "Reward result",
    "reward.result.shuffle": "Shuffle die rolled {roll}; next round has {allowance} shuffles",
    "reward.result.hint": "Hint die rolled {roll}; next round has {allowance} hints",
    "reward.current.shuffle": "Previous shuffle die rolled {roll}; this round has {allowance} shuffles",
    "reward.current.hint": "Previous hint die rolled {roll}; this round has {allowance} hints"
  },
  ja: {
    "app.eyebrow": "Pet Link",
    "app.title": "ペットリンク",
    "mode.relaxed": "リラックス",
    "mode.timed": "タイム",
    "settings.language": "言語",
    "board.size": "10 x 8",
    "status.elapsed": "時間",
    "status.remainingTime": "残り",
    "status.score": "スコア",
    "status.moves": "手数",
    "status.remainingPairs": "残り",
    "status.shuffle": "シャッフル",
    "status.hint": "ヒント",
    "status.best": "ベスト",
    "controls.newGame": "新規",
    "controls.hint": "ヒント",
    "controls.shuffle": "シャッフル",
    "controls.pause": "一時停止",
    "controls.resume": "再開",
    "dialog.paused.title": "一時停止",
    "dialog.paused.detail": "少し休憩。盤面はそのままです。",
    "dialog.won.title": "クリア",
    "dialog.failed.title": "時間切れ",
    "dialog.failed.detail": "このラウンドでは報酬を獲得できませんでした。",
    "dialog.playAgain": "もう一度",
    "dialog.restart": "再開",
    "dialog.resume": "再開",
    "dialog.noReward": "追加報酬はありません。",
    "reward.currentPrefix": "今回の報酬",
    "reward.resultPrefix": "報酬結果",
    "reward.result.shuffle": "シャッフルのサイコロは {roll}、次回は {allowance} 回",
    "reward.result.hint": "ヒントのサイコロは {roll}、次回は {allowance} 回",
    "reward.current.shuffle": "前回のシャッフルサイコロは {roll}、今回は {allowance} 回",
    "reward.current.hint": "前回のヒントサイコロは {roll}、今回は {allowance} 回"
  }
};

export function isLanguage(value: string): value is Language {
  return LANGUAGES.some((language) => language.code === value);
}

export function t(language: Language, key: string, values: Record<string, string | number> = {}): string {
  const template = translations[language][key as TranslationKey] ?? translations["zh-CN"][key as TranslationKey] ?? key;

  return Object.entries(values).reduce((text, [name, value]) => {
    return text.split(`{${name}}`).join(String(value));
  }, template);
}
