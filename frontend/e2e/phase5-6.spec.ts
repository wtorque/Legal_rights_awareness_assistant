import { expect, test } from "@playwright/test";

test("knowledge: filters and detail page show verification metadata", async ({ page }) => {
  await page.goto("/knowledge");
  await expect(page.getByText(/\d+ sources?/)).toBeVisible({ timeout: 10_000 });
  await page.getByLabel("Country").selectOption("CA");
  await expect(page.getByRole("link", { name: /Sample Guide to Small Claims/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Tenancy Act/ })).toHaveCount(0);
  await page.getByLabel("Country").selectOption("all");
  await page.getByRole("button", { name: "Legal aid information" }).click();
  await page.getByRole("link", { name: /Sample Legal Services Guidance/ }).click();
  await expect(page.getByText("Never verified")).toBeVisible();
  await expect(page.getByText("Issuing authority")).toBeVisible();
  await expect(page.getByText("Effective date")).toBeVisible();
});

test("evidence graph: select node shows details, search frames matches, fit works", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/evidence");
  const node = page.locator(".react-flow__node", { hasText: "Security deposits" }).first();
  await expect(node).toBeVisible({ timeout: 15_000 });
  await node.click();
  await expect(page.getByRole("heading", { name: "Security deposits" })).toBeVisible();
  await expect(page.getByText("Connections (")).toBeVisible();
  await expect(page.getByText("Sample · not verified")).toBeVisible();
  await page.getByLabel("Search nodes").fill("tenancy act");
  await expect(page.getByText(/\d+ match/)).toBeVisible();
  await page.getByRole("button", { name: "Fit to screen" }).click();
  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect(page.getByText("Select a node", { exact: true })).toBeVisible();
});

test("legal aid: lists checked organisations and never invents contacts", async ({ page }) => {
  await page.goto("/legal-aid");
  await expect(page.getByRole("heading", { name: "National Legal Services Authority (NALSA)" })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("link", { name: "15100" })).toHaveAttribute("href", "tel:15100");
  await expect(page.getByRole("link", { name: /nalsa.gov.in/ })).toHaveAttribute("href", "https://nalsa.gov.in");
  await page.getByLabel("Country").selectOption("US");
  await expect(page.getByRole("heading", { name: /Legal Services Corporation/ })).toBeVisible();
  await page.getByLabel("Country").selectOption("GB");
  await page.getByLabel("Type of help").selectOption("government");
  await expect(page.getByRole("heading", { name: "GOV.UK: Legal aid" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Citizens Advice" })).toHaveCount(0);
});

test("settings: theme, text size, reduced motion, and export work", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "Dark" }).check({ force: true });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("radio", { name: "Extra large" }).check({ force: true });
  await expect.poll(() => page.evaluate(() => document.documentElement.style.fontSize)).toBe("125%");
  await page.getByRole("radiogroup", { name: "Reduced motion" }).getByText("On").click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.reducedMotion)).toBe("true");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export" }).click()]);
  expect(download.suggestedFilename()).toBe("aequa-local-data.json");
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => document.documentElement.style.fontSize)).toBe("125%");
});

test("settings: delete local data resets state after confirmation", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Preferred response language").selectOption("hi");
  await page.getByRole("button", { name: "Delete all" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete everything" }).click();
  await page.waitForLoadState("load");
  await expect(page.getByLabel("Preferred response language")).toHaveValue("en");
});

test("global search: keyboard shortcut, grouped results, keyboard navigation, recent searches", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle"); // shortcuts attach after hydration
  await page.keyboard.press("Control+k");
  const input = page.getByPlaceholder(/Search rights/);
  await expect(input).toBeFocused();
  await input.fill("deposit");
  const list = page.getByRole("dialog").getByRole("listbox");
  await expect(list.getByText("Rights", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(list.getByText("Conversations", { exact: true })).toBeVisible();
  await expect(list.getByText("Action plans", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).not.toHaveURL(/\/dashboard$/);

  await page.keyboard.press("Control+k");
  await expect(page.getByText("Recent searches")).toBeVisible();
  await page.getByPlaceholder(/Search rights/).fill("qqqqzzz");
  await expect(page.getByText("No results for")).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press("Escape");
  await expect(page.getByPlaceholder(/Search rights/)).toHaveCount(0);
});

test("notifications: mark all read and clear", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Notifications, 3 unread/ }).click();
  await page.getByRole("button", { name: "Mark all read" }).click();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByText("You're all caught up")).toBeVisible();
});

test("saved resources: save a topic then remove it", async ({ page }) => {
  await page.goto("/rights/security-deposits");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/saved");
  await expect(page.getByText("Security deposits")).toBeVisible();
  await page.getByRole("button", { name: /Remove Security deposits from saved/ }).click();
  await expect(page.getByText("Nothing saved yet")).toBeVisible();
});

test("responsive: no horizontal overflow on primary routes at phone, tablet, laptop", async ({ page }) => {
  const routes = ["/dashboard", "/assistant", "/documents", "/documents/doc-rental", "/rights", "/action-plans", "/knowledge", "/evidence", "/legal-aid", "/settings"];
  for (const [w, h] of [[390, 844], [820, 1180], [1280, 800]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const r of routes) {
      await page.goto(r);
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${r} @${w}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("keyboard: skip link and sidebar shortcut", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Control+b");
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
});
