import { useEffect, useState, useRef, useCallback } from 'react';
import { createDrawer, registerDrawerDrag } from '@uikit/core';

/**
 * React hook for drawer
 * @param {Object} [options]
 * @returns {Object}
 */
export function useDrawer(options = {}) {
  const drawerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!drawerRef.current) {
      drawerRef.current = createDrawer({
        ...options,
        onStateChange: (state) => setIsOpen(state.isOpen)
      });
      setIsOpen(drawerRef.current.isOpen);
    }
    
    return () => {
      if (drawerRef.current && drawerRef.current.cleanup) {
        drawerRef.current.cleanup();
      }
    };
  }, []);
  
  const open = useCallback(() => {
    if (drawerRef.current) drawerRef.current.open();
  }, []);
  
  const close = useCallback(() => {
    if (drawerRef.current) drawerRef.current.close();
  }, []);
  
  const toggle = useCallback(() => {
    if (drawerRef.current) drawerRef.current.toggle();
  }, []);
  
  const registerTrigger = useCallback((element) => {
    if (drawerRef.current && element) {
      return drawerRef.current.registerTrigger(element);
    }
    return () => {};
  }, []);
  
  const registerContent = useCallback((element, opts) => {
    if (drawerRef.current && element) {
      return drawerRef.current.registerContent(element, opts);
    }
    return () => {};
  }, []);
  
  const registerDrag = useCallback((element, opts) => {
    if (drawerRef.current && element) {
      return registerDrawerDrag(drawerRef.current, element, opts);
    }
    return () => {};
  }, []);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    registerTrigger,
    registerContent,
    registerDrag,
    drawer: drawerRef.current
  };
}

/**
 * Hook for trigger ref
 */
export function useDrawerTrigger(drawer) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current && drawer && drawer.registerTrigger) {
      const cleanup = drawer.registerTrigger(ref.current);
      return cleanup;
    }
  }, [drawer]);
  
  return ref;
}

/**
 * Hook for content ref
 */
export function useDrawerContent(drawer, options = {}) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current && drawer && drawer.registerContent) {
      const cleanup = drawer.registerContent(ref.current, options);
      return cleanup;
    }
  }, [drawer, options]);
  
  return ref;
}

/**
 * Hook for drag gesture
 */
export function useDrawerDrag(drawer, options = {}) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current && drawer) {
      const cleanup = registerDrawerDrag(drawer.drawer || drawer, ref.current, options);
      return cleanup;
    }
  }, [drawer, options]);
  
  return ref;
}

export { createDrawer, registerDrawerDrag } from '@uikit/core';