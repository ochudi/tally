import type { Page } from "playwright";

// tsx/esbuild compiles our in-page evaluate callbacks with keep-names, which
// references a __name helper that does not exist in the browser. Install a no-op
// shim before navigation so the serialized functions run in the page context.
export async function ensureNameShim(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const g = globalThis as Record<string, unknown>;
    if (typeof g.__name !== "function") g.__name = (fn: unknown) => fn;
  });
}
