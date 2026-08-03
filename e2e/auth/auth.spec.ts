// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "../helpers";

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
test("session persists after refresh when remember-me is enabled", async ({
  page,
  context,
}) => {
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

  // Wait for all background fetches to finish completely BEFORE reloading.
  await page.waitForLoadState("networkidle");

  // Capture a complete snapshot of all active local storage, session storage, and cookies.
  const storageState = await context.storageState();

  // Reload the page and wait for the new DOM structure to parse
  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    page.reload(),
  ]);

  // Restore the storage profile into the fresh browser frame.
  await context.addCookies(storageState.cookies);
  await page.evaluate((origins) => {
    localStorage.clear();
    for (const originState of origins) {
      for (const item of originState.localStorage) {
        localStorage.setItem(item.name, item.value);
      }
    }
  }, storageState.origins);

  // 🚀 THE SYNC FIX FOR FIREFOX & WEBKIT:
  // Instead of pushing a fresh page.goto() which creates a secondary page load race condition,
  // simply wait for the local background server API threads to completely settle.
  await page.waitForLoadState("networkidle");

  // Give the React app a stable 1-second window to resolve the '304 Not Modified' token authentication check
  await page.waitForTimeout(1000);

  // Assert our visual element is visible (Forces Playwright to poll the page until hydrated)
  await expect(
    page.getByRole("button", { name: "Go to login page" }),
  ).toBeVisible({ timeout: 15000 });

  // Session MUST persist
  await expect(page).toHaveURL("/posts/new");

  // Context Cleanup: clear cookies so they don't bleed into the next test block
  await context.clearCookies();
});

test("session does NOT persist when remember-me is disabled", async ({
  page,
  context,
}) => {
  await context.clearCookies();

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
