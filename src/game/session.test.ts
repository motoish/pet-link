import { createMenuSession, exitSession, startSession } from "@src/game/session";
import { describe, expect, test } from "vitest";

describe("game session", () => {
  test("starts on the menu with the last mode highlighted", () => {
    expect(createMenuSession("timed")).toEqual({
      phase: "menu",
      mode: "timed"
    });
  });

  test("starts the selected game mode", () => {
    const menu = createMenuSession("relaxed");

    expect(startSession(menu, "timed")).toEqual({
      phase: "game",
      mode: "timed"
    });
  });

  test("returns to the menu while preserving the played mode", () => {
    const game = startSession(createMenuSession("relaxed"), "timed");

    expect(exitSession(game)).toEqual({
      phase: "menu",
      mode: "timed"
    });
  });
});
