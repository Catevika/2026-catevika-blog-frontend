import { test, expect } from "@playwright/test";
import { loginUI } from "../helpers";
import { PexelsResponse } from "../../src/types";

// 1×1 transparent PNG
const TRANSPARENT_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2N7WcAAAAASUVORK5CYII=";

const dataUrl = `data:image/png;base64,${TRANSPARENT_PNG}`;

// Mock matching YOUR EXACT TYPES
const mockPexels: PexelsResponse = {
  page: 1,
  per_page: 10,
  total_results: 1,
  total_pages: 1,
  next_page: undefined,
  prev_page: undefined,
  photos: [
    {
      id: 999,
      url: "https://example.com/photo", // MUST be real URL
      alt: "Mock Pexels Photo",
      photographer: "Mock Photographer",
      photographer_url: "https://example.com/author", // MUST be real URL
      src: {
        original: "https://example.com/original.jpg", // MUST be real URL
        medium: dataUrl, // UI uses this
        large: dataUrl,
      },
    },
  ],
};

test.describe("Pexels Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept BOTH endpoints your hook may call
    await page.route("**/v1//search?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPexels),
      });
    });

    await page.route("**/v1//curated?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockPexels),
      });
    });

    await loginUI(page, "john@gmail.com", "12345678");
  });

  // Helper: trigger Zustand search
  async function triggerSearch(page: any, query: string) {
    const input = page.getByPlaceholder(/Try/);
    await input.fill(query);
    await input.press("Enter"); // ← REQUIRED
  }

  test("enlarges and closes photo", async ({ page }) => {
    await triggerSearch(page, "mountains");

    const card = page.locator(".pexels-results-list li").first();
    await expect(card).toBeVisible();

    await card.getByRole("button", { name: /enlarge/i }).click();

    const lightbox = page.locator(".lightbox-card");
    await expect(lightbox).toBeVisible();

    await page.getByRole("button", { name: "Close enlarged photo" }).click();
    await expect(lightbox).not.toBeVisible();
  });

  test("inserts photo markdown", async ({ page }) => {
    await triggerSearch(page, "mountains");

    const card = page.locator(".pexels-results-list li").first();
    await expect(card).toBeVisible();

    await card.getByRole("button", { name: /insert/i }).click();

    const editor = page.locator('textarea[id$="-textarea"]');
    await expect(editor).toHaveValue(/!\[Mock Pexels Photo]/);
  });

  test("drag inserts markdown", async ({ page }) => {
    await triggerSearch(page, "mountains");

    const card = page.locator(".pexels-results-list li").first();
    await expect(card).toBeVisible();

    const editor = page.locator('textarea[id$="-textarea"]');
    await card.dragTo(editor);

    await expect(editor).toHaveValue(/!\[Mock Pexels Photo]/);
  });
});
