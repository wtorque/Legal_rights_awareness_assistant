import { expect, test } from "@playwright/test";
import { routes } from "./routes";

for (const route of routes) {
  test(`renders ${route} without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(600);
    expect(errors).toEqual([]);
  });
}

test("every nav link in the sidebar resolves", async ({ page }) => {
  await page.goto("/dashboard");
  const links = await page.locator('nav[aria-label="Main"] a').evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")));
  expect(links.length).toBeGreaterThanOrEqual(12);
  for (const href of links) {
    const res = await page.goto(href!);
    expect(res?.status(), href!).toBe(200);
  }
});
