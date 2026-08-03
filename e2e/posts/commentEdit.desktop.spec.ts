import { test, expect } from "@playwright/test";
import {
  loginUI,
  submitFormSafely,
  uniqueSuffix,
  resolveLoggedInUserId,
} from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("desktop: user can edit a comment", async ({ page }) => {
  // Force desktop mode
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Login as author
  await loginUI(page, "john@gmail.com", "12345678");

  // 2. Create a post
  const title = `Edit Comment Target ${uniqueSuffix()}`;
  const content = "Post for comment editing";

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

  // 3. Logout
  await page.getByRole("button", { name: "Go to login page" }).click();

  // 4. Login as commenter
  await loginUI(page, "test@gmail.com", "12345678");

  // 5. Navigate to post
  await page.goto(`/posts/${postId}`);

  // 6. Add a comment
  await page.fill('textarea[name="comment"]', "Original comment text");
  const commentResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send Comment" }).click();
  const commentResp = await commentResponsePromise;
  expect(commentResp.status()).toBe(201);

  // 7. Locate the comment text
  const commentText = page.locator(
    "article#commentItem >> text=Original comment text",
  );
  await expect(commentText).toBeVisible();

  // 8. Click the edit button
  const editButton = page
    .locator("article#commentItem footer button:has(svg)")
    .nth(1);
  await editButton.click();

  // Wait for hydration to finish
  const editTextarea = page.getByPlaceholder("Edit your comment...");
  await editTextarea.waitFor({ state: "visible" });
  await expect(editTextarea).toHaveValue("Original comment text");

  // 9. Edit the comment
  await editTextarea.fill("Updated comment text");

  // Save (edit form only)
  const saveButton = page
    .locator('form button:has-text("Send Comment")')
    .last();

  const updateResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}/comments`) &&
      resp.request().method() === "PUT",
  );

  await saveButton.click();

  const updateResp = await updateResponsePromise;
  expect(updateResp.status()).toBe(200);

  // 10. Assert UI updated
  const updatedText = page.locator(
    "article#commentItem >> text=Updated comment text",
  );
  await expect(updatedText).toBeVisible();

  // 🚀 Playwright Best Practice: Wait for all background requests to settle
  await page.waitForLoadState("networkidle");

  // 11. Backend validation
  const testUserId = await resolveLoggedInUserId(page);

  const treeResponse = await page.request.get(
    `/api/posts/${postId}/comments/tree?userId=${testUserId}`,
  );
  const tree = await treeResponse.json();

  expect(tree.comments[0].content).toBe("Updated comment text");
});
