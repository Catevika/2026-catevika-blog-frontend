import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("desktop: user can edit a reply", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Login as JOHN and create post
  await loginUI(page, "john@gmail.com", "12345678");

  const title = `Reply Edit Desktop ${uniqueSuffix()}`;
  const content = "Post for reply edit test";

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
  await page.fill('textarea[name="comment"]', "Parent comment (desktop)");
  const parentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  await parentResponsePromise;

  // 3. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();
  await page.evaluate(() => localStorage.clear());
  await page.context().clearCookies();

  // 4. Login as TEST
  await loginUI(page, "test@gmail.com", "12345678");

  // 5. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 6. Reply to parent comment
  const replyButton = page.locator("article#commentItem >> text=Reply").first();
  await replyButton.click();

  const replyTextarea = page.getByPlaceholder("Write a reply...");
  await replyTextarea.fill("Reply to edit (desktop)");

  // STRICT-MODE SAFE: find the reply form
  const replyForm = replyTextarea.locator("xpath=ancestor::form");

  const replyResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );

  // STRICT-MODE SAFE: click inside the reply form only
  await replyForm.locator('button:has-text("Send Reply")').click();
  await replyResponsePromise;

  // 7. Locate reply
  const replyArticle = page
    .locator("article#commentItem")
    .filter({ hasText: "Reply to edit (desktop)" })
    .first();

  await expect(replyArticle).toBeVisible();

  // 8. Click edit button (nth(1))
  const editButton = replyArticle.locator("footer button:has(svg)").nth(1);
  await editButton.click();

  // 9. Locate the edit textarea by its placeholder
  const editTextarea = page.getByPlaceholder("Edit your comment...");

  // 10. Locate the edit form containing this textarea
  const editForm = editTextarea.locator("xpath=ancestor::form");

  // 11. Fill updated content
  await editTextarea.fill("Updated reply (desktop)");

  // 12. Wait for PUT update
  const updateResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "PUT",
  );

  // 13. Strict‑mode safe: click Send Reply inside the edit form only
  await editForm.getByRole("button", { name: "Send Reply" }).click();

  await updateResponsePromise;
});
