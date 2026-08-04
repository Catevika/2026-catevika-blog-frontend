import { test, expect } from "@playwright/test";
import {
  loginUI,
  resolveLoggedInUserId,
  submitFormSafely,
  uniqueSuffix,
} from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("desktop: user can soft delete a comment", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Login as author
  await loginUI(page, "john@gmail.com", "12345678");

  // 2. Create a post
  const title = `Soft Delete Target ${uniqueSuffix()}`;
  const content = "Post for soft delete test";

  await page.fill('input[name="title"]', title);
  await page.fill('textarea[id$="-textarea"]', content);

  await page.getByRole("combobox").click();
  await page.selectOption('select[name="status"]', "published");

  const postResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/posts") && resp.request().method() === "POST",
  );

  await submitFormSafely(page);
  await postResponsePromise;

  await page.waitForURL(ID_REGEX);
  const postId = page.url().split("/posts/")[1];

  // 3. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 4. Login as commenter
  await loginUI(page, "test@gmail.com", "12345678");

  // 5. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 6. Add a comment
  await page.fill('textarea[name="comment"]', "Comment to delete");
  const commentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  await commentResponsePromise;

  // 7. Locate the comment article
  const commentArticle = page
    .locator("article#commentItem")
    .filter({ hasText: "Comment to delete" })
    .first();

  await expect(commentArticle).toBeVisible();

  // e2e/posts/commentDelete.desktop.spec.ts

  // ... [Keep everything exactly the same up to Step 8] ...

  // 8. Click delete button
  const deleteButton = commentArticle.locator("footer button").nth(2);
  await deleteButton.click();

  // 🚀 FIX: Intercept the real network DELETE request before asserting anything else
  const deleteResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "DELETE" &&
      resp.status() === 200,
    { timeout: 10000 },
  );

  // Confirm delete modal
  await page.getByRole("button", { name: "Delete" }).click();

  // 🚀 FIX: Wait for the backend server to finish deleting and return a 200 OK status
  await deleteResponsePromise;

  // 9. Assert the comment is removed from DOM
  await expect(commentArticle).not.toBeVisible();

  // Give the background worker a tiny 500ms safety window to fully flush the write cache
  await page.waitForTimeout(500);

  // 10. Backend validation
  const testUserId = await resolveLoggedInUserId(page);

  const treeResponse = await page.request.get(
    `/api/posts/${postId}/comments/tree?userId=${testUserId}`,
  );
  const tree = await treeResponse.json();

  expect(tree.comments[0].deleted).toBe(true);
  expect(tree.comments[0].content).toBe("[deleted]");
});