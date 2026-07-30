import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("mobile: user can delete a reply", async ({ page }) => {
  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });

  // 1. Login as JOHN and create post
  await loginUI(page, "john@gmail.com", "12345678");

  const title = `Reply Delete Mobile ${uniqueSuffix()}`;
  const content = "Post for reply delete test";

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

  // 2. Add parent comment AS JOHN
  await page.fill('textarea[name="comment"]', "Parent comment (mobile)");
  const parentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  await parentResponsePromise;

  // 3. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 4. Login as TEST
  await loginUI(page, "test@gmail.com", "12345678");

  // 5. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 6. Reply to parent comment
  const replyButton = page.locator("article#commentItem >> text=Reply").first();
  await replyButton.click();

  const replyTextarea = page.getByPlaceholder("Write a reply...");
  await replyTextarea.fill("Reply to delete (mobile)");

  const replyResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Send Reply" }).click();
  await replyResponsePromise;

  // 🔹 MOBILE-SPECIFIC: replies are collapsed → expand them
  await page.getByRole("button", { name: "Show replies" }).click();

  // 7. Locate reply
  const replyArticle = page
    .locator("article#commentItem")
    .filter({ hasText: "Reply to delete (mobile)" })
    .first();

  await expect(replyArticle).toBeVisible();

  // 8. Delete reply (nth(2))
  const deleteButton = replyArticle.locator("footer button:has(svg)").nth(2);
  await deleteButton.click();

  // Confirm delete modal
  await page.getByRole("button", { name: "Delete" }).click();

  // 9. Deleted reply has no children → disappears
  await expect(replyArticle).not.toBeVisible();
});
