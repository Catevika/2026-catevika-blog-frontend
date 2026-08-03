import { test, expect } from "@playwright/test";
import { loginUI, submitFormSafely, uniqueSuffix } from "../helpers";

const ID_REGEX = /\/posts\/[0-9a-f]{24}$/;

test("user can soft-delete a post", async ({ page }) => {
  //
  // 1. Login
  //
  await loginUI(page, "john@gmail.com", "12345678");

  //
  // 2. Create the post (same pattern as createPost.spec.ts)
  //
  const title = `Soft Delete Target ${uniqueSuffix()}`;
  const content = "Post to be soft-deleted";

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
  // 4. Click delete button (CustomDeleteButton)
  //
  await page.getByTestId("delete-button").click();

  //
  // 5. Confirm delete in AlertDialog
  //
  await page.getByRole("button", { name: "Move to Trash" }).click();

  //
  // 6. Wait for soft delete API call
  //
  const deleteResponse = await page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/posts/${postId}`) &&
      resp.request().method() === "PUT",
  );

  expect(deleteResponse.status()).toBe(200);

  // 7. Redirect to /posts
  await page.waitForURL("/posts", { timeout: 10000 });

  // 7b. Wait for the deleted post to appear in the Trash section UI
  await expect(
    page.getByRole("link", { name: new RegExp(title) }),
  ).toBeVisible();

  await page.waitForLoadState("networkidle");

  // 8. Backend validation with shared Browser Context cookies
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  const trashResponse = await page.request.get("/api/posts/trash/list", {
    headers: {
      Cookie: cookieHeader, // manually set the cookies in the request header to avoid 401 Unauthorized
    },
  });

  expect(trashResponse.status()).toBe(200);
  const trashList = await trashResponse.json();

  expect(JSON.stringify(trashList)).toContain(postId);
});
