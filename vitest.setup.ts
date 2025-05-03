import "@testing-library/jest-dom";

// Polyfill for requestAnimationFrame in test environment
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (id: number): void => clearTimeout(id);
}
