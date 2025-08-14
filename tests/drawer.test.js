import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDrawer } from '../packages/core/src/drawer/index.js';

describe('Drawer', () => {
  let drawer;
  
  beforeEach(() => {
    drawer = createDrawer();
  });
  
  it('should create drawer with initial state closed', () => {
    expect(drawer.isOpen).toBe(false);
    expect(drawer.getState().isOpen).toBe(false);
  });
  
  it('should create drawer with initial state open when specified', () => {
    const openDrawer = createDrawer({ initialOpen: true });
    expect(openDrawer.isOpen).toBe(true);
    expect(openDrawer.getState().isOpen).toBe(true);
  });
  
  it('should open drawer', () => {
    drawer.open();
    expect(drawer.isOpen).toBe(true);
  });
  
  it('should close drawer', () => {
    drawer.open();
    drawer.close();
    expect(drawer.isOpen).toBe(false);
  });
  
  it('should toggle drawer state', () => {
    expect(drawer.isOpen).toBe(false);
    
    drawer.toggle();
    expect(drawer.isOpen).toBe(true);
    
    drawer.toggle();
    expect(drawer.isOpen).toBe(false);
  });
  
  it('should not change state when opening already open drawer', () => {
    drawer.open();
    const firstState = drawer.isOpen;
    drawer.open();
    expect(drawer.isOpen).toBe(firstState);
  });
  
  it('should not change state when closing already closed drawer', () => {
    expect(drawer.isOpen).toBe(false);
    drawer.close();
    expect(drawer.isOpen).toBe(false);
  });
  
  it('should call onChange listener when state changes', () => {
    const onChange = vi.fn();
    const cleanup = drawer.onChange(onChange);
    
    drawer.open();
    expect(onChange).toHaveBeenCalledWith({ isOpen: true });
    
    drawer.close();
    expect(onChange).toHaveBeenCalledWith({ isOpen: false });
    
    cleanup();
    drawer.open();
    expect(onChange).toHaveBeenCalledTimes(2);
  });
  
  it('should call lifecycle events', () => {
    const onOpenStart = vi.fn();
    const onOpenEnd = vi.fn();
    const onCloseStart = vi.fn();
    const onCloseEnd = vi.fn();
    
    drawer.onOpenStart(onOpenStart);
    drawer.onOpenEnd(onOpenEnd);
    drawer.onCloseStart(onCloseStart);
    drawer.onCloseEnd(onCloseEnd);
    
    drawer.open();
    expect(onOpenStart).toHaveBeenCalledWith({ isOpen: true });
    
    drawer.close();
    expect(onCloseStart).toHaveBeenCalledWith({ isOpen: false });
  });
  
  it('should handle multiple listeners', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    
    drawer.onChange(listener1);
    drawer.onChange(listener2);
    
    drawer.open();
    
    expect(listener1).toHaveBeenCalledWith({ isOpen: true });
    expect(listener2).toHaveBeenCalledWith({ isOpen: true });
  });
  
  it('should cleanup listeners properly', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    
    const cleanup1 = drawer.onChange(listener1);
    drawer.onChange(listener2);
    
    cleanup1();
    drawer.open();
    
    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledWith({ isOpen: true });
  });
});