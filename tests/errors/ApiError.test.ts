import { describe, it, expect } from "vitest";
import { ApiError } from "@/errors/ApiError";

describe("ApiError", () => {
  it("should create error with message, status, and data", () => {
    const error = new ApiError("Not found", 404, { id: "123" });

    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({ id: "123" });
    expect(error.name).toBe("ApiError");
  });

  it("should have null data when not provided", () => {
    const error = new ApiError("Something went wrong", 500);

    expect(error.message).toBe("Something went wrong");
    expect(error.status).toBe(500);
    expect(error.data).toBeNull();
    expect(error.name).toBe("ApiError");
  });

  it("should be an instance of Error", () => {
    const error = new ApiError("Test error", 400);

    expect(error instanceof Error).toBe(true);
    expect(error instanceof ApiError).toBe(true);
  });

  it("should have stack trace", () => {
    const error = new ApiError("Test error", 400);

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe("string");
  });
});
