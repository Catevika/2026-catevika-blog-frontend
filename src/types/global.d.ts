export {};

declare global {
  interface Window {
    /** File placed on the window for drag/drop handoff between components */
    __draggedImageFile?: File | undefined;
  }
}
