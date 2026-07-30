import { GameDialog } from "@src/components/GameDialog";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

describe("GameDialog", () => {
  test("renders exit confirmation while a game is playing", () => {
    const html = renderToStaticMarkup(
      <GameDialog
        state="playing"
        title=""
        detail=""
        primaryLabel=""
        resumeLabel=""
        exitConfirmation={{
          title: "退出当前游戏？",
          detail: "当前进度不会保存。",
          cancelLabel: "取消",
          confirmLabel: "退出",
          onCancel: () => undefined,
          onConfirm: () => undefined
        }}
        onPrimary={() => undefined}
        onResume={() => undefined}
      />
    );

    expect(html).toContain("退出当前游戏？");
    expect(html).toContain("当前进度不会保存。");
    expect(html).toContain(">取消</button>");
    expect(html).toContain(">退出</button>");
  });
});
