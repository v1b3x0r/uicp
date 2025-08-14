import { useEffect, useState, useRef, useCallback } from 'react';
import { createDrawer, registerDrawerDrag } from '@uikit/core';

/**
 * React hook for drawer - lean modern version
 * @param {Object} [options]
 * @returns {Object}
 */
export function useDrawer(options = {}) {
  const drawerRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    drawerRef.current ??= createDrawer({
      ...options,
      onStateChange: (state) => setIsOpen(state.isOpen)
    });
    setIsOpen(drawerRef.current.isOpen);
    
    return () => drawerRef.current?.cleanup?.();
  }, []);
  
  const drawer = drawerRef.current;
  
  return {
    isOpen,
    open: useCallback(() => drawer?.open(), [drawer]),
    close: useCallback(() => drawer?.close(), [drawer]), 
    toggle: useCallback(() => drawer?.toggle(), [drawer]),
    registerTrigger: useCallback((el) => drawer?.registerTrigger(el) ?? (() => {}), [drawer]),
    registerContent: useCallback((el, opts) => drawer?.registerContent(el, opts) ?? (() => {}), [drawer]),
    registerDrag: useCallback((el, opts) => drawer ? registerDrawerDrag(drawer, el, opts) : (() => {}), [drawer])
  };
}

/**
 * Higher-order hook with ref management
 * @param {Object} [options]
 */
export function useDrawerRefs(options = {}) {
  const triggerRef = useRef();
  const contentRef = useRef();
  const { registerTrigger, registerContent, registerDrag, ...drawer } = useDrawer(options);
  
  useEffect(() => {
    const cleanups = [
      triggerRef.current && registerTrigger(triggerRef.current),
      contentRef.current && registerContent(contentRef.current),
      contentRef.current && registerDrag(contentRef.current)
    ].filter(Boolean);
    
    return () => cleanups.forEach(fn => fn());
  }, [registerTrigger, registerContent, registerDrag]);
  
  return { drawer, triggerRef, contentRef };
}