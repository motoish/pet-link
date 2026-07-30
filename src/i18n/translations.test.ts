import { isLanguage, LANGUAGES, t } from "@src/i18n/translations";
import { describe, expect, test } from "vitest";

describe("translations", () => {
  test("supports Chinese, English, and Japanese", () => {
    expect(LANGUAGES.map((language) => language.code)).toEqual(["zh-CN", "en", "ja"]);
    expect(isLanguage("zh-CN")).toBe(true);
    expect(isLanguage("en")).toBe(true);
    expect(isLanguage("ja")).toBe(true);
    expect(isLanguage("fr")).toBe(false);
  });

  test("translates core game labels", () => {
    expect(t("zh-CN", "app.title")).toBe("宠物连连看");
    expect(t("en", "app.title")).toBe("Pet Link");
    expect(t("ja", "app.title")).toBe("ペットリンク");
  });

  test("uses different wording for earned next-round rewards and active current-round rewards", () => {
    expect(t("zh-CN", "reward.result.shuffle", { roll: 2, allowance: 3 })).toBe(
      "打乱骰子 2 点，下局打乱 3 次"
    );
    expect(t("zh-CN", "reward.current.shuffle", { roll: 2, allowance: 3 })).toBe(
      "上局打乱骰子 2 点，本局打乱累计至 3 次"
    );
    expect(t("zh-CN", "reward.current.hint", { roll: 2, allowance: 3 })).toBe(
      "上局提示骰子 2 点，本局提示累计至 3 次"
    );
  });

  test("translates the deadlock notice and game over detail in every language", () => {
    expect(t("zh-CN", "notice.autoShuffle")).toBe("没有可以配对的宠物，自动打乱一次");
    expect(t("zh-CN", "dialog.failed.deadlock")).toBe("没有可以配对的宠物且打乱次数为 0，游戏结束");

    for (const language of LANGUAGES) {
      expect(t(language.code, "notice.autoShuffle")).not.toBe("notice.autoShuffle");
      expect(t(language.code, "dialog.failed.deadlock")).not.toBe("dialog.failed.deadlock");
      expect(t(language.code, "dialog.failed.deadlockTitle")).not.toBe(
        "dialog.failed.deadlockTitle"
      );
    }
  });

  test("translates mode menu and exit confirmation copy in every language", () => {
    const keys = [
      "menu.chooseMode",
      "menu.description",
      "menu.lastPlayed",
      "menu.best",
      "controls.exit",
      "dialog.exit.title",
      "dialog.exit.detail",
      "dialog.exit.cancel",
      "dialog.exit.confirm"
    ];

    for (const language of LANGUAGES) {
      for (const key of keys) {
        expect(t(language.code, key)).not.toBe(key);
      }
    }
  });

  test("falls back to Chinese for missing keys", () => {
    expect(t("en", "missing.key")).toBe("missing.key");
  });
});
