import '@testing-library/jest-dom';
import { vi } from 'vitest';
import '../vitest.setup';

// Polyfill requestAnimationFrame for fake timers
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: (cb: FrameRequestCallback) => setTimeout(cb, 0),
});

// Polyfill navigator.clipboard for user-event
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Polyfill window.requestAnimationFrame/cancelAnimationFrame for libraries like ApexCharts
if (typeof window !== 'undefined') {
    window.requestAnimationFrame = globalThis.requestAnimationFrame;
    window.cancelAnimationFrame = (id: number) => clearTimeout(id);
} 