import '@testing-library/dom';

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(() => callback(Date.now()), 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Add custom matchers
expect.extend({
  toHaveAttribute(received, attribute, value) {
    const hasAttribute = received.hasAttribute(attribute);
    const actualValue = received.getAttribute(attribute);
    
    if (value === undefined) {
      return {
        pass: hasAttribute,
        message: () => hasAttribute 
          ? `Expected element not to have attribute ${attribute}`
          : `Expected element to have attribute ${attribute}`
      };
    }
    
    return {
      pass: hasAttribute && actualValue === value,
      message: () => hasAttribute
        ? `Expected attribute ${attribute} to be "${value}" but got "${actualValue}"`
        : `Expected element to have attribute ${attribute}="${value}"`
    };
  }
});