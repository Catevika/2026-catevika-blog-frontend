import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("a non-author user can like and unlike a post", async ({ page }) => {
  //
  // 1. Login as author (john)
  //
  await loginUI(page, "john@gmail.com", "12345678");

  //
  // 2. Create a post
  //
  const title = `Like Target ${uniqueSuffix()}`;
  const content = "Post to be liked";

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

  //
  // 3. Wait for redirect to /posts/:id
  //
  await page.waitForURL(ID_REGEX, { timeout: 10000 });

  const postUrl = page.url();
  const postId = postUrl.split("/posts/")[1];

  //
  // 4. Logout
  //
  await page.getByRole("button", { name: "Go to login page" }).click();

  //
  // 5. Login as DIFFERENT user (test@gmail.com)
  //
  await loginUI(page, "test@gmail.com", "12345678");

  //
  // 6. Navigate to the post
  //
  await page.goto(`/posts/${postId}`);

  //
  // 7. Locate LikeButton correctly
  //
  const likeCount = page.locator("p.font-semibold").last();
  const likeButton = likeCount.locator("xpath=preceding-sibling::button[1]");

  //
  // 8. Initial state: 0 likes
  //
  await expect(likeCount).toHaveText("0");

  //
  // 9. Like the post
  //
  await likeButton.click();

  const likeResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/like`) &&
      resp.request().method() === "POST",
  );

  expect(likeResponse.status()).toBe(200);

  //
  // 10. UI should show likeCount = 1
  //
  await expect(likeCount).toHaveText("1");

  //
  // 11. Backend validation
  //
  const meResponse = await page.request.get("/api/auth/me");
  const me = await meResponse.json();
  const testUserId = me.user.id; // FIXED

  const singleResponse = await page.request.get(`/api/posts/${postId}`);
  const singlePost = await singleResponse.json();

  expect(singlePost.likeCount).toBe(1);
  expect(singlePost.likedBy).toContain(testUserId); // FIXED

  //
  // 12. Unlike the post
  //
  await likeButton.click();

  const unlikeResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/like`) &&
      resp.request().method() === "POST",
  );

  expect(unlikeResponse.status()).toBe(200);

  //
  // 13. UI should show likeCount = 0
  //
  await expect(likeCount).toHaveText("0");

  //
  // 14. Backend validation
  //
  const singleResponse2 = await page.request.get(`/api/posts/${postId}`);
  const singlePost2 = await singleResponse2.json();

  expect(singlePost2.likeCount).toBe(0);
  expect(singlePost2.likedBy).not.toContain(testUserId);
});
