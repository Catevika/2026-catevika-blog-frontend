import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("mobile: user can like a reply", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Login as TEST (so John will be the liker later)
  await loginUI(page, "test@gmail.com", "12345678");

  // 2. Create post
  const title = `Reply Like Mobile ${uniqueSuffix()}`;
  const content = "Post for reply like test";

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

  // 3. Add parent comment AS TEST
  await page.fill('textarea[name="comment"]', "Parent comment");
  const parentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  await parentResponsePromise;

  // 4. Logout (frontend)
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 4b. Logout (backend)
  await page.context().clearCookies();

  // 5. Login as JOHN (he will author the reply)
  await loginUI(page, "john@gmail.com", "12345678");

  // 6. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 7. Reply AS JOHN
  const replyButton = page.locator("article#commentItem >> text=Reply").first();
  await replyButton.click();

  const replyTextarea = page.getByPlaceholder("Write a reply...");
  await replyTextarea.fill("Reply to like");

  const replyResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Send Reply" }).click();
  await replyResponsePromise;

  // 8. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 9. Login as TEST (he will like John's reply)
  await loginUI(page, "test@gmail.com", "12345678");

  // 10. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 11. Locate the reply item
  const replyItem = page.locator("article#commentItem").filter({
    hasText: "Reply to like",
  });

  // 12. Like reply (first footer button)
  const replyLikeButton = replyItem.locator("footer button").first();
  await expect(replyLikeButton).toBeEnabled();

  const likeCount = replyLikeButton.locator("span");
  await expect(likeCount).toHaveText("0");

  const likeResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments/`) &&
      resp.url().includes("/like") &&
      resp.request().method() === "POST",
  );

  await replyLikeButton.click();
  const likeResp = await likeResponsePromise;
  expect(likeResp.status()).toBe(200);

  // 13. UI updated
  await expect(likeCount).toHaveText("1");
});
