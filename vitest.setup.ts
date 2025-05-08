import "@testing-library/jest-dom";

// Ensure window is available in test environment for libraries that reference window
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// Polyfill for requestAnimationFrame in test environment
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (id: number): void => clearTimeout(id);
}

// Ensure requestAnimationFrame is available on the window object
if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = globalThis.requestAnimationFrame;
  window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
}
