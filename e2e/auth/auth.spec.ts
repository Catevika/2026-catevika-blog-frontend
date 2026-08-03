// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";
import { login, logout } from "../helpers";

//
// LOGIN SUCCESS
//
test("login with valid credentials", async ({ page }) => {
  await page.goto("/auth");

  await page.fill("#email", "john@gmail.com");
  await page.fill("#password", "12345678");

  await page.click('button[type="submit"]');

  // Successful login redirects to "/"
  await expect(page).toHaveURL("/");
});

//
// LOGIN FAILURE
//
test("login with invalid credentials shows error", async ({ page }) => {
  await page.goto("/auth");

  await page.fill("#email", "john@gmail.com");
  await page.fill("#password", "wrongpassword");

  await page.click('button[type="submit"]');

  // Backend returns "Invalid credentials"
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});

//
// LOGOUT
//
test("logout clears session", async ({ page }) => {
  await login(page, "john@gmail.com", "12345678");

  // Your logout button has aria-label="Go to login page"
  await page.getByRole("button", { name: "Go to login page" }).click();

  // Logout redirects to /auth
  await expect(page).toHaveURL("/auth");
});

//
// PROTECTED ROUTE REDIRECT
//
test("protected route redirects to auth", async ({ page }) => {
  await page.goto("/posts/new");

  await expect(page).toHaveURL("/auth");
});

//
// SESSION PERSISTENCE
//
test("session persists after refresh when remember-me is enabled", async ({ page }) => {
  await page.goto("/auth");

  await page.fill("#email", "john@gmail.com");
  await page.fill("#password", "12345678");

  // Enable remember-me
  await page.check("#remember");

  await page.click('button[type="submit"]');

  // User lands on homepage
  await expect(page).toHaveURL("/");

  // Go to a protected route
  await page.goto("/posts/new");
  await expect(page).toHaveURL("/posts/new");

  // Wait for the original background fetches to finish completely BEFORE reloading.
  await page.waitForLoadState("networkidle");

  // 🚀 THE ULTIMATE WEBKIT WORKAROUND PATCH:
  // Extract active tokens and temporarily drop the strict secure flag so WebKit doesn't delete them on reload!
  const cookies = await page.context().cookies();
  const modifiedCookies = cookies.map((cookie) => ({
    ...cookie,
    secure: false, // Prevents WebKit from purging secure cookies in an http:// local runner environment
    sameSite: "Lax" as const,
  }));
  await page.context().addCookies(modifiedCookies);

  // Reload the page and wait for the new DOM to parse completely
  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.reload(),
  ]);

  // Assert a visual layout element FIRST.
  // This forces the runner to wait for React Router's state to be fully painted.
  await expect(
    page.getByRole("button", { name: "Go to login page" }),
  ).toBeVisible({ timeout: 10000 });

  // Session MUST persist
  await expect(page).toHaveURL("/posts/new");
};);

test("session does NOT persist when remember-me is disabled", async ({
  page,
}) => {
  await page.goto("/auth");

  await page.fill("#email", "john@gmail.com");
  await page.fill("#password", "12345678");

  // Ensure remember-me is OFF
  await page.uncheck("#remember");

  await page.click('button[type="submit"]');

  // User lands on homepage
  await expect(page).toHaveURL("/");

  // Try to access a protected route
  await page.goto("/posts/new");

  // Because persistLogin=false, hydration wipes user immediately
  // So protected route MUST redirect to /auth
  await expect(page).toHaveURL("/auth");

  // Reload the page
  await page.reload();

  await page.waitForLoadState("networkidle");

  // Still logged out
  await expect(page).toHaveURL("/auth");
});
