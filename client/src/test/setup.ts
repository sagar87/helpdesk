import "@testing-library/jest-dom/vitest";

// Polyfill pointer capture methods missing in jsdom (required by Radix UI Select)
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// Polyfill scrollIntoView missing in jsdom (used by Radix UI)
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
