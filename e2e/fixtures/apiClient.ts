import {
  test as base,
  expect,
  request,
  APIRequestContext,
} from "@playwright/test";

type Fixtures = {
  api: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    const api = await request.newContext({
      baseURL: "http://localhost:4000",
      extraHTTPHeaders: {
        Accept: "application/json",
      },
    });

    await use(api);
    await api.dispose();
  },
});

export { expect };
