import { ModeSelect } from "@src/components/ModeSelect";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

describe("ModeSelect", () => {
  test("renders both modes, best records, and highlights the last mode", () => {
    const html = renderToStaticMarkup(
      <ModeSelect
        language="zh-CN"
        lastMode="timed"
        bestRelaxedTime={95}
        bestTimedScore={1200}
        onStart={() => undefined}
        onLanguageChange={() => undefined}
      />
    );

    expect(html).toContain("选择游戏模式");
    expect(html).toContain("休闲");
    expect(html).toContain("1:35");
    expect(html).toContain("限时");
    expect(html).toContain("1200");
    expect(html).toContain('class="mode-option last-played"');
    expect(html).toContain("上次游玩");
  });
});
