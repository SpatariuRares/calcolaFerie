import { expect, test } from "@playwright/test";

test("golden path: 10 vacation days → Calcola → at least one result row", async ({ page }) => {
  await page.goto("/");

  await page.locator('input[name="totalVacationDays"]').fill("10");
  await page.getByRole("button", { name: "Calcola" }).click();

  await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });
});
