import { request } from "@playwright/test";

async function globalSetup() {
  const api = await request.newContext({
    baseURL: "http://localhost:5173",
  });

  // Reset DB before the entire suite
  await api.post("/api/test/reset");

  await api.dispose();
}

export default globalSetup;
