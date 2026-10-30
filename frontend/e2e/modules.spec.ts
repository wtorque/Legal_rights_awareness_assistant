import { expect, test } from "@playwright/test";

test("assistant: question streams a structured sample answer, then copy/feedback/regenerate work", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/assistant");
  await page.getByRole("button", { name: "New conversation" }).first().click();
  await page.getByLabel("Describe your legal situation").fill("My landlord has not returned my deposit");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status", { name: "Assistant is writing" })).toBeVisible();
  await expect(page.getByText("Relevant legal provisions")).toBeVisible({ timeout: 10_000 });
  for (const heading of ["Potentially applicable rights", "Practical next steps", "Important limitations", "Source references"]) {
    await expect(page.getByText(heading, { exact: true })).toBeVisible();
  }
  // every source must be labelled as sample, never verified
  await expect(page.getByText("Sample data · not verified").first()).toBeVisible();

  await page.getByRole("button", { name: "Copy answer" }).click();
  await expect(page.getByText("Answer copied")).toBeVisible();
  await page.getByRole("button", { name: "Mark helpful" }).click();
  await expect(page.getByRole("button", { name: "Mark helpful" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Regenerate answer" }).click();
  await expect(page.getByText("Relevant legal provisions")).toBeVisible({ timeout: 10_000 });
});

test("assistant: rename and delete a conversation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/assistant");
  const first = page.getByRole("complementary", { name: "Conversations" }).getByRole("button", { name: "Security deposit not returned", exact: true });
  await expect(first).toBeVisible();
  await page.getByRole("button", { name: "Options for Security deposit not returned" }).click();
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await page.getByLabel("Conversation name").fill("Renamed chat");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Renamed chat", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Options for Renamed chat" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("button", { name: "Renamed chat", exact: true })).toHaveCount(0);
});

test("dashboard question hands off to the assistant", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByLabel("Describe your legal situation").fill("A shop refuses a refund for a defective product");
  await page.getByRole("button", { name: /^Ask/ }).click();
  await expect(page).toHaveURL(/\/assistant$/);
  await expect(page.getByText("Source references")).toBeVisible({ timeout: 10_000 });
});

test("dashboard discovery filters topics and expands sample learning resources", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Housing" }).click();
  await expect(page.getByText("Showing 1 housing topic.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Security deposits/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Termination and notice/ })).toHaveCount(0);

  await page.getByText("Reading a rental agreement: what to check first").click();
  await expect(
    page.getByText(/Use this sample guide to review the parties, dates, amounts and responsibilities/),
  ).toBeVisible();
});

test("documents: analysis shows clauses, flags and search works in the viewer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/documents/doc-rental");
  await expect(page.getByRole("status")).toBeVisible(); // scanning overlay
  await expect(page.getByRole("tab", { name: /Clauses/ })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("tab", { name: /Clauses/ }).click();
  await expect(page.getByText("Requires attention").first()).toBeVisible();
  await page.getByLabel("Search in document").fill("deposit");
  await expect(page.locator("mark").first()).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2 / 2")).toBeVisible();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByRole("button", { name: "Reset zoom" })).toHaveText("115%");
});

test("documents: comparison lists added, removed and modified clauses", async ({ page }) => {
  await page.goto("/documents/compare");
  await expect(page.getByText("Modified", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Added", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Removed", { exact: true }).first()).toBeVisible();
  await page.getByRole("tab", { name: /^Added/ }).click();
  await expect(page.getByRole("heading", { name: "Maintenance charge" })).toBeVisible();
});

test("documents: rejects non-PDF and accepts a PDF", async ({ page }) => {
  await page.goto("/documents");
  await page.setInputFiles('input[type="file"]', { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
  await expect(page.getByText("notes.txt isn't a PDF.")).toBeVisible();
  await page.setInputFiles('input[type="file"]', { name: "mine.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 test") });
  await expect(page.getByText("mine.pdf added")).toBeVisible({ timeout: 10_000 });
});

test("rights catalogue: coverage warning, search, facets, load-more data, detail with provenance", async ({ page }) => {
  await page.goto("/rights");
  await expect(page.getByRole("region", { name: "Coverage" })).toContainText("coverage is not complete");
  await expect(page.getByRole("link", { name: /Security deposits/ }).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Showing \d+ of \d+/)).toBeVisible();
  await page.getByLabel("Search rights").fill("notice");
  await expect(page.getByRole("link", { name: /Security deposits/ })).toHaveCount(0);
  await page.getByLabel("Search rights").fill("zzzz");
  await expect(page.getByText("No rights match")).toBeVisible();
  await page.getByLabel("Search rights").fill("");
  await page.getByRole("button", { name: /Consumer Protection/ }).click();
  await page.getByRole("link", { name: /Defective goods and refunds/ }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Defective goods and refunds" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Official wording" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Source and verification" })).toBeVisible();
  await expect(page.getByText("Fictional sample").first()).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.goto("/saved");
});

test("action plans: complete steps, edit checklist, persist across reload", async ({ page }) => {
  await page.goto("/action-plans/plan-deposit");
  await expect(page.getByText("2 of 5 steps complete")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("checkbox", { name: "Mark step 3 done" }).click();
  await expect(page.getByText("3 of 5 steps complete")).toBeVisible();
  await page.getByLabel("Add checklist item").fill("Bank statement showing deposit");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Bank statement showing deposit")).toBeVisible();
  await page.reload();
  await expect(page.getByText("3 of 5 steps complete")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Remove Bank statement showing deposit" }).click();
  await expect(page.getByText("Bank statement showing deposit")).toHaveCount(0);
});

test("action plans: create a plan with validation", async ({ page }) => {
  await page.goto("/action-plans");
  await page.getByRole("button", { name: "New plan" }).click();
  await page.getByRole("button", { name: "Create plan" }).click();
  await expect(page.getByText("Give the plan a short name")).toBeVisible();
  await page.getByLabel("Plan name").fill("My own plan");
  await page.getByLabel("What happened?").fill("Something happened that I want to plan for.");
  await page.getByRole("button", { name: "Create plan" }).click();
  await expect(page).toHaveURL(/\/action-plans\/plan-/);
  await expect(page.getByRole("heading", { level: 1, name: "My own plan" })).toBeVisible();
});
