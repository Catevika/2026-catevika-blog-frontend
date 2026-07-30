/// <reference types="node" />
import { test, expect, type Page, type Route } from "@playwright/test";
import { Buffer } from "buffer";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

async function mockPdfSuccess(page: Page) {
  await page.route("**/api/pdf", async (route: Route) => {
    const pdfBuffer = Buffer.from("%PDF-1.4 mock pdf content");
    await route.fulfill({
      status: 200,
      headers: { "Content-Type": "application/pdf" },
      body: pdfBuffer,
    });
  });
}

// ---------------------------------------------------------
// TESTS
// ---------------------------------------------------------

test.describe("PDF Download (E2E)", () => {
  // ---------------------------------------------------------
  // PUBLISHED POSTS (PUBLIC)
  // ---------------------------------------------------------
  test.describe("Published posts (public)", () => {
    test.beforeEach(async ({ page }) => {
      // Mock published post
      await page.route(
        "**/api/posts/507f1f77bcf86cd799439011",
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: "507f1f77bcf86cd799439011",
              title: "Test Post",
              slug: "test-post",
              locked: false,
              content: "Hello world",
              author: { id: "u1", name: "John", email: "john@gmail.com" },
              status: "published",
              deleted: false,
              likeCount: 0,
              liked: false,
              likedBy: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          });
        },
      );

      // Comments (empty)
      await page.route(
        "**/api/posts/507f1f77bcf86cd799439011/comments**",
        async (route) => {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              comments: [],
              total: 0,
              page: 1,
              limit: 10,
              hasMore: false,
              pages: 1,
            }),
          });
        },
      );

      await page.goto("/posts/507f1f77bcf86cd799439011");
    });

    test("should successfully download PDF", async ({ page }) => {
      await mockPdfSuccess(page);

      const pdfButton = page.getByRole("button", { name: /pdf/i });

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfButton.click(),
      ]);

      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });
  });

  // ---------------------------------------------------------
  // DRAFT POSTS (AUTHOR ONLY)
  // ---------------------------------------------------------
  test.describe("Draft posts (author only)", () => {
    test("author can download PDF for a draft post", async ({ page }) => {
      //
      // 1. Login (real protected flow)
      //
      await loginUI(page, "john@gmail.com", "12345678");

      //
      // 2. Create a real draft post
      //
      const title = `Draft Title ${uniqueSuffix()}`;
      const content = "Draft content for PDF test.";

      await page.fill('input[name="title"]', title);
      await page.fill('textarea[id$="-textarea"]', content);

      const postResponsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/posts") &&
          resp.request().method() === "POST",
      );

      await submitFormSafely(page);

      const postResp = await postResponsePromise;
      expect(postResp.status()).toBe(201);

      //
      // 3. Wait for redirect to /posts/:id
      //
      await page.waitForURL(ID_REGEX, { timeout: 10000 });

      //
      // 4. Extract postId
      //
      const postUrl = page.url();
      const postId = postUrl.split("/posts/")[1];

      //
      // 5. Mock PDF success
      //
      await mockPdfSuccess(page);

      //
      // 6. Click PDF button
      //
      const pdfButton = page.getByRole("button", { name: /pdf/i });

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfButton.click(),
      ]);

      //
      // 7. Validate filename
      //
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });
  });

  // ---------------------------------------------------------
  // ERROR CASES (PUBLISHED ONLY)
  // ---------------------------------------------------------
  test("should handle API error with JSON message", async ({ page }) => {
    await page.route("**/api/posts/507f1f77bcf86cd799439011", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
          title: "Test Post",
          slug: "test-post",
          locked: false,
          content: "Hello world",
          author: { id: "u1", name: "John", email: "john@gmail.com" },
          status: "published",
          deleted: false,
          likeCount: 0,
          liked: false,
          likedBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/posts/507f1f77bcf86cd799439011");

    await page.route("**/api/pdf", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "PDF generation failed" }),
      });
    });

    const pdfButton = page.getByRole("button", { name: /pdf/i });
    await pdfButton.click();

    await expect(page.getByText("PDF generation failed")).toBeVisible();
  });

  test("should handle API error without JSON", async ({ page }) => {
    await page.route("**/api/posts/507f1f77bcf86cd799439011", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
          title: "Test Post",
          slug: "test-post",
          locked: false,
          content: "Hello world",
          author: { id: "u1", name: "John", email: "john@gmail.com" },
          status: "published",
          deleted: false,
          likeCount: 0,
          liked: false,
          likedBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/posts/507f1f77bcf86cd799439011");

    await page.route("**/api/pdf", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "Error",
      });
    });

    const pdfButton = page.getByRole("button", { name: /pdf/i });
    await pdfButton.click();

    await expect(page.getByText(/500/)).toBeVisible();
  });

  test("should show error when PDF blob is empty", async ({ page }) => {
    await page.route("**/api/posts/507f1f77bcf86cd799439011", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
          title: "Test Post",
          slug: "test-post",
          locked: false,
          content: "Hello world",
          author: { id: "u1", name: "John", email: "john@gmail.com" },
          status: "published",
          deleted: false,
          likeCount: 0,
          liked: false,
          likedBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/posts/507f1f77bcf86cd799439011");

    await page.route("**/api/pdf", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/pdf" },
        body: Buffer.from(""),
      });
    });

    const pdfButton = page.getByRole("button", { name: /pdf/i });
    await pdfButton.click();

    await expect(page.getByText("Generated PDF is empty")).toBeVisible();
  });

  test("should clear error when Dismiss is clicked", async ({ page }) => {
    await page.route("**/api/posts/507f1f77bcf86cd799439011", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
          title: "Test Post",
          slug: "test-post",
          locked: false,
          content: "Hello world",
          author: { id: "u1", name: "John", email: "john@gmail.com" },
          status: "published",
          deleted: false,
          likeCount: 0,
          liked: false,
          likedBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/posts/507f1f77bcf86cd799439011");

    await page.route("**/api/pdf", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "PDF generation failed" }),
      });
    });

    const pdfButton = page.getByRole("button", { name: /pdf/i });
    await pdfButton.click();

    const error = page.getByText("PDF generation failed");
    await expect(error).toBeVisible();

    await page.getByRole("button", { name: /dismiss/i }).click();

    await expect(error).not.toBeVisible();
  });

  test("should sanitize filename correctly", async ({ page }) => {
    await page.route("**/api/posts/507f1f77bcf86cd799439011", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "507f1f77bcf86cd799439011",
          title: "My *invalid* title!",
          slug: "my-invalid-title",
          locked: false,
          content: "Hello world",
          author: { id: "u1", name: "John", email: "john@gmail.com" },
          status: "published",
          deleted: false,
          likeCount: 0,
          liked: false,
          likedBy: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto("/posts/507f1f77bcf86cd799439011");

    await page.route("**/api/pdf", async (route) => {
      const pdfBuffer = Buffer.from("%PDF-1.4 mock pdf content");
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/pdf" },
        body: pdfBuffer,
      });
    });

    const pdfButton = page.getByRole("button", { name: /pdf/i });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      pdfButton.click(),
    ]);

    expect(download.suggestedFilename()).toBe("My__invalid__title_.pdf");
  });
});
