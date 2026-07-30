import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("user can restore a soft-deleted post", async ({ page }) => {
  //
  // 1. Login
  //
  await loginUI(page, "john@gmail.com", "12345678");

  //
  // 2. Create a post
  //
  const title = `Restore Target ${uniqueSuffix()}`;
  const content = "Post to be restored";

  await page.fill('input[name="title"]', title);
  await page.fill('textarea[id$="-textarea"]', content);

  // Publish the post (shadcn Select)
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
  // 4. Soft-delete the post
  //
  await page.getByTestId("delete-button").click();
  await page.getByRole("button", { name: "Move to Trash" }).click();

  const deleteResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}`) &&
      resp.request().method() === "PUT",
  );

  expect(deleteResponse.status()).toBe(200);

  //
  // 5. Redirect to /posts (PostList)
  //
  await page.waitForURL("/posts", { timeout: 10000 });

  //
  // 6. Locate Trash list (3rd <ul> inside PostList)
  //
  const trashList = page.locator("section ul").nth(2);

  //
  // 7. Confirm post appears in Trash section
  //
  await expect(
    trashList.getByRole("link", { name: `Read ${title}` }),
  ).toBeVisible();

  //
  // 8. Restore the post
  //
  await page.getByRole("button", { name: `Restore ${title}` }).click();

  //
  // 9. Confirm post disappears from Trash section
  //
  await expect(
    trashList.getByRole("link", { name: `Read ${title}` }),
  ).not.toBeVisible();

  //
  // 10. Confirm post appears in Published or In Progress
  //
  const postLink = page.getByRole("link", { name: `Read ${title}` });

  await expect(postLink).toBeVisible();

  //
  // 11. Backend validation: deleted = false
  //
  const singleResponse = await page.request.get(`/api/posts/${postId}`);
  const singlePost = await singleResponse.json();

  expect(singlePost.deleted).toBe(false);

  //
  // 12. Confirm post no longer appears in trash list
  //
  const trashResponse = await page.request.get("/api/posts/trash/list");
  const trashListJson = await trashResponse.json();

  expect(JSON.stringify(trashListJson)).not.toContain(postId);
});
