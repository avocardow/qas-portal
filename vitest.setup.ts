import "@testing-library/jest-dom";

// Ensure window is available in test environment for libraries that reference window
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// Override requestAnimationFrame to synchronous execution to prevent timers from lingering
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    callback(0);
    return 0;
  };
  window.cancelAnimationFrame = (_id: number): void => {};
  globalThis.requestAnimationFrame = window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame;
}
