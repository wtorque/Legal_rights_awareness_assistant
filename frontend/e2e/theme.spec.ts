import { expect, test } from "@playwright/test";

test("toggle switches theme and persists across reload with no flash", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/dashboard");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
  await expect(html).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("aequa-theme"))).toBe("dark");

  await page.reload();
  // The inline script must apply the class before hydration.
  await expect(html).toHaveClass(/dark/);
});

test("first paint already uses stored theme", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("aequa-theme", "dark"));
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  const bg = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  expect(bg).toBe(true);
});

test("system preference is followed when no choice stored", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/dashboard");
  await expect(page.locator("html")).toHaveClass(/dark/);
});
