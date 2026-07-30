import { type Page, expect } from "@playwright/test";

export async function login(
  page: Page,
  email = "john@gmail.com",
  password = "12345678",
) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password, rememberMe: false },
    headers: { "Content-Type": "application/json" },
  });

  expect(response.ok()).toBeTruthy();

  await page.goto("/");
}

export async function logout(page: Page) {
  await page.request.post("/api/auth/logout", {
    headers: { "Content-Type": "application/json" },
  });

  await page.goto("/auth");
}

export async function loginUI(
  page: Page,
  email: string,
  password: string,
  rememberMe: boolean = true,
) {
  await page.goto("/auth");

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const remember = page.locator("#remember");
  if (rememberMe) {
    if (await remember.count()) await remember.check();
  } else {
    if (await remember.count()) await remember.uncheck();
  }

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/");

  await page.goto("/posts/new");

  // Ensure the form is present
  await page.waitForSelector("#post-form");
}

/**
 * Resolve the logged-in user id for the current browser session.
 * 1) Try reading persisted zustand auth from localStorage (key: "auth-persist").
 * 2) If not found or not persisted, call /api/auth/me from the page context.
 *
 * Returns the user id string or throws if it cannot be determined.
 */
export async function resolveLoggedInUserId(page: Page): Promise<string> {
  // 1) Try reading persisted zustand store from localStorage
  const persisted = await page.evaluate(() => {
    try {
      return localStorage.getItem("auth-persist");
    } catch {
      return null;
    }
  });

  if (persisted) {
    try {
      // The persisted shape is the partialized state you configured in the store.
      // Example persisted JSON (partial): { "state": { "persistLogin": true, "user": { "id": "..." }, "isAuthenticated": true } }
      const parsed = JSON.parse(persisted) as
        { state?: Record<string, any> } | Record<string, any>;
      const state = parsed?.state ?? parsed;
      const persistLogin = Boolean(state?.persistLogin);
      const user = state?.user ?? null;

      if (persistLogin && user && (user.id || user._id)) {
        return String(user.id ?? user._id);
      }
    } catch {
      // fall through to fallback
    }
  }

  // 2) Fallback: call /api/auth/me from the page context so cookies/session are used
  const me = await page.evaluate(async () => {
    try {
      const resp = await fetch("/api/auth/me", { credentials: "include" });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  });

  const userId = me?.id ?? me?.user?.id ?? me?.userId ?? null;
  if (userId) return String(userId);

  throw new Error(
    "Could not determine logged-in user id (localStorage and /api/auth/me both failed).",
  );
}

export function uniqueSuffix() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffff).toString(16)}`;
}

export async function submitFormSafely(page: Page) {
  await page.evaluate(() => {
    const f = document.getElementById("post-form");
    if (!f) return;
    const anyF = f as any;
    if (typeof anyF.requestSubmit === "function") {
      anyF.requestSubmit();
    } else if (typeof anyF.submit === "function") {
      anyF.submit();
    } else {
      const btn = (f as HTMLFormElement).querySelector(
        'button[type="submit"], input[type="submit"]',
      ) as HTMLElement | null;
      if (btn) btn.click();
    }
  });
}
