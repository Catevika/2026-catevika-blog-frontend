import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("mobile: user can edit a reply", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Login as author
  await loginUI(page, "john@gmail.com", "12345678");

  // 2. Create post
  const title = `Reply Edit Mobile ${uniqueSuffix()}`;
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
  const postResp = await postResponsePromise;
  expect(postResp.status()).toBe(201);

  await page.waitForURL(ID_REGEX);
  const postId = page.url().split("/posts/")[1];

  // 3. Add parent comment AS JOHN
  await page.fill('textarea[name="comment"]', "Parent comment");
  const parentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  await parentResponsePromise;

  // 4. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 5. Login as TEST
  await loginUI(page, "test@gmail.com", "12345678");

  // 6. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 7. Reply
  const replyButton = page.locator("article#commentItem >> text=Reply").first();
  await replyButton.click();

  const replyTextarea = page.getByPlaceholder("Write a reply...");
  await replyTextarea.fill("Reply to edit");

  const replyResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Send Reply" }).click();
  await replyResponsePromise;

  // 8. Locate the correct reply item
  const replyItem = page.locator("article#commentItem").filter({
    hasText: "Reply to edit",
  });

  // 9. Locate reply edit button (second SVG button inside THIS reply)
  const replyEditButton = replyItem.locator("footer button:has(svg)").nth(1);
  await replyEditButton.click();

  // 10. Edit reply (textarea has NO placeholder, value = reply text)
  const editTextarea = page.locator('textarea[name="comment"]').filter({
    hasText: "Reply to edit",
  });
  await expect(editTextarea).toHaveValue("Reply to edit");

  // 11. Update reply
  await editTextarea.fill("Updated reply (mobile)");

  const updateResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "PUT",
  );

  // 12. Save reply (enabled button is always nth(1))
  const saveButton = page.getByRole("button", { name: "Send Reply" }).nth(1);
  await saveButton.click();

  const updateResp = await updateResponsePromise;
  expect(updateResp.status()).toBe(200);

  // 13. UI updated
  await expect(
    page.locator("article#commentItem >> text=Updated reply (mobile)"),
  ).toBeVisible();
});
