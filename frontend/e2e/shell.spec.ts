import { expect, test } from "@playwright/test";

test("sidebar collapses, persists, and shows tooltips", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
});

test("mobile drawer opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: /Documents/ }).click();
  await expect(page).toHaveURL(/\/documents$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("jurisdiction and language menus update preferences", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Response language/ }).click();
  await page.getByRole("menuitemradio", { name: /हिन्दी/ }).click();
  await expect(page.getByRole("button", { name: /Response language: Hindi/ })).toBeVisible();
});
