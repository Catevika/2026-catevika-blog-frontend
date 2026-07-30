import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test.describe("Edit Post", () => {
  test("user can edit a post and see the updated content", async ({ page }) => {
    //
    // 1. Login using the same helper as createPost.spec.ts
    //
    await loginUI(page, "john@gmail.com", "12345678");

    //
    // 2. Create the original post (same pattern as createPost.spec.ts)
    //
    const originalTitle = `Original Title ${uniqueSuffix()}`;
    const originalContent = "Original content of the post.";

    await page.fill('input[name="title"]', originalTitle);
    await page.fill('textarea[id$="-textarea"]', originalContent);

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
    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "Redirect to PostView did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    //
    // 4. Extract postId from URL
    //
    const postUrl = page.url();
    const postId = postUrl.split("/posts/")[1];

    //
    // 5. Navigate to edit page
    //
    await page.goto(`/posts/${postId}/edit`);
    await page.waitForSelector("#post-form");

    //
    // 6. Edit the post
    //
    const updatedTitle = `Updated Title ${uniqueSuffix()}`;
    const updatedContent = "Updated content of the post.";

    await page.fill('input[name="title"]', updatedTitle);
    await page.fill('textarea[id$="-textarea"]', updatedContent);

    //
    // 7. Save
    //
    const updateResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes(`/api/posts/${postId}`) &&
        resp.request().method() === "PUT",
    );

    await submitFormSafely(page);

    const updateResp = await updateResponsePromise;
    expect(updateResp.status()).toBe(200);

    //
    // 8. Validate redirect back to PostView
    //
    try {
      await page.waitForURL(ID_REGEX, { timeout: 10000 });
    } catch (err) {
      console.error(
        "Redirect after update did not happen. Current URL:",
        page.url(),
      );
      throw err;
    }

    //
    // 9. Validate updated content
    //
    await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible();
    await expect(page.locator("p", { hasText: updatedContent })).toBeVisible();
  });
});
