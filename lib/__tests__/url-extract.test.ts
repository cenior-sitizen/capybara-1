import { describe, it, expect, vi } from "vitest";

describe("extractMainText (via fetchAndExtractText)", () => {
  it("extracts text from HTML", async () => {
    const { fetchAndExtractText } = await import("../url-extract");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`
        <html><body>
          <script>ignore();</script>
          <p>Main content here.</p>
          <p>Second paragraph.</p>
        </body></html>
      `),
    });
    const text = await fetchAndExtractText("https://example.com");
    expect(text).toContain("Main content");
    expect(text).toContain("Second paragraph");
    expect(text).not.toContain("ignore()");
  });
});
