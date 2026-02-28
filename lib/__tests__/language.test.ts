import { describe, it, expect } from "vitest";
import { detectLanguage } from "../language";

describe("detectLanguage", () => {
  it("returns zh for text with significant Chinese characters", () => {
    expect(detectLanguage("新加坡政府宣布新的政策。请查看官方网站。")).toBe("zh");
    expect(detectLanguage("This is mixed 新加坡 content with 中文")).toBe("zh");
  });

  it("returns en for short text", () => {
    expect(detectLanguage("Hi")).toBe("en");
  });

  it("returns en for English-only text", () => {
    expect(detectLanguage("The government announced new measures today.")).toBe("en");
  });
});
