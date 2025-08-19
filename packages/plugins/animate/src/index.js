/**
 * Universal UI Protocol - Animation Plugin
 * Spring physics animation system for smooth transitions
 */

/**
 * Spring physics configuration
 * @typedef {Object} SpringConfig
 * @property {number} tension - Spring tension (default: 170)
 * @property {number} friction - Spring friction (default: 26)
 * @property {number} precision - Animation precision threshold (default: 0.01)
 */

/**
 * Animation plugin configuration
 * @typedef {Object} AnimateConfig
 * @property {number} duration - Animation duration in ms (default: 300)
 * @property {string|SpringConfig} easing - Easing function or spring config
 * @property {boolean} physics - Enable spring physics (default: true)
 * @property {string[]} properties - Properties to animate (auto-detect if empty)
 */

/**
 * Creates animation plugin with spring physics
 * @param {AnimateConfig} config Animation configuration
 * @returns {Function} Plugin function
 */
export function animatePlugin(config = {}) {
  const {
    duration = 300,
    easing = { tension: 170, friction: 26, precision: 0.01 },
    physics = true,
    properties = []
  } = config;

  return function plugin(primitive) {
    // Verify primitive supports animation
    if (!primitive._type || typeof primitive.on !== 'function') {
      console.warn('[AnimatePlugin] Primitive does not support animation');
      return primitive;
    }

    // Store original state setter
    const originalSet = primitive.set;
    const animations = new Map();

    /**
     * Spring physics animation
     */
    function springAnimation(from, to, callback, onComplete) {
      const spring = typeof easing === 'object' ? easing : { tension: 170, friction: 26, precision: 0.01 };
      
      let velocity = 0;
      let current = from;
      let frameId;

      function tick() {
        const force = -spring.tension * (current - to);
        const damping = -spring.friction * velocity;
        const acceleration = force + damping;

        velocity += acceleration * 0.016; // 16ms frame
        current += velocity * 0.016;

        callback(current);

        // Check if animation is complete
        if (Math.abs(velocity) < spring.precision && Math.abs(current - to) < spring.precision) {
          callback(to);
          onComplete?.();
        } else {
          frameId = requestAnimationFrame(tick);
        }
      }

      tick();

      return () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    /**
     * Enhanced set method with animation
     */
    primitive.set = function(path, value, options = {}) {
      const animateThis = options.animate !== false && (properties.length === 0 || properties.includes(path));
      
      if (!animateThis || !physics) {
        return originalSet.call(this, path, value, options);
      }

      // Get current value
      const currentValue = primitive.get(path);
      
      // Handle numeric values only for now
      if (typeof currentValue !== 'number' || typeof value !== 'number') {
        return originalSet.call(this, path, value, options);
      }

      // Cancel existing animation for this path
      if (animations.has(path)) {
        animations.get(path)();
        animations.delete(path);
      }

      // Start new animation
      const cancelAnimation = springAnimation(
        currentValue,
        value,
        (animatedValue) => {
          originalSet.call(primitive, path, animatedValue, { ...options, animate: false });
        },
        () => {
          animations.delete(path);
          // Emit animation complete event
          primitive.emit?.('animationComplete', { path, value });
        }
      );

      animations.set(path, cancelAnimation);
      return primitive;
    };

    // Enhanced open/close methods with animation
    const originalOpen = primitive.open;
    const originalClose = primitive.close;

    if (originalOpen) {
      primitive.open = function(options = {}) {
        if (options.animate === false) {
          return originalOpen.call(this, options);
        }
        
        // Animate opacity and scale for visual feedback
        this.set('computed.opacity', 0, { animate: false });
        this.set('computed.scale', 0.95, { animate: false });
        
        const result = originalOpen.call(this, options);
        
        // Animate to visible state
        setTimeout(() => {
          this.set('computed.opacity', 1);
          this.set('computed.scale', 1);
        }, 16);
        
        return result;
      };
    }

    if (originalClose) {
      primitive.close = function(options = {}) {
        if (options.animate === false) {
          return originalClose.call(this, options);
        }
        
        // Animate to hidden state
        this.set('computed.opacity', 0);
        this.set('computed.scale', 0.95);
        
        // Close after animation
        setTimeout(() => {
          originalClose.call(this, options);
        }, duration * 0.8); // Close slightly before animation ends
        
        return this;
      };
    }

    // Cleanup function
    const originalDestroy = primitive.destroy;
    primitive.destroy = function() {
      // Cancel all animations
      animations.forEach(cancel => cancel());
      animations.clear();
      
      if (originalDestroy) {
        return originalDestroy.call(this);
      }
    };

    return primitive;
  };
}

// Named exports for convenience
export { animatePlugin as default };

/**
 * Pre-configured animation presets
 */
export const presets = {
  // Quick and snappy
  quick: {
    duration: 150,
    easing: { tension: 300, friction: 30, precision: 0.01 },
    physics: true
  },
  
  // Smooth and natural
  smooth: {
    duration: 300,
    easing: { tension: 170, friction: 26, precision: 0.01 },
    physics: true
  },
  
  // Bouncy and playful
  bouncy: {
    duration: 500,
    easing: { tension: 200, friction: 12, precision: 0.01 },
    physics: true
  },
  
  // Gentle and slow
  gentle: {
    duration: 600,
    easing: { tension: 120, friction: 40, precision: 0.01 },
    physics: true
  }
};

/**
 * Create preset animation plugins
 */
export const quickAnimate = () => animatePlugin(presets.quick);
export const smoothAnimate = () => animatePlugin(presets.smooth);
export const bouncyAnimate = () => animatePlugin(presets.bouncy);
export const gentleAnimate = () => animatePlugin(presets.gentle);