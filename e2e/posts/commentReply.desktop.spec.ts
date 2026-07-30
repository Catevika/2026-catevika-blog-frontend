import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("desktop: user can reply to a comment", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Login as author
  await loginUI(page, "john@gmail.com", "12345678");

  // 2. Create a post
  const title = `Reply Desktop ${uniqueSuffix()}`;
  const content = "Post for reply test";

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

  // 3. Add a comment AS JOHN
  await page.fill('textarea[name="comment"]', "Parent comment (desktop)");
  const commentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  await commentResponsePromise;

  // 4. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 5. Login as TEST
  await loginUI(page, "test@gmail.com", "12345678");

  // 6. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 7. Click reply button
  const replyButton = page.locator("article#commentItem >> text=Reply").first();
  await replyButton.click();

  // 8. Fill reply form
  const replyTextarea = page.getByPlaceholder("Write a reply...");
  await replyTextarea.fill("This is a reply (desktop)");

  const replyResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Send Reply" }).click();
  const replyResp = await replyResponsePromise;
  expect(replyResp.status()).toBe(201);

  // 9. UI updated
  await expect(
    page.locator("article#commentItem >> text=This is a reply (desktop)"),
  ).toBeVisible();
});
