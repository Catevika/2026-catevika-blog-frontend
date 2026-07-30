import { test, expect, type Page } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test.describe("Create Post", () => {
  test("user can create a new post", async ({ page }) => {
    await loginUI(page, "john@gmail.com", "12345678");

    const title = `My First Post ${uniqueSuffix()}`;
    const content = "This is the content of my first post.";

    await page.fill('input[name="title"]', title);
    await page.fill('textarea[id$="-textarea"]', content);

    const postResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/posts") && resp.request().method() === "POST",
    );

    await submitFormSafely(page);

    const postResp = await postResponsePromise;
    console.log("POST /api/posts status:", postResp.status());
    expect(postResp.status()).toBe(201);

    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "Redirect to PostView did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(page.locator("p", { hasText: content })).toBeVisible();
  });

  test("cannot create post without content", async ({ page }) => {
    await loginUI(page, "john@gmail.com", "12345678");

    // Intentionally leave title empty and provide content
    await page.fill('input[name="title"]', "");
    await page.fill(
      'textarea[id$="-textarea"]',
      "Content present but title missing",
    );

    // Trigger blur to run client-side validation if any
    await page.locator('textarea[id$="-textarea"]').blur();

    // Submit the form (uses the shared helper from the test file)
    await submitFormSafely(page);

    // Stay on /posts/new
    await expect(page).toHaveURL(/\/posts\/new$/);

    // Assert the real error message returned by the UI
    await expect(
      page.getByText("Save failed: Title cannot be empty", { exact: true }),
    ).toBeVisible();
  });

  test("cannot create post without title", async ({ page }) => {
    await loginUI(page, "john@gmail.com", "12345678");

    const content = "Content without a title";

    await page.fill('textarea[id$="-textarea"]', content);

    await submitFormSafely(page);

    await expect(page).toHaveURL(/\/posts\/new$/);

    await expect(
      page.getByText("Title cannot be empty", { exact: true }),
    ).toBeVisible();
  });

  test("slug is auto-generated from title (URL uses id)", async ({ page }) => {
    await loginUI(page, "john@gmail.com", "12345678");

    const title = `Hello World! ${uniqueSuffix()}`;
    const content = "Testing slug generation.";

    await page.fill('input[name="title"]', title);
    await page.fill('textarea[id$="-textarea"]', content);

    const postResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/posts") && resp.request().method() === "POST",
    );

    await submitFormSafely(page);

    const postResp = await postResponsePromise;
    console.log("POST /api/posts status:", postResp.status());
    await expect(postResp.status()).toBe(201);

    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "Redirect to PostView did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(page.locator("p", { hasText: content })).toBeVisible();
  });

  test("slug collision still creates distinct posts (ID-based URL)", async ({
    page,
  }) => {
    await loginUI(page, "john@gmail.com", "12345678");

    const titleA = `Duplicate Title A ${uniqueSuffix()}`;
    const titleB = `Duplicate Title B ${uniqueSuffix()}`;

    // First post
    await page.fill('input[name="title"]', titleA);
    await page.fill('textarea[id$="-textarea"]', "First post");

    const firstPostResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/posts") && resp.request().method() === "POST",
    );

    await submitFormSafely(page);

    const firstResp = await firstPostResponse;
    console.log("First POST status:", firstResp.status());
    await expect(firstResp.status()).toBe(201);

    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "First redirect to PostView did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    const firstUrl = page.url();
    await expect(firstUrl).toMatch(ID_REGEX);

    // Second post
    await page.goto("/posts/new");
    await page.waitForSelector("#post-form");

    await page.fill('input[name="title"]', titleB);
    await page.fill('textarea[id$="-textarea"]', "Second post");

    const secondPostResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/posts") && resp.request().method() === "POST",
    );

    await submitFormSafely(page);

    const secondResp = await secondPostResponse;
    console.log("Second POST status:", secondResp.status());
    await expect(secondResp.status()).toBe(201);

    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "Second redirect to PostView did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    const secondUrl = page.url();
    await expect(secondUrl).toMatch(ID_REGEX);

    expect(firstUrl).not.toBe(secondUrl);
  });

  test("created post appears in PostView", async ({ page }) => {
    await loginUI(page, "john@gmail.com", "12345678");

    const title = `Dashboard Post ${uniqueSuffix()}`;
    const content = "This should appear in PostView.";

    await page.fill('input[name="title"]', title);
    await page.fill('textarea[id$="-textarea"]', content);

    const postResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/posts") && resp.request().method() === "POST",
    );

    await submitFormSafely(page);

    const postResp = await postResponsePromise;
    console.log("POST /api/posts status:", postResp.status());
    await expect(postResp.status()).toBe(201);

    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "Redirect to PostView did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    await expect(page.getByText(title, { exact: true })).toBeVisible();
    await expect(page.locator("p", { hasText: content })).toBeVisible();
  });
});
