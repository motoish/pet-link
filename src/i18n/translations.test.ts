import { describe, expect, test } from "vitest";
import { isLanguage, LANGUAGES, t } from "./translations";

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

  test("falls back to Chinese for missing keys", () => {
    expect(t("en", "missing.key")).toBe("missing.key");
  });
});
