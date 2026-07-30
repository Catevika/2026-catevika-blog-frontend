import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const originalConsoleError = console.error.bind(console);

console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    message.includes("Not implemented: navigation to another Document")
  ) {
    return;
  }

  originalConsoleError(...args);
};

// Fully typed ResizeObserver mock
class MockResizeObserver implements ResizeObserver {
  private readonly _callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this._callback = callback;
  }

  observe(_target: Element): void {
    // prevent unused variable lint errors
    void _target;

    // simulate an empty observation list
    this._callback([], this);
  }

  unobserve(_target: Element): void {
    // prevent unused variable lint errors
    void _target;
  }

  disconnect(): void {
    // nothing to clean up
  }
}

// Assign safely with correct typing
globalThis.ResizeObserver = MockResizeObserver;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
});
