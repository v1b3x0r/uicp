import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDrawer } from '@uicp/core';

describe('Drawer (v0.3 API)', () => {
  let drawer;

  beforeEach(() => {
    drawer = createDrawer();
  });

  it('initial state is closed', () => {
    expect(drawer.isOpen).toBe(false);
    expect(drawer.get('value.isOpen')).toBe(false);
  });

  it('initial state can be set open via initialOpen', () => {
    const open = createDrawer({ initialOpen: true });
    expect(open.isOpen).toBe(true);
    expect(open.get('value.isOpen')).toBe(true);
  });

  it('open() sets isOpen=true', () => {
    drawer.open();
    expect(drawer.isOpen).toBe(true);
  });

  it('close() sets isOpen=false', () => {
    drawer.open();
    drawer.close();
    expect(drawer.isOpen).toBe(false);
  });

  it('toggle() flips isOpen', () => {
    expect(drawer.isOpen).toBe(false);
    drawer.toggle();
    expect(drawer.isOpen).toBe(true);
    drawer.toggle();
    expect(drawer.isOpen).toBe(false);
  });

  it('open() on already-open drawer is a no-op', () => {
    drawer.open();
    const onOpen = vi.fn();
    drawer.on('openStart', onOpen);
    drawer.open();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('close() on already-closed drawer is a no-op', () => {
    expect(drawer.isOpen).toBe(false);
    const onClose = vi.fn();
    drawer.on('closeStart', onClose);
    drawer.close();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('valueChange fires on open/close (nested-path emit)', () => {
    const onValueChange = vi.fn();
    const off = drawer.on('valueChange', onValueChange);

    drawer.open();
    expect(onValueChange).toHaveBeenCalled();
    const firstCall = onValueChange.mock.calls[0][0];
    expect(firstCall.value.isOpen).toBe(true);

    drawer.close();
    const lastCall = onValueChange.mock.calls.at(-1)[0];
    expect(lastCall.value.isOpen).toBe(false);

    off();
    onValueChange.mockClear();
    drawer.open();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('lifecycle events fire in order', () => {
    const events = [];
    drawer.on('openStart', () => events.push('openStart'));
    drawer.on('openEnd', () => events.push('openEnd'));
    drawer.on('closeStart', () => events.push('closeStart'));
    drawer.on('closeEnd', () => events.push('closeEnd'));

    drawer.open();
    return new Promise(resolve => queueMicrotask(() => {
      expect(events).toEqual(['openStart', 'openEnd']);
      drawer.close();
      queueMicrotask(() => {
        expect(events).toEqual(['openStart', 'openEnd', 'closeStart', 'closeEnd']);
        resolve();
      });
    }));
  });

  it('multiple valueChange listeners all fire', () => {
    const a = vi.fn();
    const b = vi.fn();
    drawer.on('valueChange', a);
    drawer.on('valueChange', b);
    drawer.open();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('returned unsubscribe removes specific listener only', () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = drawer.on('valueChange', a);
    drawer.on('valueChange', b);

    offA();
    drawer.open();
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('default position is left, size 320', () => {
    expect(drawer.get('value.position')).toBe('left');
    expect(drawer.get('value.size')).toBe(320);
  });

  it('custom position is preserved', () => {
    const bottom = createDrawer({ position: 'bottom', size: '70vh' });
    expect(bottom.get('value.position')).toBe('bottom');
    expect(bottom.get('value.size')).toBe('70vh');
  });
});
