import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

test.describe("Desktop reply flow", () => {
  test("John replies to Test, Test likes John's reply", async ({ browser }) => {
    // Context A → John
    const johnContext = await browser.newContext();
    const johnPage = await johnContext.newPage();

    // Context B → Test
    const testContext = await browser.newContext();
    const testPage = await testContext.newPage();

    /* -------------------------------------------------------
       1. JOHN creates post
    ------------------------------------------------------- */
    await johnPage.setViewportSize({ width: 1280, height: 900 });
    await loginUI(johnPage, "john@gmail.com", "12345678");

    const title = `Reply Desktop ${uniqueSuffix()}`;
    const content = "Post for reply test";

    await johnPage.fill('input[name="title"]', title);
    await johnPage.fill('textarea[id$="-textarea"]', content);
    await johnPage.selectOption('select[name="status"]', "published");

    const postResponse = johnPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/posts") && resp.request().method() === "POST",
    );

    await submitFormSafely(johnPage);
    await postResponse;

    await johnPage.waitForURL(/\/posts\/[0-9a-f]{24}$/);
    const postId = johnPage.url().split("/posts/")[1];

    /* -------------------------------------------------------
       2. TEST writes parent comment
    ------------------------------------------------------- */
    await testPage.setViewportSize({ width: 1280, height: 900 });
    await loginUI(testPage, "test@gmail.com", "12345678");
    await testPage.goto(`/posts/${postId}`);

    const parentText = `Parent comment ${uniqueSuffix()}`;
    await testPage.fill('textarea[name="comment"]', parentText);

    const parentResponse = testPage.waitForResponse(
      (resp) =>
        resp.url().includes(`/api/posts/${postId}/comments`) &&
        resp.request().method() === "POST",
    );

    await testPage.getByRole("button", { name: "Send Comment" }).click();
    await parentResponse;

    /* -------------------------------------------------------
       3. JOHN replies to TEST
    ------------------------------------------------------- */
    await johnPage.goto(`/posts/${postId}`);

    const replyButton = johnPage
      .locator("article#commentItem")
      .filter({ hasText: parentText })
      .locator('footer button:has-text("Reply")')
      .first();

    await replyButton.click();

    const replyTextarea = johnPage.getByPlaceholder("Write a reply...");
    await replyTextarea.fill("John's reply (desktop)");

    const replyForm = replyTextarea.locator("xpath=ancestor::form");

    const replyResponse = johnPage.waitForResponse(
      (resp) =>
        resp.url().includes(`/api/posts/${postId}/comments`) &&
        resp.request().method() === "POST",
    );

    await replyForm.locator('button:has-text("Send Reply")').click();
    await replyResponse;

    /* -------------------------------------------------------
       4. TEST likes JOHN's reply
    ------------------------------------------------------- */
    await testPage.reload();

    const replyArticle = testPage
      .locator("article#commentItem")
      .filter({ hasText: "John's reply (desktop)" })
      .first();

    const likeButton = replyArticle.locator("footer > button").first();

    await expect(likeButton).toBeEnabled();
    await likeButton.click();
    await expect(likeButton).toHaveText("1");
  });
});
