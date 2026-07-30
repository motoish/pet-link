import { Header } from "@src/components/Header";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

describe("Header", () => {
  test("keeps the in-game header free of mode and language switching", () => {
    const html = renderToStaticMarkup(<Header language="zh-CN" />);

    expect(html).toContain("宠物连连看");
    expect(html).toContain("10 x 8");
    expect(html).not.toContain("<select");
    expect(html).not.toContain(">休闲</button>");
    expect(html).not.toContain(">限时</button>");
  });
});
