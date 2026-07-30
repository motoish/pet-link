import { Header } from "@src/components/Header";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

describe("Header", () => {
  test("keeps settings visible without in-game mode switching", () => {
    const html = renderToStaticMarkup(
      <Header language="zh-CN" onLanguageChange={() => undefined} />
    );

    expect(html).toContain("宠物连连看");
    expect(html).toContain("中文");
    expect(html).toContain("10 x 8");
    expect(html).not.toContain(">休闲</button>");
    expect(html).not.toContain(">限时</button>");
  });
});
