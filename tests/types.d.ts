export {};

declare global {
  interface ResizeObserverEntry {
    target: Element;
    contentRect: DOMRectReadOnly;
  }

  type ResizeObserverCallback = (
    entries: ResizeObserverEntry[],
    observer: ResizeObserver,
  ) => void;

  class ResizeObserver {
    constructor(callback: ResizeObserverCallback);
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
  }
}
