import { type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log(
    "⏳ Warming up Render backend instance to prevent cold-start timeouts...",
  );

  const start = Date.now();
  const url = "https://two026-blog-app-backend.onrender.com";

  // Keep pinging Render for up to 60 seconds until it wakes up
  while (Date.now() - start < 60000) {
    try {
      const response = await fetch(url);
      if (
        response.status === 401 ||
        response.status === 200 ||
        response.status === 404
      ) {
        console.log("✅ Render backend is active and responding!");
        return;
      }
    } catch (error) {
      // Server is still sleeping, wait 3 seconds and try again
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  console.warn(
    "⚠️ Warning: Render server warming timed out. Tests will proceed but might be slow.",
  );
}

export default globalSetup;
