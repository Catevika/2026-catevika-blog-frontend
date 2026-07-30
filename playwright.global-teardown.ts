import { request } from "@playwright/test";

async function globalTeardown() {
  const api = await request.newContext({
    baseURL: "http://localhost:5173",
  });

  // Reset DB after the entire suite
  await api.post("/api/test/reset");

  await api.dispose();
}

export default globalTeardown;
