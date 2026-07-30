import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("mobile: user can soft delete a comment", async ({ page }) => {
  // Force mobile mode (<768px)
  await page.setViewportSize({ width: 375, height: 812 });

  // 1. Login as author
  await loginUI(page, "john@gmail.com", "12345678");

  // 2. Create a post
  const title = `Soft Delete Mobile ${uniqueSuffix()}`;
  const content = "Post for mobile soft delete test";

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
  await page.fill('textarea[name="comment"]', "Mobile comment to delete");

  const commentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Send Comment" }).click();
  await commentResponsePromise;

  // 7. Locate the comment
  const commentArticle = page
    .locator("article#commentItem")
    .filter({ hasText: "Mobile comment to delete" })
    .first();

  await expect(commentArticle).toBeVisible();

  // 8. Click delete button (same selector as edit test)
  const deleteButton = commentArticle.locator("footer button").nth(2);
  await deleteButton.click();

  // Confirm delete modal
  await page.getByRole("button", { name: "Delete" }).click();

  // 9. Assert the comment is removed from DOM (mobile + desktop behavior)
  await expect(commentArticle).not.toBeVisible();

  // 10. Backend validation
  const meResponse = await page.request.get("/api/auth/me");
  const me = await meResponse.json();
  const testUserId = me.user.id;

  const treeResponse = await page.request.get(
    `/api/posts/${postId}/comments/tree?userId=${testUserId}`,
  );
  const tree = await treeResponse.json();

  expect(tree.comments[0].deleted).toBe(true);
  expect(tree.comments[0].content).toBe("[deleted]");
});
