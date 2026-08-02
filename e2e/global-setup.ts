import { type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log(
    "⏳ Warming up Render backend instance to prevent cold-start timeouts...",
  );

  const start = Date.now();
  const url = "https://two026-blog-app-backend.onrender.com";

  // Keep pinging Render for up to 60 seconds until it wakes up
  while (Date.now() - start < 60000) {
    // Create an abort controller to prevent individual requests from hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      // Any HTTP response status means the server container is fully awake and routing traffic
      if (response.status >= 200 && response.status < 500) {
        console.log(
          `✅ Render backend is active and responding with status: ${response.status}`,
        );
        return;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // Quietly wait 3 seconds before trying again if server is sleeping or connection is refused
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.warn(
    "⚠️ Warning: Render server warming timed out. Tests will proceed but might be slow.",
  );
}

export default globalSetup;
