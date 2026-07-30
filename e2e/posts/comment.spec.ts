import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("user can comment on a post", async ({ page }) => {
  await loginUI(page, "john@gmail.com", "12345678");

  const title = `Comment Target ${uniqueSuffix()}`;
  const content = "Post to comment on";

  await page.fill('input[name="title"]', title);
  await page.fill('textarea[id$="-textarea"]', content);

  // publish the post
  await page.getByRole("combobox").click();
  await page.selectOption('select[name="status"]', "published");

  const postResponsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/posts") && resp.request().method() === "POST",
  );

  await submitFormSafely(page);

  const postResp = await postResponsePromise;
  expect(postResp.status()).toBe(201);

  await page.waitForURL(ID_REGEX, { timeout: 10000 });

  const postUrl = page.url();
  const postId = postUrl.split("/posts/")[1];

  const commentText = `Playwright comment ${uniqueSuffix()}`;

  // Wait for CommentForm to appear
  await page.waitForSelector("#comment", { timeout: 10000 });

  await page.fill("#comment", commentText);
  await page.getByRole("button", { name: "Send Comment" }).click();

  await expect(page.getByText(commentText)).toBeVisible();

  const treeResponse = await page.request.get(
    `/api/posts/${postId}/comments/tree`,
  );
  const tree = await treeResponse.json();

  expect(JSON.stringify(tree)).toContain(commentText);
});
