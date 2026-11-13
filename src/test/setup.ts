import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

class ObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', ObserverMock);
vi.stubGlobal('ResizeObserver', ObserverMock);
vi.stubGlobal('scrollTo', vi.fn());

if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  // Real WebGL and native-dialog behavior are exercised in Playwright instead.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
}

afterEach(() => {
  cleanup();
  if (typeof document !== 'undefined') {
    localStorage.clear();
    document.documentElement.dataset.theme = 'dark';
  }
});
