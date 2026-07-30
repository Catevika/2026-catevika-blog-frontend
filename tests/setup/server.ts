import { setupServer } from "msw/node";
import { vi } from "vitest";
import { postViewHandlers } from "./postViewHandlers";
import { postListHandlers } from "./postListHandlers";
import { postFeedHandlers } from "./postFeedHandlers";
import { commentHandlers } from "./commentHandlers";

// Silence scrollTo warnings
window.scrollTo = vi.fn();

export const server = setupServer(
  ...postViewHandlers,
  ...postListHandlers,
  ...postFeedHandlers,
  ...commentHandlers,
);
