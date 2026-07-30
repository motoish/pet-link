import { Controls } from "@src/components/Controls";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

describe("Controls", () => {
  test("renders an exit action during a game", () => {
    const html = renderToStaticMarkup(
      <Controls
        language="zh-CN"
        paused={false}
        shuffleAllowance={1}
        hintAllowance={1}
        onNewGame={() => undefined}
        onHint={() => undefined}
        onShuffle={() => undefined}
        onPauseToggle={() => undefined}
        onExit={() => undefined}
      />
    );

    expect(html).toContain(">退出</button>");
  });
});
