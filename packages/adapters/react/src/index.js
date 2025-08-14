/**
 * @uip/adapter-react - React Hooks for Universal UI Protocol
 * Clean, efficient React integration with full TypeScript support
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { createDrawer } from '@uip/core';

/**
 * React hook for drawer with automatic state synchronization
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Array of plugins to apply
 * @returns {Object} Drawer API with React integration
 */
export function useDrawer(options = {}, plugins = []) {
  const drawerRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!drawerRef.current) {
      // Create drawer with state sync
      drawerRef.current = createDrawer({
        ...options,
        onStateChange: (state) => setIsOpen(state.isOpen)
      });
      
      // Apply plugins
      plugins.forEach(plugin => {
        if (plugin?.register) {
          plugin.register(drawerRef.current);
        }
      });
      
      setIsOpen(drawerRef.current.isOpen);
    }
    
    return () => {
      // Cleanup is handled by drawer registration methods
    };
  }, []); // Empty deps - drawer created once
  
  const drawer = drawerRef.current;
  
  return {
    isOpen,
    open: useCallback(() => drawer?.open(), [drawer]),
    close: useCallback(() => drawer?.close(), [drawer]), 
    toggle: useCallback(() => drawer?.toggle(), [drawer]),
    
    // Registration methods with React-friendly returns
    registerTrigger: useCallback((element) => 
      drawer?.registerTrigger(element) ?? (() => {}), [drawer]),
    registerContent: useCallback((element, opts) => 
      drawer?.registerContent(element, opts) ?? (() => {}), [drawer]),
    
    // Core drawer for advanced usage
    drawer
  };
}

/**
 * Hook with automatic ref management for common use case
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Array of plugins to apply
 */
export function useDrawerRefs(options = {}, plugins = []) {
  const triggerRef = useRef();
  const contentRef = useRef();
  const { registerTrigger, registerContent, ...drawer } = useDrawer(options, plugins);
  
  useEffect(() => {
    const cleanups = [];
    
    if (triggerRef.current) {
      cleanups.push(registerTrigger(triggerRef.current));
    }
    
    if (contentRef.current) {
      cleanups.push(registerContent(contentRef.current));
    }
    
    return () => cleanups.forEach(cleanup => cleanup());
  }, [registerTrigger, registerContent]);
  
  return { 
    ...drawer, 
    triggerRef, 
    contentRef 
  };
}

/**
 * Plugin composition hook
 * @param {Array} plugins - Array of plugins
 * @returns {Array} Processed plugins
 */
export function usePlugins(plugins = []) {
  return useRef(
    plugins.map(plugin => 
      typeof plugin === 'function' ? plugin() : plugin
    )
  ).current;
}

// Convenience exports
export { createDrawer } from '@uip/core';